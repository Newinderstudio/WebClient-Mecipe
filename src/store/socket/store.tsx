import { create } from "zustand";
import { io, Socket } from 'socket.io-client';
import { RoomDataItem } from "@/common/socket/types";

export interface RoomUser {
  socketId: string;
  joinedAt: string;
}

// 실시간 데이터는 ref로 관리 (전역 상태 밖에서)
let roomDataHistoryRef: RoomDataItem[] = [];
const roomDataListeners = new Set<(data: RoomDataItem[]) => void>();

interface SocketStore {
  // Socket 인스턴스
  socket: Socket | null;
  
  // Socket 상태
  isConnected: boolean;
  clientId: string | null;
  currentRoomId: string | null;
  clientsInRoom: number;
  isInRoom: boolean;

  // 사용자 정보
  users: RoomUser[];
  userCount: number;

  // Socket 초기화
  initSocket: (serverUrl: string, path: string) => void;
  
  // Room 관리
  joinRoom: (roomId: string) => Promise<{success: boolean; message: string}>;
  leaveRoom: () => Promise<{success: boolean; message: string}>;
  
  // 데이터 브로드캐스트
  broadcastPlayerTransform: (transform: { 
    position: { x: number; y: number; z: number }; 
    rotation: { x: number; y: number; z: number };
  }) => void;
  broadcastPlayerAnimation: (animation: string) => void;
  broadcastCustomEvent: (type: string, data: unknown) => void;
  
  // 실시간 데이터 이벤트 구독 (ref 기반)
  subscribeToRoomData: (callback: (data: RoomDataItem[]) => void) => () => void;
  
  // 데이터 조회 (ref에서 직접 읽기, 리렌더링 없음)
  getPlayerTransforms: () => RoomDataItem[];
  getPlayerAnimations: () => RoomDataItem[];
  getRecentData: (count?: number) => RoomDataItem[];
  clearHistory: () => void;
  
  // 초기화
  disconnect: () => void;
}

const initialState = {
  socket: null,
  isConnected: false,
  clientId: null,
  currentRoomId: null,
  clientsInRoom: 0,
  isInRoom: false,
  users: [],
  userCount: 0,
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  ...initialState,

  // Socket 초기화
  initSocket: (serverUrl: string, path: string) => {
    // 이미 연결되어 있으면 무시
    if (get().socket) {
      console.log('Socket already initialized');
      return;
    }

    console.log('🔌 Initializing socket:', serverUrl, 'path:', path);

    const newSocket = io(serverUrl, {
      path: path ? `/${path}/` : '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // 연결 이벤트
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      set({ 
        socket: newSocket,
        isConnected: true, 
        clientId: newSocket.id 
      });
    });

    // 연결 해제 이벤트
    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      set({
        isConnected: false,
        currentRoomId: null,
        clientsInRoom: 0,
        isInRoom: false,
        clientId: null,
      });
    });

    // 연결 오류 이벤트
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    // User Joined 이벤트
    newSocket.on('userJoined', (payload: { socketId: string; roomId: string; timestamp: string }) => {
      console.log('👤 User joined:', payload);
      set((state) => ({
        users: [...state.users, { socketId: payload.socketId, joinedAt: payload.timestamp }],
        userCount: state.userCount + 1,
      }));
    });

    // User Left 이벤트
    newSocket.on('userLeft', (payload: { socketId: string; roomId: string; timestamp: string }) => {
      console.log('👋 User left:', payload);
      set((state) => ({
        users: state.users.filter(u => u.socketId !== payload.socketId),
        userCount: Math.max(0, state.userCount - 1),
      }));
    });

    
    // User Disconnected 이벤트
    newSocket.on('userDisconnected', (payload: { socketId: string; roomId: string; timestamp: string }) => {
      console.log('🛑 User disconnected:', payload);
      set((state) => {
        const users = state.users.filter(u => u.socketId !== payload.socketId);
        const userCount = Math.max(0, state.userCount - 1);
        if(userCount === state.userCount && users.every(u => state.users.includes(u))) {
          return {
            users: state.users,
            userCount: state.userCount,
          }
        }
        return ({
          users: users,
          userCount: userCount,
        })
      });
    });

    // Room Data 이벤트 (ref로 관리, 전역 상태 변경 없음!)
    newSocket.on('roomBroadcast', (payload: { roomId: string; timestamp: number; data: RoomDataItem[] }) => {
      // ref에만 저장 (리렌더링 없음)
      roomDataHistoryRef = [...roomDataHistoryRef, ...payload.data];
      
      // 최대 100개까지만 유지
      if (roomDataHistoryRef.length > 100) {
        roomDataHistoryRef = roomDataHistoryRef.slice(-100);
      }
      
      // 구독자들에게 알림
      roomDataListeners.forEach(listener => listener(payload.data));
    });

    set({ socket: newSocket });
  },

  // Room 참가
  joinRoom: async (roomId: string) => {
    const { socket, isInRoom } = get();
    
    if (!socket || !socket.connected) {
      return { success: false, message: 'Socket not connected' };
    }

    if (isInRoom) {
      return { success: false, message: 'Already in a room' };
    }

    return new Promise((resolve) => {
      socket.emit('joinRoom', { roomId }, (response: { success: boolean; roomId?: string; clientsInRoom?: number; message: string }) => {
        if (response.success) {
          set({
            isInRoom: true,
            currentRoomId: response.roomId || roomId,
            clientsInRoom: response.clientsInRoom || 1,
          });
        }
        resolve(response);
      });
    });
  },

  // Room 나가기
  leaveRoom: async () => {
    const { socket, isInRoom } = get();
    
    if (!socket || !socket.connected) {
      return { success: false, message: 'Socket not connected' };
    }

    if (!isInRoom) {
      return { success: false, message: 'Not in a room' };
    }

    return new Promise((resolve) => {
      socket.emit('leaveRoom', {}, (response: { success: boolean; message: string }) => {
        if (response.success) {
          set({
            isInRoom: false,
            currentRoomId: null,
            clientsInRoom: 0,
          });
        }
        resolve(response);
      });
    });
  },

  // Transform 브로드캐스트
  broadcastPlayerTransform: (transform) => {
    const { socket, isInRoom } = get();
    if (!socket || !isInRoom) return;
    
    socket.emit('boradcastRoomData', { 
      type: 'playerTransform', 
      data: transform 
    });
  },

  // Animation 브로드캐스트
  broadcastPlayerAnimation: (animation) => {
    const { socket, isInRoom } = get();
    if (!socket || !isInRoom) return;
    
    socket.emit('boradcastRoomData', { 
      type: 'playerAnimation', 
      data: { animation } 
    });
  },

  // 커스텀 이벤트 브로드캐스트
  broadcastCustomEvent: (type, data) => {
    const { socket, isInRoom } = get();
    if (!socket || !isInRoom) return;
    
    socket.emit('boradcastRoomData', { type, data });
  },

  // 실시간 데이터 이벤트 구독
  subscribeToRoomData: (callback) => {
    roomDataListeners.add(callback);
    
    // 정리 함수 반환
    return () => {
      roomDataListeners.delete(callback);
    };
  },

  // Transform 데이터 조회 (ref에서 직접 읽기)
  getPlayerTransforms: () => {
    return roomDataHistoryRef.filter(item => item.type === 'playerTransform');
  },

  // Animation 데이터 조회 (ref에서 직접 읽기)
  getPlayerAnimations: () => {
    return roomDataHistoryRef.filter(item => item.type === 'playerAnimation');
  },

  // 최근 데이터 조회 (ref에서 직접 읽기)
  getRecentData: (count = 10) => {
    return roomDataHistoryRef.slice(-count);
  },

  // 히스토리 초기화
  clearHistory: () => {
    roomDataHistoryRef = [];
  },

  // Socket 연결 해제
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set(initialState);
    }
    
    // ref 초기화
    roomDataHistoryRef = [];
    roomDataListeners.clear();
  },
}));

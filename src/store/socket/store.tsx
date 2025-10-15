import { create } from "zustand";
import { io, Socket } from 'socket.io-client';
import { BroadcastRoomDataRequest, ClientMessage, BroadcastDatType, UserDisconnectedResponse, UserJoinedResponse, UserLeftResponse, BroadcastRoomDataResponse, JoinRoomRequest, JoinRoomAck, LeaveRoomAck, LeaveRoomRequest, PlayerTransformData, PlayerAnimationData } from "@/util/socket/socket-message-types";
import { ClientToServerListenerType, ServerToClientListenerType } from "@/util/socket/socket-event-type";

export interface RoomUser {
  clientId: string;
  joinedAt: string;
}

// 실시간 데이터는 ref로 관리 (전역 상태 밖에서)
let roomDataHistoryRef: ClientMessage[] = [];
const roomDataListeners = new Set<(data: ClientMessage[]) => void>();
const initializeEnvironmentListeners = new Set<(data: ClientMessage[]) => void>();

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

  // Initialize Environment 데이터
  initializeEnvironment: ClientMessage[];

  // Socket 초기화
  initSocket: (serverUrl: string, path: string) => void;

  // Room 관리
  joinRoom: (roomId: string) => Promise<{ success: boolean; message: string }>;
  leaveRoom: () => Promise<{ success: boolean; message: string }>;

  // 데이터 브로드캐스트
  broadcastPlayerTransform: (transform: PlayerTransformData) => void;
  broadcastPlayerAnimation: (animation: string) => void;
  broadcastCustomEvent: (type: string, data: unknown) => void;

  // 실시간 데이터 이벤트 구독 (ref 기반)
  subscribeToRoomData: (callback: (data: ClientMessage[]) => void) => () => void;
  
  // Initialize Environment 이벤트 구독
  subscribeInitializeEnvironment: (callback: (data: ClientMessage[]) => void) => () => void;

  // 데이터 조회 (ref에서 직접 읽기, 리렌더링 없음)
  getPlayerTransforms: () => ClientMessage[];
  getPlayerAnimations: () => ClientMessage[];
  getRecentData: (count?: number) => ClientMessage[];
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
  initializeEnvironment: [],
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
    newSocket.on(ServerToClientListenerType.CONNECT, () => {
      console.log('✅ Socket connected:', newSocket.id);
      set({
        socket: newSocket,
        isConnected: true,
        clientId: newSocket.id
      });
    });

    // 연결 해제 이벤트
    newSocket.on(ServerToClientListenerType.DISCONNECT, (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      set({
        isConnected: false,
        currentRoomId: null,
        clientsInRoom: 0,
        isInRoom: false,
        clientId: null,
      });
    });


    // 연결 오류 이벤트
    newSocket.on(ServerToClientListenerType.CONNECT_ERROR, (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    // User 연결 해제 이벤트
    newSocket.on(ServerToClientListenerType.USER_DISCONNECTED, (payload: UserDisconnectedResponse) => {
      console.log(`👋 Socket disconnected: ${payload.socketId}`);
      set((state) => {
        const users = state.users.filter(u => u.clientId !== payload.socketId);
        const userCount = users.length;
        return {
          users: users,
          userCount: userCount,
        }
      });
    });

    // User Joined 이벤트
    newSocket.on(ServerToClientListenerType.USER_JOINED, (payload: UserJoinedResponse) => {
      console.log('👤 User joined:', payload.socketId);
      set((state) => {
        const users: RoomUser[] = [];
        if (!users.find(u => u.clientId === payload.socketId)) {
          users.push({ clientId: payload.socketId, joinedAt: payload.timestamp });
        }

        const userCount = users.length;
        return {
          users: [...state.users, ...users],
          userCount: userCount,
        }
      });
    });

    // User Left 이벤트
    newSocket.on(ServerToClientListenerType.USER_LEFT, (payload: UserLeftResponse) => {
      console.log('👋 User left:', payload);
      set((state) => {
        const users = state.users.filter(u => u.clientId !== payload.socketId);
        const userCount = users.length;
        return {
          users: users,
          userCount: userCount,
        }
      });
    });


    // User Disconnected 이벤트
    newSocket.on(ServerToClientListenerType.USER_DISCONNECTED, (payload: UserDisconnectedResponse) => {
      console.log('🛑 User disconnected:', payload);
      set((state) => {
        const users = state.users.filter(u => u.clientId !== payload.socketId);
        const userCount = Math.max(0, state.userCount - 1);
        if (userCount === state.userCount && users.every(u => state.users.includes(u))) {
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
    newSocket.on(ServerToClientListenerType.ROOM_BROADCAST, (payload: BroadcastRoomDataResponse) => {
      // ref에만 저장 (리렌더링 없음)
      roomDataHistoryRef = [...roomDataHistoryRef, ...payload.messages];

      // 최대 100개까지만 유지
      if (roomDataHistoryRef.length > 100) {
        roomDataHistoryRef = roomDataHistoryRef.slice(-100);
      }
      // 구독자들에게 알림
      roomDataListeners.forEach(listener => listener(payload.messages));
    });

    newSocket.on(ServerToClientListenerType.INITIALIZE_ENV, (payload: BroadcastRoomDataResponse) => {
      set({ initializeEnvironment: payload.messages });
      // 구독자들에게 알림. 초기화 목적
      initializeEnvironmentListeners.forEach(listener => listener(payload.messages));
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
      const request: JoinRoomRequest = { roomId };
      socket.emit(ClientToServerListenerType.USER_JOINED, request, (ack: JoinRoomAck) => {
        if (ack.success) {
          set(() => {
            const users = ack.clientsInRoom.map(client => ({ clientId: client.socketId, joinedAt: client.joinAt }));

            const userCount = users.length;
            return {
              isInRoom: true,
              currentRoomId: ack.roomId || roomId,
              clientsInRoom: ack.clientsInRoom?.length || 1,
              users: users,
              userCount: userCount,
            }
          });
        }
        resolve(ack);
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
      const request: LeaveRoomRequest = {};
      socket.emit(ClientToServerListenerType.USER_LEFT, request, (response: LeaveRoomAck) => {
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

    const request: BroadcastRoomDataRequest<PlayerTransformData> = {
      type: BroadcastDatType.PLAYER_TRANSFORM,
      data: transform
    };

    socket.emit(ClientToServerListenerType.ROOM_BROADCAST, request);
  },

  // Animation 브로드캐스트
  broadcastPlayerAnimation: (animation) => {
    const { socket, isInRoom } = get();
    if (!socket || !isInRoom) return;

    const request: BroadcastRoomDataRequest<PlayerAnimationData> = {
      type: BroadcastDatType.PLAYER_ANIMATION,
      data: { animation }
    };

    socket.emit(ClientToServerListenerType.ROOM_BROADCAST, request);
  },

  // 커스텀 이벤트 브로드캐스트
  broadcastCustomEvent: (type, data) => {
    const { socket, isInRoom } = get();
    if (!socket || !isInRoom) return;

    socket.emit(ClientToServerListenerType.ROOM_BROADCAST, { type, data });
  },

  // 실시간 데이터 이벤트 구독
  subscribeToRoomData: (callback) => {
    roomDataListeners.add(callback);

    // 정리 함수 반환
    return () => {
      roomDataListeners.delete(callback);
    };
  },

  subscribeInitializeEnvironment: (callback) => {
    initializeEnvironmentListeners.add(callback);
    return () => {
      initializeEnvironmentListeners.delete(callback);
    };
  },

  // Transform 데이터 조회 (ref에서 직접 읽기)
  getPlayerTransforms: () => {
    return roomDataHistoryRef.filter(item => item.type === BroadcastDatType.PLAYER_TRANSFORM);
  },

  // Animation 데이터 조회 (ref에서 직접 읽기)
  getPlayerAnimations: () => {
    return roomDataHistoryRef.filter(item => item.type === BroadcastDatType.PLAYER_ANIMATION);
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

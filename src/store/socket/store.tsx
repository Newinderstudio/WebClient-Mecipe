import { create } from "zustand";
import { io, Socket } from 'socket.io-client';
import { BroadcastRoomDataRequest, ClientMessage, BroadcastDatType, UserDisconnectedResponse, BroadcastRoomDataResponse, JoinRoomRequest, JoinRoomAck, LeaveRoomAck, LeaveRoomRequest, PlayerTransformData, PlayerAnimationData, HealthCheckResponse } from "@/util/socket/socket-message-types";
import { ClientToServerListenerType, ServerToClientListenerType } from "@/util/socket/socket-event-type";
import { SESSION_STORAGE_KEY } from "@/util/constants/session-storage-key";

export interface RoomUser {
  clientId: string;
  joinedAt: string;
  sessionToken: string;
}

// 실시간 데이터는 ref로 관리 (전역 상태 밖에서)
let roomDataHistoryRef: ClientMessage[] = [];
// 임시 broadcast 데이터
let temporaryBroadcastData: ClientMessage[] = [];
const roomDataListeners = new Set<(data: ClientMessage[]) => void>();
const initializeEnvironmentListeners = new Set<(data: ClientMessage[]) => void>();

interface SocketStore {
  // Socket 인스턴스
  socket: Socket | null;

  // Socket 상태
  isConnected: boolean;
  clientId: string | null;
  sessionToken: string | null;
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

  healthCheck: () => Promise<HealthCheckResponse>;

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

  addUser: (user: RoomUser) => void;
  removeUser: (user: RoomUser) => void;

  restoreUsers: (users: RoomUser[]) => void;

  // 초기화
  disconnect: () => void;
}

const initialState = {
  socket: null,
  isConnected: false,
  clientId: null,
  sessionToken: null,
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
    const currentSocket = get().socket;
    
    // 기존 소켓이 있고 연결되어 있으면 무시
    if (currentSocket && currentSocket.connected) {
      console.log('🔌 Socket already connected, skipping initialization');
      return;
    }

    // 기존 소켓이 있으면 정리
    if (currentSocket) {
      console.log('🔌 Cleaning up existing socket before reinitializing');
      currentSocket.removeAllListeners();
      currentSocket.disconnect();
    }

    const sessionToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
    console.log('🔌 Initializing socket:', serverUrl, 'path:', path, 'sessionToken:', sessionToken);

    if(sessionToken) {
      set({ sessionToken: sessionToken });
    }

    const newSocket = io(serverUrl, {
      path: path ? `/${path}/` : '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: {
        sessionToken: sessionToken
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: true, // 강제로 새 연결 생성
    });

    // 세션 토큰 이벤트 (CONNECT 핸들러 밖으로 이동하여 한 번만 등록)
    newSocket.on(ServerToClientListenerType.SESSION_TOKEN, (data: {
      sessionToken: string;
      socketId: string;
      restored: boolean;
      roomId: string | null;
    }) => {
      // 세션 토큰 저장
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.sessionToken);

      newSocket.auth = {
        sessionToken: data.sessionToken
      }

      if (data.restored && data.roomId) {
        console.log(`✅ Session restored! Rejoined room: ${data.roomId}`);
        // 이미 룸에 재입장되어 있음
        set((state) => ({ 
          ...state, 
          sessionToken: data.sessionToken,
          isInRoom: true,
          currentRoomId: data.roomId,
        }));
      } else {
        // 새 세션이므로 룸 입장 필요
        set((state) => ({ ...state, sessionToken: data.sessionToken }));
      }
    });

    // 연결 이벤트
    newSocket.on(ServerToClientListenerType.CONNECT, () => {
      console.log('✅ Socket connected:', newSocket.id);
      
      // 기존 sessionToken이 있으면 바로 사용 (서버가 SESSION_TOKEN 이벤트를 보내지 않는 경우 대비)
      const existingToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (existingToken && !get().sessionToken) {
        set((state) => ({ ...state, sessionToken: existingToken }));
      }
      
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

    // 재연결 시도 이벤트
    newSocket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    // 재연결 성공 이벤트
    newSocket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    // 재연결 실패 이벤트
    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
    });

    // 연결 오류 이벤트
    newSocket.on(ServerToClientListenerType.CONNECT_ERROR, (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    // User Disconnected 이벤트
    newSocket.on(ServerToClientListenerType.USER_DISCONNECTED, (payload: UserDisconnectedResponse) => {
      console.log('🛑 User disconnected:', payload);
    });

    // Room Data 이벤트 (ref로 관리, 전역 상태 변경 없음!)
    newSocket.on(ServerToClientListenerType.ROOM_BROADCAST, (payload: BroadcastRoomDataResponse) => {
      // ref에만 저장 (리렌더링 없음)
      roomDataHistoryRef = [...roomDataHistoryRef, ...payload.messages];

      if (roomDataListeners.size === 0) {
        temporaryBroadcastData.push(...payload.messages);
      }

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
      
      // 타임아웃 설정 (10초)
      const timeout = setTimeout(() => {
        console.error('❌ joinRoom timeout: No ACK received within 10 seconds');
        resolve({ success: false, message: 'Timeout: No response from server' });
      }, 10000);

      socket.emit(ClientToServerListenerType.USER_JOINED, request, (ack: JoinRoomAck) => {
        clearTimeout(timeout);
        
        if (ack.success) {
          const users = ack.clientsInRoom.map(client => ({ clientId: client.socketId, joinedAt: client.joinAt, sessionToken: client.sessionToken }));
          const userCount = users.length;
          console.log('👤 User joined:', users, 'userCount:', userCount);
          
          set(() => {
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

  healthCheck: async (): Promise<HealthCheckResponse> => {
    const { socket } = get();
    if (!socket || !socket.connected) {
      return { success: false, message: 'Socket not connected' };
    }
    return new Promise((resolve) => {
      socket.emit(ClientToServerListenerType.HEALTH_CHECK, {}, (response: HealthCheckResponse) => {
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
    if (temporaryBroadcastData.length > 0 && roomDataListeners.size === 0) {
      callback(temporaryBroadcastData);
      temporaryBroadcastData = [];
    }
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

  addUser: (user: RoomUser) => {
    set((state) => {
      const users = [...state.users];
      const findIndex = users.findIndex(u => u.sessionToken === user.sessionToken);
      if(findIndex !== -1 && new Date(user.joinedAt).getTime() > new Date(state.users[findIndex].joinedAt).getTime()) {
        users[findIndex] = user;
      } else {
        users.push(user);
      }
      const userCount = users.length;
      console.log('👤 User added:', get().users, 'userCount:', get().userCount);
      return { users: users, userCount: userCount };
    });
  },

  removeUser: (user: RoomUser) => {
    if (!get().users.find(u => u.clientId === user.clientId)) return;
    set((state) => {
      const users = state.users.filter(u => u.sessionToken !== user.sessionToken);
      const userCount = users.length;
      console.log('👤 User removed:', get().users, 'userCount:', get().userCount);
      return { users: users, userCount: userCount };
    });
  },

  restoreUsers: (users: RoomUser[]) => {
    const curUserIds = get().users.map(u => u.clientId+";"+u.sessionToken).sort();
    const newUserIds = users.map(u => u.clientId+";"+u.sessionToken).sort();
    for(let i = 0; i < curUserIds.length; i++) {
      if(curUserIds[i] !== newUserIds[i]) {
        set(() => {
          const updateUsers = users.map(user => ({ clientId: user.clientId, joinedAt: user.joinedAt, sessionToken: user.sessionToken }));
          console.log('👤 Users restored:', get().users, 'updateUsers:', updateUsers);
          return { users: updateUsers, userCount: updateUsers.length };
        });
        return;
      }
    }
  },

  // Socket 연결 해제
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('🔌 Disconnecting socket...');
      socket.removeAllListeners(); // 모든 리스너 제거
      socket.disconnect();
      set(initialState);
    }

    // ref 초기화
    roomDataHistoryRef = [];
    temporaryBroadcastData = [];
    roomDataListeners.clear();
    initializeEnvironmentListeners.clear();
  },
}));

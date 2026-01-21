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
  joinRoom: (roomId: string, retryCount?: number) => Promise<{ success: boolean; message: string }>;
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
      timeout: 20000, // 연결 타임아웃 (배포 환경에서 증가)
    });
    
    // 배포 환경 디버깅: 모든 emit 호출 인터셉트
    const originalEmit = newSocket.emit.bind(newSocket);
    newSocket.emit = function(event: string, ...args: unknown[]) {
      const hasCallback = typeof args[args.length - 1] === 'function';
      console.log(`🔍 [Emit Intercept] ${event}:`, {
        hasCallback,
        argsCount: args.length,
        firstArg: args[0],
        timestamp: Date.now(),
        socketId: this.id,
        connected: this.connected,
      });
      
      // 원본 emit 호출
      const result = originalEmit(event, ...args);
      
      // emit 호출 후 확인
      console.log(`✅ [Emit Intercept] ${event} completed:`, {
        result,
        timestamp: Date.now(),
      });
      
      return result;
    };
    
    // 네트워크 레벨 에러 확인
    newSocket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('🔴 Socket connect_error:', error);
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
  joinRoom: async (roomId: string, retryCount = 0): Promise<{ success: boolean; message: string }> => {
    const { socket, isInRoom } = get();

    if (!socket || !socket.connected) {
      console.error('❌ joinRoom: Socket not connected');
      return { success: false, message: 'Socket not connected' };
    }

    if (isInRoom) {
      console.log('⚠️ joinRoom: Already in a room');
      return { success: false, message: 'Already in a room' };
    }

    return new Promise((resolve) => {
      const request: JoinRoomRequest = { roomId };
      const maxRetries = 3;
      // 서버에서 throw되면 ACK가 오지 않으므로 더 짧은 타임아웃 설정
      // 배포 환경에서 서버 에러 시 빠르게 실패 감지하고 재시도
      const timeoutDuration = 8000; // 8초로 설정 (서버 에러 시 빠르게 감지)
      
      console.log(`🚪 joinRoom attempt ${retryCount + 1}/${maxRetries + 1}:`, { 
        roomId, 
        socketId: socket.id,
        timeout: timeoutDuration,
        timestamp: Date.now()
      });
      
      // 타임아웃 설정
      const timeout = setTimeout(() => {
        console.error(`❌ joinRoom timeout (attempt ${retryCount + 1}/${maxRetries + 1}): No ACK received within ${timeoutDuration}ms`);
        console.error(`   This could mean: 1) Server threw an error, 2) Network issue, 3) Server too slow`);
        
        // 재시도 로직
        if (retryCount < maxRetries) {
          const retryDelay = 1000 * (retryCount + 1); // 점진적 지연: 1s, 2s, 3s
          console.log(`🔄 Retrying joinRoom in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            resolve(get().joinRoom(roomId, retryCount + 1));
          }, retryDelay);
        } else {
          console.error(`❌ joinRoom failed after ${maxRetries + 1} attempts: Server may be throwing errors or network issue`);
          resolve({ success: false, message: 'Timeout: No response from server after retries. Server may have thrown an error.' });
        }
      }, timeoutDuration);

      // ACK 콜백이 한 번만 실행되도록 플래그 설정
      // 중요: 서버에서 throw되면 ACK가 오지 않으므로 타임아웃으로 처리됨
      let ackReceived = false;
      
      const ackCallback = (ack: JoinRoomAck) => {
        if (ackReceived) {
          console.warn('⚠️ Duplicate ACK received, ignoring');
          return;
        }
        ackReceived = true;
        clearTimeout(timeout);
        
        console.log(`📥 joinRoom ACK received (attempt ${retryCount + 1}):`, ack);
        
        // 서버에서 정상적으로 ACK를 보낸 경우
        if (ack && ack.success) {
          const users = ack.clientsInRoom?.map(client => ({ 
            clientId: client.socketId, 
            joinedAt: client.joinAt, 
            sessionToken: client.sessionToken 
          })) || [];
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
        } else if (ack && !ack.success) {
          // 서버에서 에러 응답을 보낸 경우 (throw되지 않고 에러 객체 반환)
          console.error('❌ joinRoom failed (server error response):', ack.message);
        } else {
          // 잘못된 ACK 형식
          console.error('❌ joinRoom: Invalid ACK response:', ack);
        }
        resolve(ack || { success: false, message: 'Invalid ACK response' });
      };

      // 이벤트 전송
      try {
        const eventName = ClientToServerListenerType.USER_JOINED;
        
        // 배포 환경 디버깅: 소켓 상태 상세 확인
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socketIO = socket.io as any;
        const socketState = {
          connected: socket.connected,
          disconnected: socket.disconnected,
          id: socket.id,
          transport: socketIO?.engine?.transport?.name || 'unknown',
          readyState: socketIO?._readyState || 'unknown',
        };
        console.log(`🔍 Socket state before emit:`, socketState);
        
        // 소켓이 완전히 준비되지 않았을 수 있으므로 확인
        if (!socket.connected) {
          clearTimeout(timeout);
          console.error('❌ Socket not connected, cannot emit');
          resolve({ success: false, message: 'Socket not connected' });
          return;
        }
        
        // 이벤트 전송 직전 로그
        console.log(`📤 Emitting joinRoom:`, {
          event: eventName,
          request,
          hasAckCallback: true,
          timestamp: Date.now(),
        });
        
        // 이벤트 전송 시도
        const emitResult = socket.emit(eventName, request, (ack: JoinRoomAck) => {
          console.log(`📨 ACK callback invoked:`, { 
            received: true, 
            ack,
            timestamp: Date.now()
          });
          ackCallback(ack);
        });
        
        // emit 메서드는 소켓 인스턴스를 반환하거나 boolean을 반환할 수 있음
        console.log(`✅ Emit call completed:`, {
          event: eventName,
          emitReturnValue: emitResult,
          timestamp: Date.now(),
        });
        
        // 배포 환경에서 네트워크 레벨 확인을 위한 추가 로그
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && (window as any).__SOCKET_IO_DEBUG__) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const socketAny = socket as any;
          console.log('🔬 Socket.IO internal state:', {
            _callbacks: Object.keys(socketAny._callbacks || {}),
            _events: Object.keys(socketAny._events || {}),
          });
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ Error emitting joinRoom:', error);
        resolve({ success: false, message: `Error emitting event: ${error}` });
      }
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

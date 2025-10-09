import { create } from "zustand";
import { RoomDataItem } from "@/common/socket/types";

interface RoomUser {
  socketId: string;
  joinedAt: string;
}

interface SocketStore {
  // Socket 상태
  isConnected: boolean;
  currentRoomId: string | null;
  clientsInRoom: number;
  isInRoom: boolean;

  // 사용자 정보
  users: RoomUser[];
  userCount: number;

  // 데이터 히스토리
  roomDataHistory: RoomDataItem[];

  // 브로드캐스트 메소드
  broadcastPlayerTransform: ((transform: { 
    position: { x: number; y: number; z: number }; 
    rotation: { x: number; y: number; z: number };
  }) => void) | null;
  broadcastPlayerAnimation: ((animation: string) => void) | null;
  broadcastCustomEvent: ((type: string, data: unknown) => void) | null;

  // 데이터 조회 메소드
  getPlayerTransforms: (() => RoomDataItem[]) | null;
  getPlayerAnimations: (() => RoomDataItem[]) | null;
  getRecentData: ((count?: number) => RoomDataItem[]) | null;
  clearHistory: (() => void) | null;

  // Room 관리 메소드
  join: (() => Promise<void>) | null;
  leave: (() => Promise<void>) | null;

  // Store 업데이트 메소드
  setSocketState: (state: Partial<Pick<SocketStore, 'isConnected' | 'currentRoomId' | 'clientsInRoom' | 'isInRoom'>>) => void;
  setUsers: (users: RoomUser[], userCount: number) => void;
  setRoomDataHistory: (history: RoomDataItem[]) => void;
  setBroadcastMethods: (methods: {
    broadcastPlayerTransform: (transform: { 
      position: { x: number; y: number; z: number }; 
      rotation: { x: number; y: number; z: number };
    }) => void;
    broadcastPlayerAnimation: (animation: string) => void;
    broadcastCustomEvent: (type: string, data: unknown) => void;
  }) => void;
  setGetMethods: (methods: {
    getPlayerTransforms: () => RoomDataItem[];
    getPlayerAnimations: () => RoomDataItem[];
    getRecentData: (count?: number) => RoomDataItem[];
    clearHistory: () => void;
  }) => void;
  setRoomMethods: (methods: {
    join: () => Promise<void>;
    leave: () => Promise<void>;
  }) => void;
  
  // 초기화
  reset: () => void;
}

const initialState = {
  isConnected: false,
  currentRoomId: null,
  clientsInRoom: 0,
  isInRoom: false,
  users: [],
  userCount: 0,
  roomDataHistory: [],
  broadcastPlayerTransform: null,
  broadcastPlayerAnimation: null,
  broadcastCustomEvent: null,
  getPlayerTransforms: null,
  getPlayerAnimations: null,
  getRecentData: null,
  clearHistory: null,
  join: null,
  leave: null,
};

export const useSocketStore = create<SocketStore>((set) => ({
  ...initialState,

  setSocketState: (state) => set((prev) => ({ ...prev, ...state })),

  setUsers: (users, userCount) => set({ users, userCount }),

  setRoomDataHistory: (roomDataHistory) => set({ roomDataHistory }),

  setBroadcastMethods: (methods) => set({
    broadcastPlayerTransform: methods.broadcastPlayerTransform,
    broadcastPlayerAnimation: methods.broadcastPlayerAnimation,
    broadcastCustomEvent: methods.broadcastCustomEvent,
  }),

  setGetMethods: (methods) => set({
    getPlayerTransforms: methods.getPlayerTransforms,
    getPlayerAnimations: methods.getPlayerAnimations,
    getRecentData: methods.getRecentData,
    clearHistory: methods.clearHistory,
  }),

  setRoomMethods: (methods) => set({
    join: methods.join,
    leave: methods.leave,
  }),

  reset: () => set(initialState),
}));

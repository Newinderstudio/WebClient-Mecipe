/**
 * Socket.IO 관련 타입 정의
 */

// Join Room 관련
export interface JoinRoomPayload {
  roomId: string;
}

export interface JoinRoomCallback {
  success: boolean;
  clientId: string;
  roomId: string;
  clientsInRoom: number;
  message: string;
}

// Leave Room 관련
export interface LeaveRoomPayload {
  [key: string]: unknown;
}

export interface LeaveRoomCallback {
  success: boolean;
  clientId: string;
  leftRoom?: string;
  message: string;
}

// Broadcast Room Data 관련
export interface BroadcastRoomDataPayload {
  type: string;
  data: unknown;
}

export interface BroadcastRoomDataCallbackSuccess {
  success: boolean;
  message: string;
  dataType?: undefined;
  roomId?: undefined;
}

export interface BroadcastRoomDataCallbackWithData {
  success: boolean;
  message: string;
  dataType: string;
  roomId: string;
}

export type BroadcastRoomDataCallback = 
  | BroadcastRoomDataCallbackSuccess 
  | BroadcastRoomDataCallbackWithData;

// User Joined 이벤트
export interface UserJoinedPayload {
  socketId: string;
  roomId: string;
  timestamp: string;
}

// User Left 이벤트
export interface UserLeftPayload {
  socketId: string;
  roomId: string;
  timestamp: string;
}

// Room Data 이벤트
export interface RoomDataItem {
  type: string;
  timestamp: number;
  data: unknown;
  clientId: string;
}

export interface RoomDataPayload {
  roomId: string;
  timestamp: number;
  data: RoomDataItem[];
}

// Socket 이벤트 타입
export enum SocketEvent {
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  BROADCAST_ROOM_DATA = 'broadCastRoomData',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  ROOM_DATA = 'roomData',
}

// Socket 상태
export interface SocketState {
  isConnected: boolean;
  currentRoomId: string | null;
  clientsInRoom: number;
  clientId: string | null;
}

export enum RoomDataType {
  PLAYER_TRANSFORM = 'playerTransform',
  PLAYER_ANIMATION = 'playerAnimation',
  CUSTOM_EVENT = 'customEvent',
}

export interface PlayerTransformData {
  speed: number,
  position: {x: number, y: number, z: number},
  rotation: {x: number, y: number, z: number},
}
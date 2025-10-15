/**
 * Socket.IO 관련 타입 정의
 */

/*
 * Request
 */

// Join Room 관련
export interface JoinRoomRequest {
  roomId: string;
}

// Leave Room 관련
export interface LeaveRoomRequest {
  [key: string]: unknown;
}

// Broadcast Room Data 관련
export interface BroadcastRoomDataRequest<T = unknown> {
  type: BroadcastDatType;
  data: T;
}

/* 
 * Acknowledgment
 */

export interface JoinRoomAck {
  success: boolean;
  clientId: string;
  roomId: string;
  clientsInRoom: {
    socketId: string;
    joinAt: string;
  }[];
  message: string;
}

export interface LeaveRoomAck {
  success: boolean;
  clientId: string;
  leftRoom?: string;
  message: string;
}

/*
 * Response
 */

export interface BasicResponse {
  socketId: string;
  roomId: string;
  timestamp: string;
}

// User Joined 이벤트
export type UserJoinedResponse = BasicResponse & {};
// User Left 이벤트
export type UserLeftResponse = BasicResponse & {};
// User Diconnected 이벤트
export type UserDisconnectedResponse = BasicResponse & {};

// Room Data 이벤트
export interface ClientMessage<T = unknown> {
  type: string;
  timestamp: number;
  data: T;
  clientId: string;
}

export interface BroadcastRoomDataResponse {
  roomId: string;
  timestamp: number;
  messages: ClientMessage[];
}

export interface RoomDataResponse {
  currentRoom: string,
  clientsInRoom: number,
  clients: string[],
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

export type BroadcastRoomDataAck =
  | BroadcastRoomDataCallbackSuccess
  | BroadcastRoomDataCallbackWithData;



// Socket 상태
export interface SocketState {
  isConnected: boolean;
  currentRoomId: string | null;
  clientsInRoom: number;
  clientId: string | null;
}

export enum BroadcastDatType {
  PLAYER_TRANSFORM = 'playerTransform',
  PLAYER_ANIMATION = 'playerAnimation',
  CUSTOM_EVENT = 'customEvent',
}

export interface PlayerTransformData {
  speed: number,
  position: { x: number, y: number, z: number },
  rotation: { x: number, y: number, z: number },
}

export interface PlayerAnimationData {
  animation: string;
}
/**
 * Socket.IO 관련 타입 정의
 */

import { RoomUser } from "@/store/socket/store";

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
    sessionToken: string;
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
  sessionToken: string;
  timestamp: string;
}

// User Joined 이벤트
export type UserJoinedResponse = BasicResponse & {};
// User Left 이벤트
export type UserLeftResponse = BasicResponse & {};
// User Diconnected 이벤트
export type UserDisconnectedResponse = BasicResponse & {};
// Read Room Member 이벤트
export type ReadRoomMemberResponse = BasicResponse & {
  roomId: string;
  timestamp: string;
  members: RoomUser[];
};
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
  clients?: string[];
}

export interface RoomDataResponse {
  currentRoom: string,
  clientsInRoom: number,
  clients: string[],
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
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
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  READ_ROOM_MEMBER = 'readRoomMember',
}

export interface PlayerTransformData {
  speed: number,
  position: { x: number, y: number, z: number },
  rotation: { x: number, y: number, z: number },
}

export interface PlayerAnimationData {
  animation: string;
}
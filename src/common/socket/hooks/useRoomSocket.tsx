"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useSocketContext } from '../SocketProvider';
import {
  JoinRoomPayload,
  LeaveRoomPayload,
  BroadcastRoomDataPayload,
  UserJoinedPayload,
  UserLeftPayload,
  RoomDataPayload,
} from '../types';

interface UseRoomSocketOptions {
  roomId: string;
  autoJoin?: boolean;
  onUserJoined?: (payload: UserJoinedPayload) => void;
  onUserLeft?: (payload: UserLeftPayload) => void;
  onRoomData?: (payload: RoomDataPayload) => void;
}

/**
 * Room 관련 Socket 기능을 사용하기 위한 Hook
 */
export function useRoomSocket({
  roomId,
  autoJoin = true,
  onUserJoined,
  onUserLeft,
  onRoomData,
}: UseRoomSocketOptions) {
  const {
    socketState,
    joinRoom,
    leaveRoom,
    broadcastRoomData,
    onUserJoined: subscribeUserJoined,
    onUserLeft: subscribeUserLeft,
    onRoomData: subscribeRoomData,
  } = useSocketContext();

  const isJoinedRef = useRef(false);
  const roomIdRef = useRef(roomId);

  // roomId 업데이트
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // 방 참가
  const join = useCallback(async () => {
    if (!socketState.isConnected) {
      console.warn('Socket is not connected');
      return;
    }

    if (isJoinedRef.current) {
      console.warn('Already joined to a room');
      return;
    }

    try {
      const payload: JoinRoomPayload = { roomId: roomIdRef.current };
      const response = await joinRoom(payload);
      
      if (response.success) {
        console.log('Successfully joined room:', response);
        isJoinedRef.current = true;
      } else {
        console.error('Failed to join room:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }, [socketState.isConnected, joinRoom]);

  // 방 나가기
  const leave = useCallback(async () => {
    if (!isJoinedRef.current) {
      console.warn('Not in a room');
      return;
    }

    try {
      const payload: LeaveRoomPayload = {};
      const response = await leaveRoom(payload);
      
      if (response.success) {
        console.log('Successfully left room:', response);
        isJoinedRef.current = false;
      } else {
        console.error('Failed to leave room:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }, [leaveRoom]);

  // 데이터 브로드캐스트
  const broadcast = useCallback(
    async (type: string, data: unknown) => {
      if (!isJoinedRef.current) {
        console.warn('Not in a room, cannot broadcast');
        return;
      }

      try {
        const payload: BroadcastRoomDataPayload = { type, data };
        const response = await broadcastRoomData(payload);
        
        if (!response.success) {
          console.error('Failed to broadcast data:', response.message);
        }
        
        return response;
      } catch (error) {
        console.error('Error broadcasting data:', error);
        throw error;
      }
    },
    [broadcastRoomData]
  );

  // Auto join on mount
  useEffect(() => {
    if (autoJoin && socketState.isConnected && !isJoinedRef.current) {
      join();
    }
  }, [autoJoin, socketState.isConnected, join]);

  // Auto leave on unmount
  useEffect(() => {
    return () => {
      if (isJoinedRef.current) {
        leave();
      }
    };
  }, [leave]);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!socketState.isConnected) return;

    const unsubscribeUserJoined = onUserJoined
      ? subscribeUserJoined(onUserJoined)
      : undefined;

    const unsubscribeUserLeft = onUserLeft
      ? subscribeUserLeft(onUserLeft)
      : undefined;

    const unsubscribeRoomData = onRoomData
      ? subscribeRoomData(onRoomData)
      : undefined;

    return () => {
      unsubscribeUserJoined?.();
      unsubscribeUserLeft?.();
      unsubscribeRoomData?.();
    };
  }, [
    socketState.isConnected,
    onUserJoined,
    onUserLeft,
    onRoomData,
    subscribeUserJoined,
    subscribeUserLeft,
    subscribeRoomData,
  ]);

  return {
    isConnected: socketState.isConnected,
    currentRoomId: socketState.currentRoomId,
    clientsInRoom: socketState.clientsInRoom,
    isInRoom: isJoinedRef.current,
    clientId: socketState.clientId,
    join,
    leave,
    broadcast,
  };
}


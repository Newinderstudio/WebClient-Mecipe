"use client";

import { useRoomSocket } from '@/common/socket/hooks/useRoomSocket';
import { useRoomDataHandler } from '@/common/socket/hooks/useRoomDataHandler';
import { useEffect, useCallback } from 'react';
import { useSocketStore } from '@/store/socket.tsx/store';

interface UseVirtualWorldSocketOptions {
  roomId: string;
  enabled?: boolean;
}

/**
 * VirtualWorld에서 사용할 Socket 통신 Hook
 * Socket 메소드와 상태를 Zustand Store에 저장하여 다른 컴포넌트에서도 사용 가능
 */
export function useVirtualWorldSocket({ roomId, enabled = true }: UseVirtualWorldSocketOptions) {
  const {
    users,
    userCount,
    roomDataHistory,
    handleUserJoined,
    handleUserLeft,
    handleRoomData,
    getDataByType,
    getRecentData,
    clearHistory,
  } = useRoomDataHandler();

  const {
    isConnected,
    currentRoomId,
    clientsInRoom,
    isInRoom,
    join,
    leave,
    broadcast,
  } = useRoomSocket({
    roomId,
    autoJoin: enabled,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onRoomData: handleRoomData,
  });

  // Store 업데이트 메소드
  const setSocketState = useSocketStore((state) => state.setSocketState);
  const setUsers = useSocketStore((state) => state.setUsers);
  const setRoomDataHistory = useSocketStore((state) => state.setRoomDataHistory);
  const setBroadcastMethods = useSocketStore((state) => state.setBroadcastMethods);
  const setGetMethods = useSocketStore((state) => state.setGetMethods);
  const setRoomMethods = useSocketStore((state) => state.setRoomMethods);
  const reset = useSocketStore((state) => state.reset);

  // 플레이어 위치와 회전을 함께 브로드캐스트
  const broadcastPlayerTransform = useCallback((transform: { 
    position: { x: number; y: number; z: number }; 
    rotation: { x: number; y: number; z: number };
  }) => {
    broadcast('playerTransform', transform);
  }, [broadcast]);

  // 플레이어 애니메이션 상태 브로드캐스트
  const broadcastPlayerAnimation = useCallback((animation: string) => {
    broadcast('playerAnimation', { animation });
  }, [broadcast]);

  // 커스텀 이벤트 브로드캐스트
  const broadcastCustomEvent = useCallback((type: string, data: unknown) => {
    broadcast(type, data);
  }, [broadcast]);

  // 플레이어 Transform 데이터 가져오기
  const getPlayerTransforms = useCallback(() => {
    return getDataByType('playerTransform');
  }, [getDataByType]);

  // 플레이어 애니메이션 데이터 가져오기
  const getPlayerAnimations = useCallback(() => {
    return getDataByType('playerAnimation');
  }, [getDataByType]);

  // Socket 상태를 Store에 업데이트
  useEffect(() => {
    setSocketState({
      isConnected,
      currentRoomId,
      clientsInRoom,
      isInRoom,
    });
  }, [isConnected, currentRoomId, clientsInRoom, isInRoom, setSocketState]);

  // 사용자 정보를 Store에 업데이트
  useEffect(() => {
    setUsers(users, userCount);
  }, [users, userCount, setUsers]);

  // 데이터 히스토리를 Store에 업데이트
  useEffect(() => {
    setRoomDataHistory(roomDataHistory);
  }, [roomDataHistory, setRoomDataHistory]);

  // Broadcast 메소드들을 Store에 저장
  useEffect(() => {
    setBroadcastMethods({
      broadcastPlayerTransform,
      broadcastPlayerAnimation,
      broadcastCustomEvent,
    });
  }, [
    broadcastPlayerTransform,
    broadcastPlayerAnimation,
    broadcastCustomEvent,
    setBroadcastMethods,
  ]);

  // Get 메소드들을 Store에 저장
  useEffect(() => {
    setGetMethods({
      getPlayerTransforms,
      getPlayerAnimations,
      getRecentData,
      clearHistory,
    });
  }, [
    getPlayerTransforms,
    getPlayerAnimations,
    getRecentData,
    clearHistory,
    setGetMethods,
  ]);

  // Room 관리 메소드들을 Store에 저장
  useEffect(() => {
    setRoomMethods({
      join: async () => {
        await join();
      },
      leave: async () => {
        await leave();
      },
    });
  }, [join, leave, setRoomMethods]);

  // 컴포넌트 언마운트 시 Store 초기화
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Socket 연결 상태 로깅
  useEffect(() => {
    console.log('Socket Connected:', isConnected);
    console.log('Current Room:', currentRoomId);
    console.log('Clients in Room:', clientsInRoom);
    console.log('Users:', users);
  }, [isConnected, currentRoomId, clientsInRoom, users]);

  return {
    // Socket 상태
    isConnected,
    currentRoomId,
    clientsInRoom,
    isInRoom,

    // Room 관리
    join,
    leave,

    // 사용자 정보
    users,
    userCount,

    // 데이터 브로드캐스트
    broadcastPlayerTransform,
    broadcastPlayerAnimation,
    broadcastCustomEvent,

    // 데이터 조회
    roomDataHistory,
    getPlayerTransforms,
    getPlayerAnimations,
    getRecentData,
    clearHistory,
  };
}


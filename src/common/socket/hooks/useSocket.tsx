"use client";

import { useSocketContext } from '../SocketProvider';

/**
 * Socket 기본 기능을 사용하기 위한 Hook
 */
export function useSocket() {
  const { socket, socketState } = useSocketContext();

  return {
    socket,
    isConnected: socketState.isConnected,
    currentRoomId: socketState.currentRoomId,
    clientsInRoom: socketState.clientsInRoom,
  };
}


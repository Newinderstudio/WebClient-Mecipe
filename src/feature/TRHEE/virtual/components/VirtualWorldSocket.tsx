"use client";

import { useEffect } from 'react';
import { useSocketStore } from '@/store/socket/store';

export default function VirtualWorldSocket({ 
  roomId, 
  enabled = true,
  serverUrl = 'http://localhost:4100',
  path = ''
}: { 
  roomId: string;
  enabled?: boolean;
  serverUrl?: string;
  path?: string;
}) {
  const initSocket = useSocketStore((state) => state.initSocket);
  const sessionToken = useSocketStore((state) => state.sessionToken);
  const joinRoom = useSocketStore((state) => state.joinRoom);
  const leaveRoom = useSocketStore((state) => state.leaveRoom);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  // Socket 초기화
  useEffect(() => {
    if (!enabled) return;
    
    initSocket(serverUrl, path);

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, serverUrl, path]); // initSocket, disconnect는 Zustand store 메서드로 안정적인 참조 유지

  // Room 참가/퇴장
  useEffect(() => {
    if (!enabled || !isConnected || !sessionToken) return;

    let mounted = true;

    const join = async () => {
      if (!mounted) return;
      
      // 소켓 인스턴스를 직접 확인하여 안전하게 emit
      const socket = useSocketStore.getState().socket;
      
      if (socket && socket.connected) {
        console.log('🚪 Attempting to join room:', {
          roomId,
          socketId: socket.id,
          sessionToken,
          timestamp: Date.now()
        });
        await joinRoom(roomId);
      } else {
        console.error('❌ Cannot join room: Socket not ready', {
          hasSocket: !!socket,
          connected: socket?.connected,
          isConnected,
          sessionToken
        });
      }
    };

    join();

    return () => {
      mounted = false;
      leaveRoom();
    };
  }, [enabled, isConnected, roomId, joinRoom, leaveRoom, sessionToken]);

  return null;
}

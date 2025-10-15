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
  const joinRoom = useSocketStore((state) => state.joinRoom);
  const leaveRoom = useSocketStore((state) => state.leaveRoom);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  // Socket 초기화
  useEffect(() => {
    if (enabled) {
      initSocket(serverUrl, path);
    }

    return () => {
      disconnect();
    };
  }, [enabled, serverUrl, path, initSocket, disconnect]);

  // Room 참가/퇴장
  useEffect(() => {
    if (!enabled || !isConnected) return;

    let mounted = true;

    const join = async () => {
      if (mounted) {
        const result = await joinRoom(roomId);
        console.log('Join room result:', result.message);
      }
    };

    join();

    return () => {
      mounted = false;
      leaveRoom();
    };
  }, [enabled, isConnected, roomId, joinRoom, leaveRoom]);

  return null;
}

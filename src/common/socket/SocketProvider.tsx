"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  JoinRoomPayload,
  JoinRoomCallback,
  LeaveRoomPayload,
  LeaveRoomCallback,
  BroadcastRoomDataPayload,
  BroadcastRoomDataCallback,
  UserJoinedPayload,
  UserLeftPayload,
  RoomDataPayload,
  SocketEvent,
  SocketState,
} from './types';

interface SocketContextValue {
  socket: Socket | null;
  socketState: SocketState;
  joinRoom: (payload: JoinRoomPayload) => Promise<JoinRoomCallback>;
  leaveRoom: (payload: LeaveRoomPayload) => Promise<LeaveRoomCallback>;
  broadcastRoomData: (payload: BroadcastRoomDataPayload) => Promise<BroadcastRoomDataCallback>;
  onUserJoined: (callback: (payload: UserJoinedPayload) => void) => () => void;
  onUserLeft: (callback: (payload: UserLeftPayload) => void) => () => void;
  onRoomData: (callback: (payload: RoomDataPayload) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
}

export function SocketProvider({ children, serverUrl = 'http://localhost:3001' }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    currentRoomId: null,
    clientsInRoom: 0,
  });
  
  const socketRef = useRef<Socket | null>(null);

  // Socket 초기화
  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setSocketState(prev => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketState({
        isConnected: false,
        currentRoomId: null,
        clientsInRoom: 0,
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  // Join Room
  const joinRoom = useCallback(async (payload: JoinRoomPayload): Promise<JoinRoomCallback> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        SocketEvent.JOIN_ROOM,
        payload,
        (response: JoinRoomCallback) => {
          if (response.success) {
            setSocketState(prev => ({
              ...prev,
              currentRoomId: response.roomId,
              clientsInRoom: response.clientsInRoom,
            }));
          }
          resolve(response);
        }
      );
    });
  }, []);

  // Leave Room
  const leaveRoom = useCallback(async (payload: LeaveRoomPayload): Promise<LeaveRoomCallback> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        SocketEvent.LEAVE_ROOM,
        payload,
        (response: LeaveRoomCallback) => {
          if (response.success) {
            setSocketState(prev => ({
              ...prev,
              currentRoomId: null,
              clientsInRoom: 0,
            }));
          }
          resolve(response);
        }
      );
    });
  }, []);

  // Broadcast Room Data
  const broadcastRoomData = useCallback(
    async (payload: BroadcastRoomDataPayload): Promise<BroadcastRoomDataCallback> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error('Socket not connected'));
          return;
        }

        socketRef.current.emit(
          SocketEvent.BROADCAST_ROOM_DATA,
          payload,
          (response: BroadcastRoomDataCallback) => {
            resolve(response);
          }
        );
      });
    },
    []
  );

  // User Joined 이벤트 리스너
  const onUserJoined = useCallback((callback: (payload: UserJoinedPayload) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: UserJoinedPayload) => {
      console.log('User joined:', payload);
      callback(payload);
    };

    socketRef.current.on(SocketEvent.USER_JOINED, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SocketEvent.USER_JOINED, handler);
      }
    };
  }, []);

  // User Left 이벤트 리스너
  const onUserLeft = useCallback((callback: (payload: UserLeftPayload) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: UserLeftPayload) => {
      console.log('User left:', payload);
      setSocketState(prev => ({
        ...prev,
        clientsInRoom: Math.max(0, prev.clientsInRoom - 1),
      }));
      callback(payload);
    };

    socketRef.current.on(SocketEvent.USER_LEFT, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SocketEvent.USER_LEFT, handler);
      }
    };
  }, []);

  // Room Data 이벤트 리스너
  const onRoomData = useCallback((callback: (payload: RoomDataPayload) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: RoomDataPayload) => {
      console.log('Room data received:', payload);
      callback(payload);
    };

    socketRef.current.on(SocketEvent.ROOM_DATA, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SocketEvent.ROOM_DATA, handler);
      }
    };
  }, []);

  const value: SocketContextValue = {
    socket,
    socketState,
    joinRoom,
    leaveRoom,
    broadcastRoomData,
    onUserJoined,
    onUserLeft,
    onRoomData,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}


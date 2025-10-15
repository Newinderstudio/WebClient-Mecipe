"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  JoinRoomRequest,
  BroadcastRoomDataRequest,
  BroadcastRoomDataAck,
  UserJoinedResponse,
  UserLeftResponse,
  SocketState,
  RoomDataResponse,
  JoinRoomAck,
  LeaveRoomRequest,
  LeaveRoomAck,
} from './socket-message-types';

import { ClientToServerListenerType, ServerToClientListenerType } from './socket-event-type';

interface SocketContextValue {
  socket: Socket | null;
  socketState: SocketState;
  joinRoom: (payload: JoinRoomRequest) => Promise<JoinRoomAck>;
  leaveRoom: (payload: LeaveRoomRequest) => Promise<LeaveRoomAck>;
  broadcastRoomData: (payload: BroadcastRoomDataRequest) => Promise<BroadcastRoomDataAck>;
  onUserJoined: (callback: (payload: UserJoinedResponse) => void) => () => void;
  onUserLeft: (callback: (payload: UserLeftResponse) => void) => () => void;
  onRoomData: (callback: (payload: RoomDataResponse) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
  path?: string;
}

export function SocketProvider({ children, serverUrl = 'http://localhost:3001', path = '' }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    currentRoomId: null,
    clientsInRoom: 0,
    clientId: null,
  });
  
  const socketRef = useRef<Socket | null>(null);

  // Socket 초기화
  useEffect(() => {

    console.log('🔌 Socket connecting to:', serverUrl);
    console.log('📁 Socket path:', path);

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: "/"+path,
    });

    newSocket.on(ServerToClientListenerType.CONNECT, () => {
      console.log('Socket connected:', newSocket.id);
      setSocketState(prev => ({ ...prev, isConnected: true, clientId: newSocket.id ?? null }));
    });

    newSocket.on(ServerToClientListenerType.DISCONNECT, () => {
      console.log('Socket disconnected');
      setSocketState({
        isConnected: false,
        currentRoomId: null,
        clientsInRoom: 0,
        clientId: null,
      });
    });

    newSocket.on(ServerToClientListenerType.CONNECT_ERROR, (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Server URL:', serverUrl);
      console.error('Path:', path);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl, path]);

  // Join Room
  const joinRoom = useCallback(async (payload: JoinRoomRequest): Promise<JoinRoomAck> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        ClientToServerListenerType.USER_JOINED,
        payload,
        (response: JoinRoomAck) => {
          if (response.success) {
            setSocketState(prev => ({
              ...prev,
              currentRoomId: response.roomId,
              clientsInRoom: response.clientsInRoom.length,
            }));
          }
          resolve(response);
        }
      );
    });
  }, []);

  // Leave Room
  const leaveRoom = useCallback(async (payload: LeaveRoomRequest): Promise<LeaveRoomAck> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        ClientToServerListenerType.USER_LEFT,
        payload,
        (response: LeaveRoomAck) => {
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
    async (payload: BroadcastRoomDataRequest): Promise<BroadcastRoomDataAck> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error('Socket not connected'));
          return;
        }

        socketRef.current.emit(
          ClientToServerListenerType.ROOM_BROADCAST,
          payload,
          (response: BroadcastRoomDataAck) => {
            resolve(response);
          }
        );
      });
    },
    []
  );

  // User Joined 이벤트 리스너
  const onUserJoined = useCallback((callback: (payload: UserJoinedResponse) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: UserJoinedResponse) => {
      console.log('User joined:', payload);
      callback(payload);
    };

    socketRef.current.on(ServerToClientListenerType.USER_JOINED, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ServerToClientListenerType.USER_JOINED, handler);
      }
    };
  }, []);

  // User Left 이벤트 리스너
  const onUserLeft = useCallback((callback: (payload: UserLeftResponse) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: UserLeftResponse) => {
      console.log('User left:', payload);
      setSocketState(prev => ({
        ...prev,
        clientsInRoom: Math.max(0, prev.clientsInRoom - 1),
      }));
      callback(payload);
    };

    socketRef.current.on(ServerToClientListenerType.USER_LEFT, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ServerToClientListenerType.USER_LEFT, handler);
      }
    };
  }, []);

  // Room Data 이벤트 리스너
  const onRoomData = useCallback((callback: (payload: RoomDataResponse) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (payload: RoomDataResponse) => {
      console.log('Room data received:', payload);
      callback(payload);
    };

    socketRef.current.on(ServerToClientListenerType.ROOM_DATA, handler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ServerToClientListenerType.ROOM_DATA, handler);
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


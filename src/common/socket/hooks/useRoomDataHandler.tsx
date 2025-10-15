"use client";

import { useState, useCallback } from 'react';
import {
  UserJoinedResponse,
  UserLeftResponse,
  RoomDataPayload,
  ClientMessage,
} from '../socket-message-types';

interface RoomUser {
  socketId: string;
  joinedAt: string;
}

/**
 * Room 데이터를 관리하고 처리하기 위한 Hook
 */
export function useRoomDataHandler() {
  const [users, setUsers] = useState<Map<string, RoomUser>>(new Map());
  const [roomDataHistory, setRoomDataHistory] = useState<ClientMessage[]>([]);

  // 사용자 참가 핸들러
  const handleUserJoined = useCallback((payload: UserJoinedResponse) => {
    setUsers(prev => {
      const newUsers = new Map(prev);
      newUsers.set(payload.socketId, {
        socketId: payload.socketId,
        joinedAt: payload.timestamp,
      });
      return newUsers;
    });
  }, []);

  // 사용자 퇴장 핸들러
  const handleUserLeft = useCallback((payload: UserLeftResponse) => {
    setUsers(prev => {
      const newUsers = new Map(prev);
      newUsers.delete(payload.socketId);
      return newUsers;
    });
  }, []);

  // Room 데이터 핸들러
  const handleRoomData = useCallback((payload: RoomDataPayload) => {
    setRoomDataHistory(prev => {
      // 새로운 데이터를 기존 히스토리에 추가
      const newHistory = [...prev, ...payload.data];
      
      // 최대 100개까지만 유지 (메모리 관리)
      if (newHistory.length > 100) {
        return newHistory.slice(-100);
      }
      
      return newHistory;
    });
  }, []);

  // 특정 타입의 데이터만 필터링
  const getDataByType = useCallback((type: string): ClientMessage[] => {
    return roomDataHistory.filter(item => item.type === type);
  }, [roomDataHistory]);

  // 최근 데이터 가져오기
  const getRecentData = useCallback((count: number = 10): ClientMessage[] => {
    return roomDataHistory.slice(-count);
  }, [roomDataHistory]);

  // 특정 클라이언트의 데이터만 가져오기
  const getDataByClient = useCallback((clientId: string): ClientMessage[] => {
    return roomDataHistory.filter(item => item.clientId === clientId);
  }, [roomDataHistory]);

  // 데이터 초기화
  const clearHistory = useCallback(() => {
    setRoomDataHistory([]);
  }, []);

  return {
    users: Array.from(users.values()),
    userCount: users.size,
    roomDataHistory,
    handleUserJoined,
    handleUserLeft,
    handleRoomData,
    getDataByType,
    getRecentData,
    getDataByClient,
    clearHistory,
  };
}


"use client";

import React, { useState } from 'react';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useRoomDataHandler } from '../hooks/useRoomDataHandler';

/**
 * Socket.IO 사용 예제 컴포넌트
 * 
 * 이 컴포넌트는 Socket.IO를 사용하는 방법을 보여줍니다.
 * VirtualWorldScreen에서 참고하여 사용할 수 있습니다.
 */
export default function SocketExample() {
  const [roomId, setRoomId] = useState('example-room-1');
  const [message, setMessage] = useState('');
  const [dataType, setDataType] = useState('chat');

  // Room 데이터 핸들러
  const {
    users,
    userCount,
    roomDataHistory,
    handleUserJoined,
    handleUserLeft,
    handleRoomData,
    getDataByType,
    getRecentData,
  } = useRoomDataHandler();

  // Room Socket
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
    autoJoin: false, // 수동으로 참가
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onRoomData: handleRoomData,
  });

  // 방 참가
  const handleJoin = async () => {
    try {
      const response = await join();
      alert(`Join Response: ${response.message}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // 방 나가기
  const handleLeave = async () => {
    try {
      const response = await leave();
      alert(`Leave Response: ${response.message}`);
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  // 메시지 브로드캐스트
  const handleBroadcast = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const response = await broadcast(dataType, { message, timestamp: Date.now() });
      if (response.success) {
        setMessage('');
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Socket.IO Example</h1>

      {/* 연결 상태 */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px'
      }}>
        <p><strong>Socket Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
        <p><strong>Current Room:</strong> {currentRoomId || 'None'}</p>
        <p><strong>Clients in Room:</strong> {clientsInRoom}</p>
        <p><strong>In Room:</strong> {isInRoom ? 'Yes' : 'No'}</p>
      </div>

      {/* Room 입력 */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Room ID:</strong>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
            disabled={isInRoom}
          />
        </label>
      </div>

      {/* 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleJoin}
          disabled={isInRoom || !isConnected}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            cursor: isInRoom || !isConnected ? 'not-allowed' : 'pointer',
            backgroundColor: isInRoom || !isConnected ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Join Room
        </button>
        <button
          onClick={handleLeave}
          disabled={!isInRoom}
          style={{
            padding: '10px 20px',
            cursor: !isInRoom ? 'not-allowed' : 'pointer',
            backgroundColor: !isInRoom ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Leave Room
        </button>
      </div>

      {/* 메시지 브로드캐스트 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Broadcast Message</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Data Type:</strong>
            <input
              type="text"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
              placeholder="e.g., chat, position"
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            rows={3}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>
        <button
          onClick={handleBroadcast}
          disabled={!isInRoom}
          style={{
            padding: '10px 20px',
            cursor: !isInRoom ? 'not-allowed' : 'pointer',
            backgroundColor: !isInRoom ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Broadcast
        </button>
      </div>

      {/* 사용자 목록 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Users in Room ({userCount})</h3>
        <ul>
          {users.map(user => (
            <li key={user.socketId}>
              {user.socketId} - Joined at: {new Date(user.joinedAt).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      {/* 데이터 히스토리 */}
      <div>
        <h3>Room Data History ({roomDataHistory.length})</h3>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          border: '1px solid #ddd', 
          padding: '10px',
          borderRadius: '5px'
        }}>
          {getRecentData(20).reverse().map((item, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                backgroundColor: '#f8f9fa',
                borderRadius: '3px'
              }}
            >
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Client:</strong> {item.clientId}</p>
              <p><strong>Time:</strong> {new Date(item.timestamp).toLocaleTimeString()}</p>
              <p><strong>Data:</strong> {JSON.stringify(item.data)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


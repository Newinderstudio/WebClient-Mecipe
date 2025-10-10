/**
 * Socket Store 사용 예제들
 * 
 * 이 파일은 다양한 컴포넌트에서 Socket Store를 사용하는 방법을 보여줍니다.
 */

"use client";

import { useSocketStore } from './store';
import { useEffect } from 'react';

// ============================================================
// 예제 1: 플레이어 위치와 회전을 실시간으로 전송하는 컴포넌트
// ============================================================
export function PlayerTransformBroadcaster() {
  const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
  const isInRoom = useSocketStore((state) => state.isInRoom);

  useEffect(() => {
    if (!isInRoom || !broadcastPlayerTransform) return;

    // 100ms마다 현재 위치와 회전 전송
    const interval = setInterval(() => {
      // 실제 플레이어 transform을 가져오는 로직 (예시)
      const transform = {
        position: {
          x: Math.random() * 10,
          y: 1,
          z: Math.random() * 10,
        },
        rotation: {
          x: 0,
          y: Math.random() * Math.PI * 2,
          z: 0,
        },
      };

      broadcastPlayerTransform(transform);
      console.log('Broadcasted transform:', transform);
    }, 100);

    return () => clearInterval(interval);
  }, [isInRoom, broadcastPlayerTransform]);

  return null; // 렌더링 없음
}

// ============================================================
// 예제 2: 다른 플레이어들의 위치와 회전을 표시하는 UI 컴포넌트
// ============================================================
export function PlayerTransformsDisplay() {
  const getPlayerTransforms = useSocketStore((state) => state.getPlayerTransforms);
  const users = useSocketStore((state) => state.users);
  const isConnected = useSocketStore((state) => state.isConnected);

  if (!isConnected) {
    return <div>Not connected to server</div>;
  }

  const transforms = getPlayerTransforms?.() || [];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h3>Connected Players: {users.length}</h3>
      <ul>
        {users.map((user) => {
          const userTransform = transforms.find((t) => t.clientId === user.socketId);
          const transformData = userTransform?.data as { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number } } | undefined;
          
          return (
            <li key={user.socketId}>
              <strong>{user.socketId.slice(0, 8)}...</strong>
              {transformData && (
                <div style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                  <div>
                    Position: ({transformData.position?.x?.toFixed(2)},{' '}
                    {transformData.position?.y?.toFixed(2)},{' '}
                    {transformData.position?.z?.toFixed(2)})
                  </div>
                  <div>
                    Rotation: ({transformData.rotation?.x?.toFixed(2)},{' '}
                    {transformData.rotation?.y?.toFixed(2)},{' '}
                    {transformData.rotation?.z?.toFixed(2)})
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================
// 예제 3: 애니메이션 상태를 전송하는 컴포넌트
// ============================================================
export function AnimationController({ currentAnimation }: { currentAnimation: string }) {
  const broadcastPlayerAnimation = useSocketStore((state) => state.broadcastPlayerAnimation);
  const isInRoom = useSocketStore((state) => state.isInRoom);

  useEffect(() => {
    if (isInRoom && broadcastPlayerAnimation) {
      broadcastPlayerAnimation(currentAnimation);
      console.log('Animation changed to:', currentAnimation);
    }
  }, [currentAnimation, isInRoom, broadcastPlayerAnimation]);

  return null;
}

// ============================================================
// 예제 4: 최근 이벤트를 표시하는 로그 컴포넌트
// ============================================================
export function EventLogDisplay() {
  const getRecentData = useSocketStore((state) => state.getRecentData);
  const roomDataHistory = useSocketStore((state) => state.roomDataHistory);

  const recentEvents = getRecentData?.(10) || [];

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      <h3>Recent Events ({roomDataHistory.length} total)</h3>
      <div>
        {recentEvents.reverse().map((event, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: '#f9f9f9',
              borderLeft: '3px solid #007bff',
            }}
          >
            <div>
              <strong>Type:</strong> {event.type}
            </div>
            <div>
              <strong>Client:</strong> {event.clientId.slice(0, 8)}...
            </div>
            <div>
              <strong>Time:</strong> {new Date(event.timestamp).toLocaleTimeString()}
            </div>
            <div>
              <strong>Data:</strong> {JSON.stringify(event.data)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 예제 5: 연결 상태를 표시하는 상태바
// ============================================================
export function ConnectionStatusBar() {
  const { isConnected, currentRoomId, clientsInRoom, isInRoom } = useSocketStore((state) => ({
    isConnected: state.isConnected,
    currentRoomId: state.currentRoomId,
    clientsInRoom: state.clientsInRoom,
    isInRoom: state.isInRoom,
  }));

  return (
    <div
      style={{
        padding: '10px 20px',
        backgroundColor: isConnected ? '#28a745' : '#dc3545',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </div>
      {isInRoom && (
        <>
          <div>
            <strong>Room:</strong> {currentRoomId}
          </div>
          <div>
            <strong>Clients:</strong> {clientsInRoom}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// 예제 6: 커스텀 이벤트를 보내는 액션 버튼
// ============================================================
export function CustomEventSender() {
  const broadcastCustomEvent = useSocketStore((state) => state.broadcastCustomEvent);
  const isInRoom = useSocketStore((state) => state.isInRoom);

  const handleSendJump = () => {
    if (broadcastCustomEvent && isInRoom) {
      broadcastCustomEvent('playerJump', {
        height: 2,
        timestamp: Date.now(),
      });
      console.log('Sent jump event');
    }
  };

  const handleSendEmote = (emote: string) => {
    if (broadcastCustomEvent && isInRoom) {
      broadcastCustomEvent('playerEmote', {
        emote,
        timestamp: Date.now(),
      });
      console.log('Sent emote:', emote);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Send Custom Events</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSendJump}
          disabled={!isInRoom}
          style={{
            padding: '10px 20px',
            backgroundColor: isInRoom ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isInRoom ? 'pointer' : 'not-allowed',
          }}
        >
          Jump
        </button>
        <button
          onClick={() => handleSendEmote('wave')}
          disabled={!isInRoom}
          style={{
            padding: '10px 20px',
            backgroundColor: isInRoom ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isInRoom ? 'pointer' : 'not-allowed',
          }}
        >
          Wave
        </button>
        <button
          onClick={() => handleSendEmote('dance')}
          disabled={!isInRoom}
          style={{
            padding: '10px 20px',
            backgroundColor: isInRoom ? '#ffc107' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isInRoom ? 'pointer' : 'not-allowed',
          }}
        >
          Dance
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 예제 7: 플레이어 Transform 동기화
// ============================================================
export function PlayerTransformSync({ 
  position, 
  rotation 
}: { 
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}) {
  const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
  const isInRoom = useSocketStore((state) => state.isInRoom);

  useEffect(() => {
    if (isInRoom && broadcastPlayerTransform) {
      // Transform이 변경될 때마다 전송 (실제로는 throttle 적용 권장)
      broadcastPlayerTransform({ position, rotation });
    }
  }, [position, rotation, isInRoom, broadcastPlayerTransform]);

  return null;
}

// ============================================================
// 예제 8: Room 관리 UI
// ============================================================
export function RoomControlPanel() {
  const { join, leave, isInRoom, currentRoomId } = useSocketStore((state) => ({
    join: state.join,
    leave: state.leave,
    isInRoom: state.isInRoom,
    currentRoomId: state.currentRoomId,
  }));

  const handleJoin = async () => {
    if (join) {
      try {
        await join();
        console.log('Joined room successfully');
      } catch (error) {
        console.error('Failed to join room:', error);
      }
    }
  };

  const handleLeave = async () => {
    if (leave) {
      try {
        await leave();
        console.log('Left room successfully');
      } catch (error) {
        console.error('Failed to leave room:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h3>Room Control</h3>
      <p>
        <strong>Status:</strong> {isInRoom ? `In Room: ${currentRoomId}` : 'Not in a room'}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleJoin}
          disabled={isInRoom || !join}
          style={{
            padding: '10px 20px',
            backgroundColor: isInRoom || !join ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isInRoom || !join ? 'not-allowed' : 'pointer',
          }}
        >
          Join Room
        </button>
        <button
          onClick={handleLeave}
          disabled={!isInRoom || !leave}
          style={{
            padding: '10px 20px',
            backgroundColor: !isInRoom || !leave ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isInRoom || !leave ? 'not-allowed' : 'pointer',
          }}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 예제 9: 전체 대시보드 (모든 기능 통합)
// ============================================================
export function SocketDashboard() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Virtual World Socket Dashboard</h1>

      <div style={{ marginBottom: '20px' }}>
        <ConnectionStatusBar />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <RoomControlPanel />
        </div>
        <div>
          <PlayerTransformsDisplay />
        </div>
        <div>
          <CustomEventSender />
        </div>
        <div>
          <EventLogDisplay />
        </div>
      </div>
    </div>
  );
}


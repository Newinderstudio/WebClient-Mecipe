# Socket Store

Socket.IO 메소드와 상태를 전역적으로 관리하는 Zustand Store입니다.

## 개요

`useVirtualWorldSocket` Hook이 실행되면 자동으로 모든 메소드와 상태를 이 Store에 저장합니다.
따라서 다른 컴포넌트에서는 Hook을 직접 사용하지 않고도 Socket 메소드를 호출할 수 있습니다.

## 사용 방법

### 1. VirtualWorldSocket 컴포넌트 설정 (이미 완료)

```tsx
// VirtualWorldScreen.tsx
<VirtualWorldSocket roomId="virtual-world-room-1" enabled={true} />
```

### 2. 다른 컴포넌트에서 Store 사용

```tsx
"use client";

import { useSocketStore } from '@/store/socket.tsx/store';

function MyComponent() {
  // Socket 상태 가져오기
  const isConnected = useSocketStore((state) => state.isConnected);
  const currentRoomId = useSocketStore((state) => state.currentRoomId);
  const users = useSocketStore((state) => state.users);

  // Broadcast 메소드 가져오기
  const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
  const broadcastPlayerAnimation = useSocketStore((state) => state.broadcastPlayerAnimation);

  // Get 메소드 가져오기
  const getPlayerTransforms = useSocketStore((state) => state.getPlayerTransforms);
  const getRecentData = useSocketStore((state) => state.getRecentData);

  // 메소드 사용
  const handleMove = (position: {x: number, y: number, z: number}, rotation: {x: number, y: number, z: number}) => {
    if (broadcastPlayerTransform) {
      broadcastPlayerTransform({ position, rotation });
    }
  };

  const handleGetTransforms = () => {
    if (getPlayerTransforms) {
      const transforms = getPlayerTransforms();
      console.log('Player transforms:', transforms);
    }
  };

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Room: {currentRoomId}</p>
      <p>Users: {users.length}</p>
      <button onClick={() => handleMove(
        { x: 1, y: 2, z: 3 }, 
        { x: 0, y: 1.5, z: 0 }
      )}>Send Transform</button>
      <button onClick={handleGetTransforms}>Get Transforms</button>
    </div>
  );
}
```

### 3. 여러 값을 한번에 가져오기

```tsx
function MyComponent() {
  const {
    isConnected,
    broadcastPlayerTransform,
    getPlayerTransforms,
  } = useSocketStore((state) => ({
    isConnected: state.isConnected,
    broadcastPlayerTransform: state.broadcastPlayerTransform,
    getPlayerTransforms: state.getPlayerTransforms,
  }));

  // 사용...
}
```

## Store 구조

### 상태 (State)

| 속성 | 타입 | 설명 |
|------|------|------|
| `isConnected` | `boolean` | Socket 연결 상태 |
| `currentRoomId` | `string \| null` | 현재 참가한 Room ID |
| `clientsInRoom` | `number` | Room 내 클라이언트 수 |
| `isInRoom` | `boolean` | Room 참가 여부 |
| `users` | `RoomUser[]` | Room 내 사용자 목록 |
| `userCount` | `number` | 사용자 수 |
| `roomDataHistory` | `RoomDataItem[]` | Room 데이터 히스토리 |

### Broadcast 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `broadcastPlayerTransform` | `(transform: {position: {x, y, z}, rotation: {x, y, z}}) => void` | 플레이어 위치와 회전 함께 전송 |
| `broadcastPlayerAnimation` | `(animation: string) => void` | 애니메이션 상태 전송 |
| `broadcastCustomEvent` | `(type: string, data: unknown) => void` | 커스텀 이벤트 전송 |

### Get 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `getPlayerTransforms` | `() => RoomDataItem[]` | 플레이어 위치와 회전 데이터 조회 |
| `getPlayerAnimations` | `() => RoomDataItem[]` | 애니메이션 데이터 조회 |
| `getRecentData` | `(count?: number) => RoomDataItem[]` | 최근 데이터 조회 |
| `clearHistory` | `() => void` | 히스토리 초기화 |

### Room 관리 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `join` | `() => Promise<void>` | Room 참가 |
| `leave` | `() => Promise<void>` | Room 나가기 |

## 실전 예제

### 예제 1: 플레이어 컨트롤러에서 위치와 회전 전송

```tsx
"use client";

import { useSocketStore } from '@/store/socket.tsx/store';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function PlayerController() {
  const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
  const lastBroadcastTime = useRef(0);
  const playerRef = useRef();

  useFrame((state, delta) => {
    const now = Date.now();
    
    // 100ms마다 위치와 회전 전송 (네트워크 부하 감소)
    if (now - lastBroadcastTime.current > 100) {
      if (playerRef.current && broadcastPlayerTransform) {
        const pos = playerRef.current.position;
        const rot = playerRef.current.rotation;
        
        broadcastPlayerTransform({
          position: { x: pos.x, y: pos.y, z: pos.z },
          rotation: { x: rot.x, y: rot.y, z: rot.z }
        });
        
        lastBroadcastTime.current = now;
      }
    }
  });

  return <mesh ref={playerRef}>...</mesh>;
}
```

### 예제 2: UI에서 다른 플레이어 위치와 회전 표시

```tsx
"use client";

import { useSocketStore } from '@/store/socket.tsx/store';

function PlayerListUI() {
  const users = useSocketStore((state) => state.users);
  const getPlayerTransforms = useSocketStore((state) => state.getPlayerTransforms);

  const playerTransforms = getPlayerTransforms?.() || [];

  return (
    <div>
      <h3>Players ({users.length})</h3>
      <ul>
        {users.map(user => {
          const transform = playerTransforms.find(t => t.clientId === user.socketId);
          return (
            <li key={user.socketId}>
              <div>{user.socketId}</div>
              {transform && (
                <div style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                  <div>Pos: ({transform.data.position.x}, {transform.data.position.y}, {transform.data.position.z})</div>
                  <div>Rot: ({transform.data.rotation.x}, {transform.data.rotation.y}, {transform.data.rotation.z})</div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

### 예제 3: 애니메이션 싱크

```tsx
"use client";

import { useSocketStore } from '@/store/socket.tsx/store';
import { useEffect } from 'react';

function CharacterAnimator({ currentAnimation }: { currentAnimation: string }) {
  const broadcastPlayerAnimation = useSocketStore((state) => state.broadcastPlayerAnimation);

  useEffect(() => {
    if (broadcastPlayerAnimation) {
      broadcastPlayerAnimation(currentAnimation);
    }
  }, [currentAnimation, broadcastPlayerAnimation]);

  return null;
}
```

## 주의사항

1. **Null 체크**: 메소드는 초기에 `null`이므로 사용 전에 반드시 null 체크를 해야 합니다.
   ```tsx
   if (broadcastPlayerPosition) {
     broadcastPlayerPosition({ x, y, z });
   }
   ```

2. **자동 초기화**: `VirtualWorldScreen`을 나가면 Store가 자동으로 초기화됩니다.

3. **네트워크 부하**: 너무 자주 broadcast하면 네트워크 부하가 발생할 수 있습니다. 적절한 간격(100-200ms)을 두고 전송하세요.

4. **메모리**: 데이터 히스토리는 최대 100개까지만 유지됩니다.

## 타입 정의

```typescript
interface RoomUser {
  socketId: string;
  joinedAt: string;
}

interface RoomDataItem {
  type: string;
  timestamp: number;
  data: unknown;
  clientId: string;
}
```

## 참고

- Socket 상태 관리: `src/common/socket/SocketProvider.tsx`
- Socket Hook: `src/feature/TRHEE/virtual/components/hooks/useVirtualWorldSocket.tsx`
- Socket 타입: `src/common/socket/types.ts`


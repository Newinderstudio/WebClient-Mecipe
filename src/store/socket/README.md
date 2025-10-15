# Socket Store

Socket.IO 기반 멀티플레이어 통신을 위한 전역 상태 관리 Store입니다.

## 개요

`VirtualWorldSocket` 컴포넌트가 실행되면 자동으로 Socket 연결을 관리하고, 모든 메소드와 상태를 이 Store에 저장합니다.
다른 컴포넌트에서는 Hook을 직접 사용하지 않고도 Socket 메소드를 호출할 수 있습니다.

## 빠른 시작

### 1. VirtualWorldSocket 설정

```tsx
// VirtualWorld.tsx
import VirtualWorldSocket from './VirtualWorldSocket';

export default function VirtualWorld({ worldCode }: { worldCode: string }) {
  return (
    <div>
      <VirtualWorldSocket
        roomId={worldCode}
        enabled={true}
        serverUrl={process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}
        path={process.env.NEXT_PUBLIC_SOCKET_PATH}
      />
      
      {/* 게임 화면 */}
      <Canvas>...</Canvas>
    </div>
  );
}
```

### 2. 다른 컴포넌트에서 Store 사용

```tsx
"use client";

import { useSocketStore } from '@/store/socket/store';

function PlayerController() {
  // Socket 상태 가져오기
  const isConnected = useSocketStore((state) => state.isConnected);
  const users = useSocketStore((state) => state.users);
  const clientId = useSocketStore((state) => state.clientId);
  
  // Broadcast 메소드 가져오기
  const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);

  // 플레이어 위치 전송
  const sendPosition = (position: {x: number, y: number, z: number}) => {
    if (broadcastPlayerTransform) {
      broadcastPlayerTransform({
        position,
        rotation: { x: 0, y: 0, z: 0 },
        speed: 1,
      });
    }
  };

  return (
    <div>
      <p>연결: {isConnected ? '✅' : '❌'}</p>
      <p>플레이어: {users.length}명</p>
      <p>내 ID: {clientId}</p>
    </div>
  );
}
```

## Store 구조

### 상태 (State)

| 속성 | 타입 | 설명 |
|------|------|------|
| `isConnected` | `boolean` | Socket 연결 상태 |
| `clientId` | `string \| null` | 내 클라이언트 ID |
| `currentRoomId` | `string \| null` | 현재 참가한 Room ID |
| `isInRoom` | `boolean` | Room 참가 여부 |
| `users` | `RoomUser[]` | Room 내 사용자 목록 |
| `userCount` | `number` | 사용자 수 |
| `roomDataHistory` | `RoomDataItem[]` | Room 데이터 히스토리 (최대 100개) |

### Broadcast 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `broadcastPlayerTransform` | `(data: PlayerTransformData) => void` | 플레이어 위치, 회전, 속도 전송 |
| `broadcastPlayerAnimation` | `(animation: string) => void` | 애니메이션 상태 전송 |
| `broadcastCustomEvent` | `(type: string, data: unknown) => void` | 커스텀 이벤트 전송 |

### 데이터 조회 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `getPlayerTransforms` | `() => PlayerTransformData[]` | 모든 플레이어 Transform 조회 |
| `getPlayerAnimations` | `() => string[]` | 모든 플레이어 애니메이션 조회 |
| `getRecentData` | `(count?: number) => RoomDataItem[]` | 최근 데이터 조회 (기본 10개) |
| `subscribeToRoomData` | `(callback: (data: ClientMessage[]) => void) => () => void` | Room 데이터 구독 |
| `clearHistory` | `() => void` | 히스토리 초기화 |

### Room 관리 메소드

| 메소드 | 시그니처 | 설명 |
|--------|----------|------|
| `initializeEnvironment` | `(config) => void` | Socket 환경 초기화 (자동 호출됨) |

## 실전 예제

### 예제 1: 플레이어 위치 전송 (KeyboardLocalController)

```tsx
import { useSocketStore } from '@/store/socket/store';
import { useFrame } from '@react-three/fiber';

export class KeyboardLocalController {
  private broadcastPlayerTransform?: (data: PlayerTransformData) => void;

  initialize(rootState, options) {
    // Store에서 broadcast 메소드 가져오기
    this.broadcastPlayerTransform = options.broadcastPlayerTransform;
  }

  postMovementProcess(playerControl: PlayerControlInterface): void {
    // 위치 변경 시 전송
    if (this.broadcastPlayerTransform) {
      this.broadcastPlayerTransform({
        position: { x, y, z },
        rotation: { x, y, z },
        speed: 1.0,
      });
    }
  }
}
```

### 예제 2: 다른 플레이어 렌더링

```tsx
import { useSocketStore } from '@/store/socket/store';
import { useEffect, useState } from 'react';

function OtherPlayers() {
  const [playerTransforms, setPlayerTransforms] = useState<Map<string, PlayerTransformData>>(new Map());
  const subscribeToRoomData = useSocketStore((state) => state.subscribeToRoomData);

  useEffect(() => {
    if (!subscribeToRoomData) return;

    // Room 데이터 구독
    const unsubscribe = subscribeToRoomData((messages) => {
      const transforms = new Map<string, PlayerTransformData>();
      
      messages.forEach((msg) => {
        if (msg.type === 'PLAYER_TRANSFORM') {
          transforms.set(msg.clientId, msg.data as PlayerTransformData);
        }
      });
      
      setPlayerTransforms(transforms);
    });

    return unsubscribe;
  }, [subscribeToRoomData]);

  return (
    <>
      {Array.from(playerTransforms.entries()).map(([clientId, transform]) => (
        <mesh key={clientId} position={[transform.position.x, transform.position.y, transform.position.z]}>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      ))}
    </>
  );
}
```

### 예제 3: UI에서 사용자 목록 표시

```tsx
import { useSocketStore } from '@/store/socket/store';

function PlayerListUI() {
  const users = useSocketStore((state) => state.users);
  const isConnected = useSocketStore((state) => state.isConnected);
  const currentRoomId = useSocketStore((state) => state.currentRoomId);

  if (!isConnected) {
    return <div>연결 중...</div>;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
    }}>
      <h4>Room: {currentRoomId}</h4>
      <p>플레이어: {users.length}명</p>
      <ul>
        {users.map(user => (
          <li key={user.socketId}>
            {user.socketId.substring(0, 8)}...
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 예제 4: 커스텀 이벤트

```tsx
import { useSocketStore } from '@/store/socket/store';

function ChatSystem() {
  const broadcastCustomEvent = useSocketStore((state) => state.broadcastCustomEvent);
  const subscribeToRoomData = useSocketStore((state) => state.subscribeToRoomData);
  const [messages, setMessages] = useState<string[]>([]);

  // 메시지 수신
  useEffect(() => {
    if (!subscribeToRoomData) return;

    return subscribeToRoomData((data) => {
      data.forEach((msg) => {
        if (msg.type === 'CHAT_MESSAGE') {
          setMessages((prev) => [...prev, msg.data as string]);
        }
      });
    });
  }, [subscribeToRoomData]);

  // 메시지 전송
  const sendMessage = (text: string) => {
    if (broadcastCustomEvent) {
      broadcastCustomEvent('CHAT_MESSAGE', text);
    }
  };

  return (
    <div>
      {messages.map((msg, i) => <p key={i}>{msg}</p>)}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
}
```

## 데이터 타입

### PlayerTransformData

```typescript
interface PlayerTransformData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  speed: number;
}
```

### RoomUser

```typescript
interface RoomUser {
  socketId: string;
  joinedAt: string;
}
```

### RoomDataItem

```typescript
interface RoomDataItem {
  type: RoomDataType;
  timestamp: number;
  data: unknown;
  clientId: string;
}
```

### ClientMessage

```typescript
interface ClientMessage {
  type: string;
  data: unknown;
  clientId: string;
  timestamp: number;
}
```

## 네트워크 최적화

### Throttling

너무 자주 전송하면 네트워크 부하가 발생합니다. 적절한 간격을 두세요:

```tsx
const lastBroadcastTime = useRef(0);

useFrame(() => {
  const now = Date.now();
  
  // 100ms(10fps)마다 전송
  if (now - lastBroadcastTime.current > 100) {
    broadcastPlayerTransform({ ... });
    lastBroadcastTime.current = now;
  }
});
```

### 권장 전송 주기

- **플레이어 Transform**: 100ms (10fps)
- **애니메이션 변경**: 즉시 (변경 시에만)
- **채팅 메시지**: 즉시
- **커스텀 이벤트**: 상황에 따라 다름

## 주의사항

1. **Null 체크 필수**: 메소드는 Socket 연결 전에는 `null`입니다
   ```tsx
   if (broadcastPlayerTransform) {
     broadcastPlayerTransform({ ... });
   }
   ```

2. **자동 정리**: 컴포넌트 언마운트 시 Store가 자동으로 정리됩니다

3. **메모리 관리**: 데이터 히스토리는 최대 100개까지만 유지됩니다

4. **Room ID**: Room ID는 고유해야 합니다. 같은 Room ID를 사용하는 클라이언트끼리만 통신됩니다

## 연관 파일

- Socket Store: `src/store/socket/store.tsx`
- Socket Hook: `src/feature/TRHEE/virtual/components/VirtualWorldSocket.tsx`
- Socket 타입: `src/util/socket/socket-message-types.ts`
- Socket 이벤트: `src/util/socket/socket-event-type.ts`
- 변경 이력: `src/store/socket/CHANGES.md`

## 디버깅

### Store 상태 확인

브라우저 콘솔에서:
```javascript
// 전체 상태 확인
useSocketStore.getState()

// 특정 값 확인
useSocketStore.getState().isConnected
useSocketStore.getState().users
```

### 연결 문제 해결

1. `.env` 파일에 Socket 서버 URL 확인:
   ```
   NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_PATH=/socket.io
   ```

2. Socket 서버가 실행 중인지 확인

3. 브라우저 개발자 도구 → Network → WS 탭에서 WebSocket 연결 확인

## 성능 팁

1. **선택적 구독**: 필요한 값만 선택하여 불필요한 리렌더링 방지
   ```tsx
   // ✅ 좋음: 필요한 값만
   const users = useSocketStore((state) => state.users);
   
   // ❌ 나쁨: 전체 state
   const state = useSocketStore((state) => state);
   ```

2. **메모이제이션**: 여러 값을 함께 사용할 때
   ```tsx
   const { isConnected, users } = useSocketStore(
     (state) => ({
       isConnected: state.isConnected,
       users: state.users,
     }),
     shallow  // 얕은 비교
   );
   ```

3. **Throttling**: 전송 빈도 제한으로 네트워크 부하 감소

## 확장 가능성

### 새로운 이벤트 타입 추가

1. `src/util/socket/socket-event-type.ts`에 이벤트 타입 추가
2. `broadcastCustomEvent` 사용
3. `subscribeToRoomData`로 수신

예:
```tsx
// 전송
broadcastCustomEvent('PLAYER_ATTACK', { targetId: '123', damage: 50 });

// 수신
subscribeToRoomData((messages) => {
  messages.forEach((msg) => {
    if (msg.type === 'PLAYER_ATTACK') {
      handleAttack(msg.data);
    }
  });
});
```

## 참고

- Virtual Touch Control: `src/common/THREE/input/README.md`
- Three.js 통합: `src/common/THREE/Character/controllers/`

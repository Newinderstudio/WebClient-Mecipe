# Socket.IO 통신 모듈

VirtualWorld에서 실시간 멀티플레이어 통신을 위한 Socket.IO 모듈입니다.

## 구조

```
src/common/socket/
├── SocketProvider.tsx          # Socket Context Provider
├── types.ts                    # 타입 정의
├── index.ts                    # 모듈 진입점
├── hooks/
│   ├── useSocket.tsx           # 기본 Socket Hook
│   ├── useRoomSocket.tsx       # Room 관련 Socket Hook
│   └── useRoomDataHandler.tsx  # Room 데이터 핸들러 Hook
└── README.md
```

## 설치

Socket.IO 클라이언트는 이미 설치되어 있습니다.

```bash
npm install socket.io-client
```

## 환경 변수 설정

`.env.local` 파일에 Socket 서버 URL을 설정하세요:

```env
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
```

## 사용 방법

### 1. SocketProvider 설정

앱의 최상위 레벨(또는 필요한 레이아웃)에 `SocketProvider`를 추가합니다:

```tsx
import { SocketProvider } from '@/common/socket';

export default function Layout({ children }) {
  return (
    <SocketProvider serverUrl={process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}>
      {children}
    </SocketProvider>
  );
}
```

### 2. Room에 참가하기

```tsx
import { useRoomSocket } from '@/common/socket';

function MyComponent() {
  const {
    isConnected,
    currentRoomId,
    clientsInRoom,
    isInRoom,
    join,
    leave,
    broadcast,
  } = useRoomSocket({
    roomId: 'my-room-id',
    autoJoin: true, // 자동으로 방에 참가
    onUserJoined: (payload) => {
      console.log('User joined:', payload);
    },
    onUserLeft: (payload) => {
      console.log('User left:', payload);
    },
    onRoomData: (payload) => {
      console.log('Room data received:', payload);
    },
  });

  // 수동으로 방에 참가
  const handleJoinRoom = async () => {
    const response = await join();
    console.log('Join response:', response);
  };

  // 방에서 나가기
  const handleLeaveRoom = async () => {
    const response = await leave();
    console.log('Leave response:', response);
  };

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Room: {currentRoomId}</p>
      <p>Clients: {clientsInRoom}</p>
    </div>
  );
}
```

### 3. 데이터 브로드캐스트

```tsx
import { useRoomSocket } from '@/common/socket';

function MyComponent() {
  const { broadcast } = useRoomSocket({
    roomId: 'my-room-id',
  });

  const sendPlayerPosition = async (x: number, y: number, z: number) => {
    const response = await broadcast('playerPosition', { x, y, z });
    console.log('Broadcast response:', response);
  };

  return (
    <button onClick={() => sendPlayerPosition(1, 2, 3)}>
      Send Position
    </button>
  );
}
```

### 4. VirtualWorld에서 사용 (권장)

VirtualWorld 전용 Hook을 사용하여 더 쉽게 통신할 수 있습니다:

```tsx
import { useVirtualWorldSocket } from '@/feature/TRHEE/virtual/hooks/useVirtualWorldSocket';

function VirtualWorldScreen() {
  const {
    isConnected,
    currentRoomId,
    clientsInRoom,
    users,
    broadcastPlayerPosition,
    broadcastPlayerRotation,
    broadcastPlayerAnimation,
    getPlayerPositions,
  } = useVirtualWorldSocket({
    roomId: 'virtual-world-room-1',
    enabled: true,
  });

  // 플레이어 위치 브로드캐스트
  const handleMove = (x: number, y: number, z: number) => {
    broadcastPlayerPosition({ x, y, z });
  };

  // 플레이어 회전 브로드캐스트
  const handleRotate = (x: number, y: number, z: number) => {
    broadcastPlayerRotation({ x, y, z });
  };

  // 애니메이션 상태 브로드캐스트
  const handleAnimation = (animation: string) => {
    broadcastPlayerAnimation(animation);
  };

  return <div>Virtual World</div>;
}
```

### 5. Room 데이터 관리

```tsx
import { useRoomDataHandler } from '@/common/socket';

function MyComponent() {
  const {
    users,
    userCount,
    roomDataHistory,
    handleUserJoined,
    handleUserLeft,
    handleRoomData,
    getDataByType,
    getRecentData,
    clearHistory,
  } = useRoomDataHandler();

  // 특정 타입의 데이터만 가져오기
  const playerPositions = getDataByType('playerPosition');

  // 최근 10개 데이터 가져오기
  const recentData = getRecentData(10);

  return (
    <div>
      <p>Users in room: {userCount}</p>
      <ul>
        {users.map(user => (
          <li key={user.socketId}>{user.socketId}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API 문서

### Socket 이벤트

#### 송신 (Emit)

1. **joinRoom**
   - Payload: `{ roomId: string }`
   - Callback: `{ success: boolean, roomId: string, clientsInRoom: number, message: string }`

2. **leaveRoom**
   - Payload: `{ any }`
   - Callback: `{ success: boolean, leftRoom?: string, message: string }`

3. **broadCastRoomData**
   - Payload: `{ type: string, data: any }`
   - Callback: `{ success: boolean, message: string, dataType?: string, roomId?: string }`

#### 수신 (On)

1. **userJoined**
   - Payload: `{ socketId: string, roomId: string, timestamp: string }`

2. **userLeft**
   - Payload: `{ socketId: string, roomId: string, timestamp: string }`

3. **roomData**
   - Payload: `{ roomId: string, timestamp: number, data: Array<{ type: string, timestamp: number, data: any, clientId: string }> }`

## Hooks

### useSocket()

기본 Socket 연결 정보를 제공합니다.

```tsx
const { socket, isConnected, currentRoomId, clientsInRoom } = useSocket();
```

### useRoomSocket(options)

Room 관련 Socket 기능을 제공합니다.

**Options:**
- `roomId: string` - 참가할 Room ID
- `autoJoin?: boolean` - 자동 참가 여부 (기본값: true)
- `onUserJoined?: (payload) => void` - 사용자 참가 이벤트 핸들러
- `onUserLeft?: (payload) => void` - 사용자 퇴장 이벤트 핸들러
- `onRoomData?: (payload) => void` - Room 데이터 수신 핸들러

### useRoomDataHandler()

Room 데이터를 관리하고 처리합니다.

```tsx
const {
  users,
  userCount,
  roomDataHistory,
  handleUserJoined,
  handleUserLeft,
  handleRoomData,
  getDataByType,
  getRecentData,
  getDataByClient,
  clearHistory,
} = useRoomDataHandler();
```

### useVirtualWorldSocket(options)

VirtualWorld 전용 Socket Hook입니다.

**Options:**
- `roomId: string` - 참가할 Room ID
- `enabled?: boolean` - Socket 활성화 여부 (기본값: true)

## 예제

VirtualWorldScreen에서의 전체 사용 예시는 `src/feature/TRHEE/virtual/VirtualWorldScreen.tsx`를 참고하세요.

## 주의사항

1. **자동 참가/퇴장**: `useRoomSocket`의 `autoJoin`이 `true`일 때, 컴포넌트가 마운트되면 자동으로 방에 참가하고, 언마운트되면 자동으로 나갑니다.

2. **메모리 관리**: `useRoomDataHandler`는 최대 100개의 데이터 히스토리만 유지합니다. 더 많은 데이터가 필요한 경우 Hook을 수정하세요.

3. **서버 연결**: Socket 서버가 실행 중이어야 정상적으로 작동합니다.

4. **에러 처리**: 프로덕션 환경에서는 적절한 에러 처리를 추가하세요.

## 라이센스

MIT


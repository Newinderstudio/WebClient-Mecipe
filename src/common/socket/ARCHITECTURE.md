# Socket.IO 아키텍처

## 전체 구조

```
src/
├── app/
│   └── (three)/
│       └── layout.tsx                      # SocketProvider 설정
│
├── common/
│   └── socket/
│       ├── SocketProvider.tsx              # Socket Context Provider
│       ├── types.ts                        # 타입 정의
│       ├── index.ts                        # 진입점
│       ├── README.md                       # 사용 설명서
│       ├── ARCHITECTURE.md                 # 아키텍처 문서 (현재 파일)
│       ├── hooks/
│       │   ├── useSocket.tsx               # 기본 Socket Hook
│       │   ├── useRoomSocket.tsx           # Room 관련 Hook
│       │   └── useRoomDataHandler.tsx      # 데이터 핸들러 Hook
│       └── examples/
│           ├── SocketExample.tsx           # 사용 예제
│           └── README.md                   # 예제 설명
│
└── feature/
    └── TRHEE/
        └── virtual/
            ├── VirtualWorldScreen.tsx      # Socket 사용 화면
            └── hooks/
                └── useVirtualWorldSocket.tsx  # VirtualWorld 전용 Hook
```

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                      Socket 서버                              │
│                  (ws://localhost:3001)                       │
└─────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │
                  Socket.IO   │ │ Socket.IO
                    Client    │ │   Events
                              │ ▼
┌─────────────────────────────────────────────────────────────┐
│                    SocketProvider                            │
│  - Socket 인스턴스 관리                                       │
│  - 연결 상태 관리                                            │
│  - 이벤트 emit/on 관리                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    Context API
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  useSocket   │    │  useRoomSocket   │    │ useRoomDataHandler│
│              │    │                  │    │                 │
│ - 기본 정보  │    │ - Room 참가/퇴장 │    │ - 사용자 관리   │
│ - 연결 상태  │    │ - 데이터 송신    │    │ - 데이터 수집   │
└──────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              │ Combined
                              ▼
                ┌──────────────────────────────┐
                │  useVirtualWorldSocket       │
                │                              │
                │ - 플레이어 위치 브로드캐스트  │
                │ - 플레이어 회전 브로드캐스트  │
                │ - 애니메이션 상태 브로드캐스트│
                │ - 데이터 조회                │
                └──────────────────────────────┘
                              │
                              │ Used in
                              ▼
                ┌──────────────────────────────┐
                │   VirtualWorldScreen         │
                │                              │
                │ - 3D 월드 렌더링             │
                │ - 실시간 멀티플레이어 통신    │
                └──────────────────────────────┘
```

## 이벤트 흐름

### 송신 (Client → Server)

```
Component
    │
    │ broadcast('playerPosition', {x, y, z})
    ▼
useVirtualWorldSocket
    │
    │ broadcastPlayerPosition({x, y, z})
    ▼
useRoomSocket
    │
    │ emit('broadCastRoomData', {type, data})
    ▼
SocketProvider
    │
    │ socket.emit(...)
    ▼
Socket Server
```

### 수신 (Server → Client)

```
Socket Server
    │
    │ emit('roomData', payload)
    ▼
SocketProvider
    │
    │ socket.on('roomData', handler)
    ▼
useRoomSocket
    │
    │ onRoomData callback
    ▼
useRoomDataHandler
    │
    │ handleRoomData(payload)
    │ - 데이터 저장
    │ - 히스토리 관리
    ▼
Component
    │
    │ roomDataHistory 업데이트
    │ UI 렌더링
```

## 레이어 설명

### 1. Provider Layer (SocketProvider)

**책임:**
- Socket.IO 클라이언트 인스턴스 생성 및 관리
- 연결 상태 관리
- 기본 이벤트 리스너 등록
- Context를 통한 데이터 공유

**주요 기능:**
- Socket 연결/해제
- 재연결 관리
- 기본 이벤트 핸들링

### 2. Hook Layer

#### useSocket (기본 Hook)
- Socket 연결 정보만 제공
- 가장 낮은 레벨의 Hook

#### useRoomSocket (Room 관리 Hook)
- Room 참가/퇴장
- 데이터 브로드캐스트
- Room 이벤트 리스닝
- 자동 참가/퇴장 관리

#### useRoomDataHandler (데이터 관리 Hook)
- 사용자 목록 관리
- 데이터 히스토리 관리
- 데이터 필터링/조회

### 3. Feature Layer

#### useVirtualWorldSocket (VirtualWorld 전용 Hook)
- useRoomSocket + useRoomDataHandler 통합
- VirtualWorld 특화 메소드 제공
- 도메인 로직 캡슐화

## 설계 원칙

### 1. 관심사의 분리 (Separation of Concerns)

각 레이어는 명확한 책임을 가집니다:
- **Provider**: Socket 연결 관리
- **Hooks**: 비즈니스 로직
- **Components**: UI 렌더링

### 2. 재사용성 (Reusability)

- `useSocket`: 어디서든 기본 Socket 정보 사용
- `useRoomSocket`: 다양한 Room 시나리오에 사용
- `useRoomDataHandler`: 독립적인 데이터 관리

### 3. 확장성 (Extensibility)

새로운 기능 추가가 쉽습니다:
```tsx
// 새로운 도메인별 Hook 생성
function useChatSocket({ roomId }) {
  const { broadcast, ... } = useRoomSocket({ roomId });
  
  const sendMessage = (message) => {
    broadcast('chat', { message });
  };
  
  return { sendMessage, ... };
}
```

### 4. 타입 안정성 (Type Safety)

모든 이벤트와 페이로드는 타입으로 정의됩니다:
```typescript
interface JoinRoomPayload {
  roomId: string;
}

interface JoinRoomCallback {
  success: boolean;
  roomId: string;
  clientsInRoom: number;
  message: string;
}
```

## 사용 패턴

### 패턴 1: 간단한 Socket 연결 확인

```tsx
function MyComponent() {
  const { isConnected } = useSocket();
  return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

### 패턴 2: Room 참가/퇴장

```tsx
function RoomComponent() {
  const { join, leave, isInRoom } = useRoomSocket({
    roomId: 'my-room',
    autoJoin: true,
  });
  
  return <div>In Room: {isInRoom}</div>;
}
```

### 패턴 3: 데이터 브로드캐스트 및 수신

```tsx
function GameComponent() {
  const {
    broadcast,
    roomDataHistory,
  } = useVirtualWorldSocket({
    roomId: 'game-room',
  });
  
  const handleMove = (position) => {
    broadcast('playerMove', position);
  };
  
  return <div>...</div>;
}
```

## 성능 고려사항

### 1. 메모리 관리

- 데이터 히스토리는 최대 100개로 제한
- 컴포넌트 언마운트 시 자동으로 Room 퇴장

### 2. 리렌더링 최적화

- Context는 최소한의 상태만 공유
- Hook에서 useCallback으로 함수 메모이제이션

### 3. 네트워크 최적화

- 불필요한 브로드캐스트 최소화
- 데이터 압축 고려 (서버 측)

## 보안 고려사항

1. **인증**: Socket 연결 시 토큰 전송 (구현 필요)
2. **권한**: Room 참가 권한 검증 (서버 측)
3. **데이터 검증**: 수신된 데이터 검증 (클라이언트 측)

## 향후 개선 사항

- [ ] Socket 재연결 UI 표시
- [ ] 에러 처리 개선
- [ ] 오프라인 모드 지원
- [ ] 데이터 압축
- [ ] 타임스탬프 동기화
- [ ] 레이턴시 측정
- [ ] 연결 품질 모니터링

## 트러블슈팅

### Socket이 연결되지 않을 때

1. Socket 서버가 실행 중인지 확인
2. NEXT_PUBLIC_SOCKET_SERVER_URL 환경변수 확인
3. CORS 설정 확인 (서버 측)

### Room에 참가할 수 없을 때

1. Socket 연결 상태 확인
2. roomId가 올바른지 확인
3. 서버 로그 확인

### 데이터가 수신되지 않을 때

1. 이벤트 리스너가 등록되었는지 확인
2. 서버에서 올바른 이벤트를 emit하는지 확인
3. 네트워크 탭에서 WebSocket 메시지 확인

## 참고 자료

- [Socket.IO 공식 문서](https://socket.io/docs/)
- [React Context API](https://react.dev/reference/react/useContext)
- [React Hooks](https://react.dev/reference/react)


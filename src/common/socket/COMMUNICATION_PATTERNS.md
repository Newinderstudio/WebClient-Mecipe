# Socket.IO 통신 패턴 상세 설명

## 🔄 3가지 통신 패턴

### 1️⃣ Request + Response (요청-응답)

**같은 연결에서 일어나는 1:1 통신**

```typescript
// Client
socket.emit('joinRoom',                      // 이벤트 이름
  { roomId: 'room-1' },                      // ← Request (보내는 데이터)
  (response) => {                             // ← Response (콜백으로 받는 응답)
    console.log(response.success);
  }
);

// Server
socket.on('joinRoom', (request, callback) => {
  // request: JoinRoomRequest
  // callback: (response: JoinRoomResponse) => void
  
  callback({                                  // ← Response 전송
    success: true,
    roomId: request.roomId,
    clientsInRoom: 5
  });
});
```

**특징:**
- ✅ 1:1 통신 (요청한 클라이언트만 응답 받음)
- ✅ 동기적 느낌 (콜백으로 즉시 응답)
- ✅ HTTP Request/Response와 유사

---

### 2️⃣ Event (브로드캐스트)

**별도의 독립적인 이벤트**

```typescript
// Server (모든 클라이언트에게 전송)
io.to(roomId).emit('userJoined', {           // ← Event 전송
  socketId: socket.id,
  roomId: roomId,
  timestamp: new Date().toISOString()
});

// Client (이벤트 수신)
socket.on('userJoined', (event) => {         // ← Event 수신
  console.log(`${event.socketId}님이 입장했습니다`);
});
```

**특징:**
- ✅ 1:N 통신 (여러 클라이언트가 받음)
- ✅ 비동기적 (언제든 올 수 있음)
- ✅ 알림/브로드캐스트 용도

---

## 📝 타입 정의 예시

```typescript
// ============================================
// 패턴 1: Request + Response
// ============================================

/** Client가 Server에게 전송 */
interface JoinRoomRequest {
  roomId: string;
}

/** Server가 Client에게 콜백으로 응답 */
interface JoinRoomResponse {
  success: boolean;
  roomId: string;
  clientsInRoom: number;
  message: string;
}

// ============================================
// 패턴 2: Event
// ============================================

/** Server가 모든 Client에게 브로드캐스트 */
interface UserJoinedEvent {
  socketId: string;
  roomId: string;
  timestamp: string;
}
```

---

## 🎬 실제 시나리오

### 시나리오: 사용자 3명이 있는 채팅방에 새 사용자가 입장

```
사용자 A, B, C가 이미 방에 있음
사용자 D가 새로 입장 시도
```

#### Step 1: 사용자 D가 입장 요청
```typescript
// Client D
socket.emit('joinRoom',
  { roomId: 'room-1' },                      // JoinRoomRequest
  (response) => {                             // JoinRoomResponse
    if (response.success) {
      console.log(`입장 성공! 현재 ${response.clientsInRoom}명`);
      // 출력: "입장 성공! 현재 4명"
    }
  }
);
```

#### Step 2: 서버가 모든 사용자에게 알림
```typescript
// Server
socket.on('joinRoom', (request, callback) => {
  socket.join(request.roomId);
  
  // 1. 요청한 사용자에게만 응답 (Response)
  callback({
    success: true,
    roomId: request.roomId,
    clientsInRoom: 4,
    message: 'Joined successfully'
  });
  
  // 2. 모든 사용자에게 알림 (Event)
  io.to(request.roomId).emit('userJoined', {
    socketId: socket.id,
    roomId: request.roomId,
    timestamp: new Date().toISOString()
  });
});
```

#### Step 3: 다른 사용자들이 알림 받음
```typescript
// Client A, B, C, D 모두 수신
socket.on('userJoined', (event) => {         // UserJoinedEvent
  console.log(`${event.socketId}님이 입장했습니다`);
  // Client A: "socket-D님이 입장했습니다"
  // Client B: "socket-D님이 입장했습니다"
  // Client C: "socket-D님이 입장했습니다"
  // Client D: "socket-D님이 입장했습니다" (자기 자신도 받음)
});
```

---

## 🔀 통신 흐름 다이어그램

### Request + Response
```
Client D                Server
   │                       │
   │──── joinRoom ────────>│  Request
   │   { roomId: '...' }   │
   │                       │
   │<──── callback ────────│  Response
   │   { success: true }   │
   │                       │
```

### Event (Broadcast)
```
Server                 Client A    Client B    Client C    Client D
  │                        │           │           │           │
  │──── userJoined ───────>│           │           │           │
  │──── userJoined ───────────────────>│           │           │
  │──── userJoined ───────────────────────────────>│           │
  │──── userJoined ───────────────────────────────────────────>│
  │     { socketId: 'D' }
```

---

## 📋 네이밍 컨벤션 정리

| 타입 | 용도 | 네이밍 | 예시 |
|------|------|--------|------|
| **Request** | emit으로 보내는 데이터 | `{Event}Request` | `JoinRoomRequest` |
| **Response** | emit 콜백으로 받는 응답 | `{Event}Response` | `JoinRoomResponse` |
| **Event** | 서버 브로드캐스트 이벤트 | `{Event}Event` | `UserJoinedEvent` |

---

## 💡 언제 무엇을 사용할까?

### Request + Response를 사용하세요:
✅ 클라이언트가 서버에게 **요청**하고 **결과를 받아야** 할 때
- 방 참가/퇴장
- 메시지 전송
- 데이터 저장/수정/삭제

**예시:**
```typescript
// 메시지 전송 후 성공 여부 확인
socket.emit('sendMessage',
  { text: 'Hello' } as SendMessageRequest,
  (response: SendMessageResponse) => {
    if (response.success) {
      showToast('전송 완료');
    } else {
      showToast('전송 실패: ' + response.message);
    }
  }
);
```

### Event를 사용하세요:
✅ 서버가 **모든 클라이언트에게 알림**을 보낼 때
- 사용자 입장/퇴장 알림
- 새 메시지 도착
- 게임 상태 변경
- 실시간 데이터 업데이트

**예시:**
```typescript
// 모든 사용자에게 새 메시지 알림
socket.on('messageReceived', (event: MessageReceivedEvent) => {
  addMessageToUI(event.message);
  playNotificationSound();
});
```

---

## 🚀 실전 팁

### 1. Response는 항상 success 필드 포함
```typescript
interface XxxResponse {
  success: boolean;  // ✅ 항상 포함
  message: string;   // ✅ 에러 메시지용
  data?: YourData;   // 성공 시 데이터
}
```

### 2. Event는 timestamp 포함 권장
```typescript
interface XxxEvent {
  timestamp: string;  // ✅ ISO 8601 형식
  // ... other fields
}
```

### 3. Request는 최소한의 데이터만
```typescript
// ❌ 나쁜 예
interface JoinRoomRequest {
  roomId: string;
  userId: string;      // 서버가 socket.id로 알 수 있음
  timestamp: string;   // 서버가 생성해야 함
}

// ✅ 좋은 예
interface JoinRoomRequest {
  roomId: string;      // 필요한 것만!
}
```

---

## 📖 참고

- Socket.IO 공식 문서: https://socket.io/docs/
- Acknowledgements: https://socket.io/docs/v4/emitting-events/#acknowledgements
- Broadcasting: https://socket.io/docs/v4/broadcasting-events/


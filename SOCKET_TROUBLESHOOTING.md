# Socket 연결 문제 해결 가이드

## 🚨 자주 발생하는 오류

### 1. WebSocket connection failed

```
WebSocket connection to 'ws://localhost:4100/?EIO=4&transport=websocket' failed
```

## ✅ 해결 방법

### Step 1: Socket 서버 확인

Socket 서버가 실제로 실행 중인지 확인하세요.

```bash
# Windows
netstat -ano | findstr :4100

# Mac/Linux  
lsof -i :4100
```

**아무것도 나오지 않으면** → Socket 서버가 실행되지 않은 것입니다!

### Step 2: 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```env
# .env.local

# Socket 서버 URL (http:// 또는 https:// 프로토콜 사용)
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4100

# Socket.IO path (기본적으로 비워두세요)
NEXT_PUBLIC_SOCKET_PATH=
```

**중요사항:**
- ✅ `http://localhost:4100` (올바름)
- ❌ `ws://localhost:4100` (틀림 - Socket.IO가 자동으로 변환)
- ✅ 환경변수 이름에 `NEXT_PUBLIC_` 접두사 필수!

### Step 3: Next.js 개발 서버 재시작

환경변수를 변경했으면 **반드시** 서버를 재시작해야 합니다:

```bash
# 현재 실행 중인 서버 종료 (Ctrl + C)
# 그 다음:
npm run dev
```

### Step 4: 브라우저 콘솔 확인

개발자 도구(F12)를 열고 콘솔에서 다음 메시지를 확인하세요:

```
🔌 Socket connecting to: http://localhost:4100
📁 Socket path: 
```

**만약 다른 URL이 표시된다면** → 환경변수가 제대로 로드되지 않은 것입니다.

### Step 5: Socket 서버 실행

Socket 서버가 없다면 먼저 실행해야 합니다.

**서버 예시 (Node.js):**

```javascript
// server.js
const { Server } = require('socket.io');

const io = new Server(4100, {
  cors: {
    origin: "http://localhost:3000",  // Next.js 클라이언트 주소
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

console.log('🚀 Socket.IO server running on port 4100');
```

**실행:**
```bash
node server.js
```

## 🔍 상세 디버깅

### 환경변수가 제대로 로드되는지 확인

`src/app/(three)/layout.tsx`에 임시로 추가:

```tsx
function ThreeLayout({ children }: { children: React.ReactNode }) {
  // 디버깅용 (개발 환경에서만)
  console.log('ENV:', {
    url: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
    path: process.env.NEXT_PUBLIC_SOCKET_PATH
  });

  return (
    <SocketProvider
      serverUrl={process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001'}
      path={process.env.NEXT_PUBLIC_SOCKET_PATH || ''}
    >
      {children}
    </SocketProvider>
  );
}
```

### 연결 오류 상세 정보 확인

브라우저 콘솔에 다음과 같은 메시지가 표시됩니다:

```
❌ Socket connection error: <에러 메시지>
Server URL: http://localhost:4100
Path: 
```

## 🛠️ 일반적인 문제들

### 1. ECONNREFUSED

```
Error: connect ECONNREFUSED 127.0.0.1:4100
```

**원인:** Socket 서버가 실행되지 않음  
**해결:** Socket 서버를 실행하세요

### 2. CORS 에러

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**원인:** Socket 서버의 CORS 설정이 잘못됨  
**해결:** Socket 서버에 CORS 설정 추가

```javascript
const io = new Server(4100, {
  cors: {
    origin: "http://localhost:3000",  // 클라이언트 주소와 정확히 일치해야 함
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 3. 포트 이미 사용 중

```
Error: listen EADDRINUSE: address already in use :::4100
```

**원인:** 다른 프로세스가 4100 포트를 사용 중  
**해결:** 

```bash
# Windows
netstat -ano | findstr :4100
taskkill /PID <PID번호> /F

# Mac/Linux
lsof -i :4100
kill -9 <PID>
```

### 4. 환경변수가 적용되지 않음

**원인:** 
- Next.js 서버를 재시작하지 않음
- `.env.local` 파일 위치가 잘못됨
- 환경변수 이름에 `NEXT_PUBLIC_` 접두사가 없음

**해결:**
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 `NEXT_PUBLIC_`로 시작하는지 확인
3. Next.js 개발 서버 재시작

## 📋 체크리스트

연결 전에 다음 사항들을 확인하세요:

- [ ] Socket 서버가 실행 중인가?
- [ ] `.env.local` 파일이 프로젝트 루트에 있는가?
- [ ] 환경변수 이름에 `NEXT_PUBLIC_` 접두사가 있는가?
- [ ] Next.js 개발 서버를 재시작했는가?
- [ ] 브라우저 콘솔에서 올바른 URL로 연결을 시도하는가?
- [ ] Socket 서버의 CORS 설정이 올바른가?
- [ ] 포트 번호가 일치하는가?

## 🎯 빠른 테스트

최소한의 설정으로 테스트:

**1. Socket 서버 실행 (별도 터미널):**
```bash
npx socket.io-server 4100
```

**2. 환경변수 설정:**
```env
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4100
NEXT_PUBLIC_SOCKET_PATH=
```

**3. Next.js 재시작:**
```bash
npm run dev
```

**4. 브라우저에서 페이지 새로고침**

콘솔에 `✅ Socket connected: <socket-id>`가 표시되면 성공!

## 💡 추가 팁

### 개발 환경별 설정

```env
# .env.local (로컬 개발)
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:4100

# .env.production (프로덕션)
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-socket-server.com
```

### Socket.IO 버전 확인

클라이언트와 서버의 Socket.IO 버전이 호환되는지 확인하세요:

```bash
# 클라이언트
npm list socket.io-client

# 서버
npm list socket.io
```

## 📞 여전히 안 된다면?

1. 브라우저 콘솔의 전체 에러 로그 복사
2. Socket 서버 로그 확인
3. 환경변수 설정 재확인
4. 네트워크 탭에서 WebSocket 연결 시도 확인


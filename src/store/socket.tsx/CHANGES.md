# Socket Store 변경사항

## 변경 이유

플레이어의 위치(position)와 회전(rotation)을 따로 전송하는 것이 아니라, 하나로 묶어서 전송하고 수신하도록 개선했습니다.

## 주요 변경사항

### ❌ 이전 방식 (분리)

```tsx
// 위치 전송
broadcastPlayerPosition({ x: 1, y: 2, z: 3 });

// 회전 전송
broadcastPlayerRotation({ x: 0, y: 1.5, z: 0 });

// 위치 조회
const positions = getPlayerPositions();
const rotations = getPlayerRotations();
```

### ✅ 새로운 방식 (통합)

```tsx
// 위치와 회전을 함께 전송
broadcastPlayerTransform({
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: 1.5, z: 0 }
});

// Transform 조회
const transforms = getPlayerTransforms();
// transforms[0].data = { position: {...}, rotation: {...} }
```

## 장점

1. **네트워크 효율성**: 두 번 전송하는 대신 한 번에 전송
2. **데이터 일관성**: position과 rotation이 항상 동일한 시간에 수집된 데이터
3. **서버 큐 최적화**: 서버의 12ms 배치 처리와 완벽히 맞아떨어짐

## 변경된 API

### Broadcast 메소드

| 이전 | 새로운 |
|------|--------|
| `broadcastPlayerPosition(position)` | ❌ 제거됨 |
| `broadcastPlayerRotation(rotation)` | ❌ 제거됨 |
| - | ✅ `broadcastPlayerTransform({ position, rotation })` |

### Get 메소드

| 이전 | 새로운 |
|------|--------|
| `getPlayerPositions()` | ❌ 제거됨 |
| `getPlayerRotations()` | ❌ 제거됨 |
| - | ✅ `getPlayerTransforms()` |

### 서버 데이터 타입

```typescript
// 이전
type: 'playerPosition'
data: { x: 1, y: 2, z: 3 }

type: 'playerRotation'  
data: { x: 0, y: 1.5, z: 0 }

// 새로운
type: 'playerTransform'
data: {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: 1.5, z: 0 }
}
```

## 마이그레이션 가이드

### Three.js에서 사용하는 경우

```tsx
// ❌ 이전 코드
const broadcastPlayerPosition = useSocketStore((state) => state.broadcastPlayerPosition);
const broadcastPlayerRotation = useSocketStore((state) => state.broadcastPlayerRotation);

useFrame(() => {
  if (playerRef.current) {
    broadcastPlayerPosition?.(playerRef.current.position);
    broadcastPlayerRotation?.(playerRef.current.rotation);
  }
});

// ✅ 새로운 코드
const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);

useFrame(() => {
  if (playerRef.current) {
    broadcastPlayerTransform?.({
      position: {
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
        z: playerRef.current.position.z
      },
      rotation: {
        x: playerRef.current.rotation.x,
        y: playerRef.current.rotation.y,
        z: playerRef.current.rotation.z
      }
    });
  }
});
```

### 데이터 조회

```tsx
// ❌ 이전 코드
const getPlayerPositions = useSocketStore((state) => state.getPlayerPositions);
const getPlayerRotations = useSocketStore((state) => state.getPlayerRotations);

const positions = getPlayerPositions?.() || [];
const rotations = getPlayerRotations?.() || [];

// clientId로 매칭 필요...

// ✅ 새로운 코드
const getPlayerTransforms = useSocketStore((state) => state.getPlayerTransforms);

const transforms = getPlayerTransforms?.() || [];
// 이미 position과 rotation이 함께 있음!

transforms.forEach(t => {
  console.log('Client:', t.clientId);
  console.log('Position:', t.data.position);
  console.log('Rotation:', t.data.rotation);
});
```

## 서버와의 통신 흐름

```
클라이언트                     서버 (12ms 큐)
─────────                     ──────────────

broadcastPlayerTransform({    → broadCastRoomData 수신
  position: {x:1, y:2, z:3},    → 큐에 저장
  rotation: {x:0, y:1.5, z:0}
})                              

                                (12ms 경과)
                                
                              → roomData 이벤트 발생
← 수신                          {
  roomId: "room-1",               roomId: "room-1",
  timestamp: 12,                  timestamp: 12,
  data: [                         data: [...큐의 모든 데이터]
    {                           }
      type: 'playerTransform',
      clientId: 'abc123',
      timestamp: 0,
      data: {
        position: {x:1, y:2, z:3},
        rotation: {x:0, y:1.5, z:0}
      }
    },
    ...
  ]
}

→ roomDataHistory에 저장
→ getPlayerTransforms()로 조회 가능
```

## 업데이트된 파일

- ✅ `src/store/socket.tsx/store.tsx`
- ✅ `src/feature/TRHEE/virtual/components/hooks/useVirtualWorldSocket.tsx`
- ✅ `src/store/socket.tsx/README.md`
- ✅ `src/store/socket.tsx/example-usage.tsx`

## 참고

자세한 사용법은 다음 파일들을 참고하세요:
- `src/store/socket.tsx/README.md` - 전체 문서
- `src/store/socket.tsx/example-usage.tsx` - 실전 예제


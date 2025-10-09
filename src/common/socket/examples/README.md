# Socket 예제

이 폴더에는 Socket.IO 사용 예제가 포함되어 있습니다.

## SocketExample.tsx

기본적인 Socket.IO 사용법을 보여주는 예제 컴포넌트입니다.

### 기능

- Room 참가/퇴장
- 메시지 브로드캐스트
- 사용자 목록 표시
- 데이터 히스토리 표시

### 사용 방법

1. 페이지에 컴포넌트 추가:

```tsx
import SocketExample from '@/common/socket/examples/SocketExample';

export default function TestPage() {
  return <SocketExample />;
}
```

2. Socket 서버가 실행 중인지 확인
3. Room ID 입력
4. "Join Room" 버튼 클릭
5. 메시지를 입력하고 "Broadcast" 버튼 클릭

### 참고

이 예제는 학습 목적으로만 사용하세요. 실제 프로덕션 환경에서는 VirtualWorldScreen에서 `useVirtualWorldSocket`을 사용하는 것이 좋습니다.


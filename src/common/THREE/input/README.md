# Virtual Touch Controls

모바일 및 터치 디바이스를 위한 가상 조이스틱과 버튼 컨트롤 시스템입니다.

## 개요

PC에서는 키보드로 플레이어를 조작하지만, 모바일에서는 화면 터치로 조작해야 합니다.
이 시스템은 키보드 입력과 터치 입력을 자동으로 병합하여 처리합니다.

## 구성 요소

### 1. VirtualJoystick
- 왼쪽 하단에 표시되는 가상 조이스틱
- 8방향 이동 지원
- 아날로그 입력 (부드러운 이동 속도 조절)
- 터치 및 마우스 모두 지원

### 2. VirtualButton
- 오른쪽 하단에 표시되는 점프 버튼
- Press/Release 이벤트 지원
- 시각적 피드백 제공

### 3. VirtualTouchControl
- 조이스틱과 버튼을 통합한 컴포넌트
- 간편한 설정

### 4. virtualControlsStore
- 조이스틱과 버튼 상태를 전역으로 관리
- Zustand 기반

## 사용 방법

### 기본 사용법

```tsx
import VirtualTouchControl from '@/common/THREE/input/VirtualTouchControl';

export default function GameScreen() {
  return (
    <div>
      {/* 게임 화면 */}
      <Canvas>
        {/* 3D 콘텐츠 */}
      </Canvas>
      
      {/* 터치 컨트롤 추가 */}
      <VirtualTouchControl />
    </div>
  );
}
```

### 개별 컴포넌트 사용

```tsx
import VirtualJoystick, { JoystickState } from '@/common/THREE/input/VirtualJoystick';
import VirtualButton from '@/common/THREE/input/VirtualButton';
import { useVirtualControlsStore } from '@/store/THREE/virtualControlsStore';

export default function CustomControls() {
  const setJoystick = useVirtualControlsStore((state) => state.setJoystick);
  const setJump = useVirtualControlsStore((state) => state.setJump);

  return (
    <>
      <VirtualJoystick 
        onJoystickChange={(state) => setJoystick(state)}
        size={120}
      />
      <VirtualButton
        label="점프"
        onPress={() => setJump(true)}
        onRelease={() => setJump(false)}
        position="right"
        bottom="40px"
        right="40px"
        size={80}
      />
    </>
  );
}
```

## Store 사용법

### 조이스틱 상태 읽기

```tsx
import { useVirtualControlsStore } from '@/store/THREE/virtualControlsStore';

function PlayerController() {
  // React 컴포넌트에서
  const joystick = useVirtualControlsStore((state) => state.joystick);
  
  console.log(joystick.forward);   // boolean
  console.log(joystick.x);         // -1 ~ 1
  console.log(joystick.y);         // -1 ~ 1

  // 클래스나 일반 함수에서
  const virtualControls = useVirtualControlsStore.getState();
  console.log(virtualControls.joystick.forward);
  console.log(virtualControls.jump);
}
```

### KeyboardLocalController와 통합

`KeyboardLocalController`는 자동으로 조이스틱 입력을 병합합니다:

```typescript
// src/common/THREE/Character/controllers/KeyboardLocalController.ts

getMovementInput(curPosition: Vector3, curRotation: Euler): MovementInput {
  // 키보드 입력
  const { forward: forwardKey, ... } = this.options.getKeyboarState();
  
  // 조이스틱 입력
  const virtualControls = useVirtualControlsStore.getState();
  const joystick = virtualControls.joystick;
  
  // ✅ 자동 병합 - 키보드 + 조이스틱
  const forward = (forwardKey ? 1 : 0) + (joystick.y > 0 ? joystick.y : 0);
  const jump = jumpKey || virtualControls.jump;
  
  // ...
}
```

## API

### VirtualJoystick Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `onJoystickChange` | `(state: JoystickState) => void` | - | 조이스틱 상태 변경 콜백 |
| `size` | `number` | `120` | 조이스틱 크기 (px) |

### JoystickState

```typescript
interface JoystickState {
  forward: boolean;   // 전진 (임계값 초과)
  backward: boolean;  // 후진 (임계값 초과)
  left: boolean;      // 좌측 (임계값 초과)
  right: boolean;     // 우측 (임계값 초과)
  x: number;          // -1 ~ 1 (좌우 아날로그 값)
  y: number;          // -1 ~ 1 (전후 아날로그 값)
}
```

### VirtualButton Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `label` | `string` | - | 버튼 라벨 |
| `onPress` | `() => void` | - | 버튼 눌렀을 때 |
| `onRelease` | `() => void` | - | 버튼 뗐을 때 |
| `position` | `'left' \| 'right'` | `'right'` | 화면 위치 |
| `bottom` | `string` | `'40px'` | 하단 여백 |
| `right` | `string` | `'40px'` | 좌우 여백 |
| `size` | `number` | `80` | 버튼 크기 (px) |

### virtualControlsStore API

```typescript
interface VirtualControlsState {
  // 상태
  joystick: JoystickState;
  jump: boolean;
  
  // Actions
  setJoystick: (state: Partial<JoystickState>) => void;
  setJump: (pressed: boolean) => void;
  reset: () => void;
}
```

## 스타일링

### 조이스틱 커스터마이징

조이스틱 스타일을 변경하려면 `VirtualJoystick.tsx`의 style 객체를 수정하세요:

```typescript
<div
  style={{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 배경색
    border: '3px solid white',               // 테두리
    // ...
  }}
>
```

### 버튼 커스터마이징

```typescript
<VirtualButton
  label="🚀"  // 이모지 사용 가능
  size={100}
  // CSS 스타일은 VirtualButton.tsx에서 수정
/>
```

## 고급 사용법

### 여러 버튼 추가

```tsx
<VirtualButton
  label="공격"
  onPress={() => attack()}
  onRelease={() => {}}
  position="right"
  bottom="140px"  // 점프 버튼 위에 배치
  right="40px"
/>
<VirtualButton
  label="점프"
  onPress={() => jump()}
  onRelease={() => {}}
  position="right"
  bottom="40px"
  right="40px"
/>
```

### 조건부 표시 (PC에서 숨기기)

```tsx
export default function GameScreen() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  return (
    <div>
      <Canvas>...</Canvas>
      
      {/* 모바일에서만 표시 */}
      {isMobile && <VirtualTouchControl />}
    </div>
  );
}
```

### 커스텀 입력 처리

```tsx
import { useVirtualControlsStore } from '@/store/THREE/virtualControlsStore';

function CustomController() {
  const joystick = useVirtualControlsStore((state) => state.joystick);
  const jump = useVirtualControlsStore((state) => state.jump);
  
  useFrame(() => {
    // 아날로그 값 사용 (부드러운 이동)
    const speed = Math.sqrt(joystick.x ** 2 + joystick.y ** 2);
    const angle = Math.atan2(joystick.x, joystick.y);
    
    player.position.x += Math.sin(angle) * speed * delta;
    player.position.z += Math.cos(angle) * speed * delta;
    
    if (jump) {
      player.position.y += 5 * delta;
    }
  });
}
```

## 통합 구조

```
VirtualTouchControl
├─ VirtualJoystick
│  └─ onJoystickChange → virtualControlsStore.setJoystick
├─ VirtualButton (점프)
│  └─ onPress/onRelease → virtualControlsStore.setJump
└─ VirtualButton (기타...)

KeyboardLocalController
├─ getKeyboarState() (키보드)
├─ useVirtualControlsStore.getState() (조이스틱)
└─ 두 입력을 병합하여 MovementInput 생성

PlayerController
└─ getMovementInput() 호출 → 통합된 입력 받음
```

## 주의사항

1. **터치 이벤트 충돌**: `touchAction: 'none'`으로 브라우저 기본 동작 방지
2. **z-index**: 조이스틱이 다른 UI 위에 표시되도록 높은 값 사용
3. **성능**: 60fps에서도 부드럽게 작동하도록 최적화됨
4. **접근성**: 키보드와 조이스틱 동시 사용 가능

## 예제

전체 예제는 `src/feature/TRHEE/virtual/components/VirtualWorld.tsx`를 참고하세요.

```tsx
import VirtualTouchControl from '@/common/THREE/input/VirtualTouchControl';

export default function VirtualWorld({ worldCode }: { worldCode: string }) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas>
        <Physics>
          {/* 플레이어와 월드 */}
        </Physics>
      </Canvas>
      
      {/* 터치 컨트롤 */}
      <VirtualTouchControl />
    </div>
  );
}
```

## 문제 해결

### 조이스틱이 작동하지 않을 때

1. `virtualControlsStore`가 제대로 import되었는지 확인
2. `KeyboardLocalController`에서 store를 읽고 있는지 확인
3. 브라우저 콘솔에서 `useVirtualControlsStore.getState()`로 상태 확인

### 입력이 느릴 때

- `threshold` 값을 조절하세요 (VirtualJoystick.tsx)
- 기본값: 0.2 (20%)
- 더 민감하게: 0.1
- 덜 민감하게: 0.3

### PC에서 조이스틱 숨기기

```tsx
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
{isMobile && <VirtualTouchControl />}
```


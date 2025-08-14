# EventDisplayComponent

이벤트 표시를 위한 React 컴포넌트입니다.

## 기능

- **소개 텍스트**: 메시피 X 카페 이벤트 안내
- **오늘의 이벤트**: startDay가 오늘인 이벤트들을 슬라이더로 표시
- **이벤트 탭**: 현재 진행 중인 이벤트와 종료된 이벤트를 탭으로 구분
- **무한 슬라이더**: 이벤트 카드들이 자동으로 왼쪽으로 스크롤되며 반복 표시

## 사용법

```tsx
import EventDisplayComponent from '@/common/cafeinfo/EventDisplayComponent';

function MyPage() {
  return (
    <div>
      <EventDisplayComponent />
    </div>
  );
}
```

## API 연동

- `boardsApi.findAllBoards`를 사용하여 `boardType: 'BEVENT'`인 게시글을 가져옵니다
- 오늘의 이벤트: `startDay`가 오늘인 이벤트 5개
- 현재 진행 중인 이벤트: `startDay`가 오늘인 이벤트 5개  
- 종료된 이벤트: `endDay`가 오늘인 이벤트 5개

## 스타일링

- `@emotion/styled`를 사용하여 스타일링
- 반응형 디자인 지원
- 호버 효과 및 애니메이션 포함
- Pretendard 폰트 사용

## Props

```tsx
interface EventDisplayComponentProps {
  className?: string; // 추가 CSS 클래스
}
```

## 의존성

- React 18+
- @emotion/styled
- @reduxjs/toolkit/query/react
- boardsApi (boardsApi.tsx)

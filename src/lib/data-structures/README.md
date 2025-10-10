# 데이터 구조 라이브러리

실시간 데이터 관리에 최적화된 자료구조들입니다.

## 📦 포함된 자료구조

### 1. LinkedList (양방향 링크드 리스트)

**특징:**
- 양방향 연결 (이전/다음 노드 접근 가능)
- 최대 크기 제한 지원
- 앞/뒤 삽입/삭제 O(1)

**사용 예시:**
```typescript
import { LinkedList } from '@/lib/data-structures';

// 최대 100개까지만 유지하는 리스트
const list = new LinkedList<string>(100);

// 데이터 추가
list.push('item1');
list.push('item2');
list.unshift('item0');  // 맨 앞에 추가

// 데이터 조회
console.log(list.first());  // 'item0'
console.log(list.last());   // 'item2'
console.log(list.size);     // 3

// 최근 10개 조회
const recent = list.lastN(10);

// 배열 변환
const array = list.toArray();

// 필터링
const filtered = list.filter(item => item.startsWith('item'));

// 순회
list.forEach((item, index) => {
  console.log(index, item);
});

// for...of 사용 가능
for (const item of list) {
  console.log(item);
}

// 데이터 제거
list.pop();    // 마지막 제거
list.shift();  // 첫 번째 제거

// 초기화
list.clear();
```

### 2. CircularBuffer (순환 버퍼)

**특징:**
- 고정 크기 버퍼
- 가득 차면 오래된 데이터를 자동으로 덮어씀
- 모든 연산이 O(1)
- 메모리 효율적

**사용 예시:**
```typescript
import { CircularBuffer } from '@/lib/data-structures';

// 최대 100개 저장
const buffer = new CircularBuffer<number>(100);

// 데이터 추가 (101번째부터는 1번째 데이터를 덮어씀)
for (let i = 0; i < 150; i++) {
  buffer.push(i);
}

console.log(buffer.size);      // 100
console.log(buffer.first());   // 50 (0-49는 덮어써짐)
console.log(buffer.last());    // 149

// 특정 인덱스 조회
console.log(buffer.get(0));    // 50 (가장 오래된 데이터)
console.log(buffer.get(99));   // 149 (가장 최신 데이터)

// 최근 10개 조회
const recent = buffer.lastN(10);  // [140, 141, ..., 149]

// 배열 변환
const array = buffer.toArray();   // [50, 51, ..., 149]

// 필터링
const filtered = buffer.filter(n => n > 100);

// 순회
buffer.forEach((item, index) => {
  console.log(index, item);
});

// for...of 사용 가능
for (const item of buffer) {
  console.log(item);
}

// 초기화
buffer.clear();
```

## 🎯 언제 무엇을 사용할까?

### LinkedList를 사용하세요:
- ✅ 앞/뒤에서 삽입/삭제가 빈번할 때
- ✅ 데이터의 순서가 중요할 때
- ✅ 최대 크기만 제한하고 싶을 때
- ✅ 양방향 순회가 필요할 때

**예시:**
```typescript
// 채팅 메시지 (최근 100개만 유지)
const messages = new LinkedList<Message>(100);
messages.push(newMessage);

// 실행 취소 기록 (최근 50개만)
const history = new LinkedList<State>(50);
```

### CircularBuffer를 사용하세요:
- ✅ 고정 크기가 필요할 때
- ✅ 최신 N개만 유지하면 될 때
- ✅ 메모리를 최소화하고 싶을 때
- ✅ 성능이 매우 중요할 때 (모든 연산 O(1))

**예시:**
```typescript
// 플레이어 위치 히스토리 (최근 100개)
const positions = new CircularBuffer<Position>(100);
positions.push(currentPosition);

// FPS 측정 (최근 60프레임)
const fpsSamples = new CircularBuffer<number>(60);
```

## 🚀 실전 예시: Socket 데이터 관리

### 기존 (배열 사용)
```typescript
// ❌ 성능 문제
let roomDataHistoryRef: RoomDataItem[] = [];

newSocket.on('roomBroadcast', (payload) => {
  roomDataHistoryRef = [...roomDataHistoryRef, ...payload.data];  // O(n) 복사
  
  if (roomDataHistoryRef.length > 100) {
    roomDataHistoryRef = roomDataHistoryRef.slice(-100);  // O(n) 복사
  }
});

const transforms = roomDataHistoryRef.filter(item => item.type === 'playerTransform');  // O(n)
```

### 개선 (CircularBuffer 사용)
```typescript
// ✅ 성능 최적화
const roomDataBuffer = new CircularBuffer<RoomDataItem>(100);

newSocket.on('roomBroadcast', (payload) => {
  payload.data.forEach(item => {
    roomDataBuffer.push(item);  // O(1)
  });
});

const transforms = roomDataBuffer.filter(item => item.type === 'playerTransform');  // O(n)하지만 최대 100개만
```

### 개선 (LinkedList 사용)
```typescript
// ✅ 유연한 크기 관리
const roomDataList = new LinkedList<RoomDataItem>(100);

newSocket.on('roomBroadcast', (payload) => {
  payload.data.forEach(item => {
    roomDataList.push(item);  // O(1), 101번째부터 자동 제거
  });
});

const recent10 = roomDataList.lastN(10);  // 최근 10개만
const transforms = roomDataList.filter(item => item.type === 'playerTransform');
```

## 📊 성능 비교

| 연산 | 배열 | LinkedList | CircularBuffer |
|------|------|------------|----------------|
| 끝에 추가 | O(1)* | **O(1)** | **O(1)** |
| 앞에 추가 | O(n) | **O(1)** | N/A |
| 끝에서 제거 | O(1) | **O(1)** | **O(1)** |
| 앞에서 제거 | O(n) | **O(1)** | **O(1)** |
| 인덱스 접근 | **O(1)** | O(n) | **O(1)** |
| 크기 제한 시 | O(n) 복사 | **O(1)** | **O(1)** |
| 메모리 | 많음 | 중간 | **적음** |

*배열의 push는 O(1)이지만, slice/spread는 O(n)

## 💡 팁

### 1. 타입 안전성
```typescript
interface PlayerData {
  id: string;
  position: { x: number; y: number; z: number };
}

const buffer = new CircularBuffer<PlayerData>(100);
const list = new LinkedList<PlayerData>(100);
```

### 2. 메모리 관리
```typescript
// 사용 후 메모리 해제
buffer.clear();
list.clear();
```

### 3. 성능 측정
```typescript
console.time('Buffer');
for (let i = 0; i < 10000; i++) {
  buffer.push(i);
}
console.timeEnd('Buffer');  // 매우 빠름

console.time('Array');
let arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push(i);
  if (arr.length > 100) {
    arr = arr.slice(-100);  // 느림
  }
}
console.timeEnd('Array');
```

## 🔧 고급 사용법

### 커스텀 정렬
```typescript
const list = new LinkedList<number>();
list.push(3);
list.push(1);
list.push(2);

const sorted = list.toArray().sort((a, b) => a - b);
const newList = LinkedList.fromArray(sorted);
```

### 병합
```typescript
const list1 = new LinkedList<number>();
const list2 = new LinkedList<number>();

list1.toArray().forEach(item => list2.push(item));
```

### 조건부 제거
```typescript
const filtered = list.filter(item => item !== 'remove');
const newList = LinkedList.fromArray(filtered);
```

## 📝 참고

- LinkedList는 노드 기반이므로 작은 데이터에는 오버헤드가 있을 수 있습니다
- CircularBuffer는 크기가 고정되므로 용량 계획이 필요합니다
- 실시간 데이터는 CircularBuffer, 히스토리 관리는 LinkedList 추천


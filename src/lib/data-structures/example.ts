/**
 * 데이터 구조 사용 예시
 */

import { LinkedList, CircularBuffer } from './index';

// ============================================================
// 예제 1: Socket 실시간 데이터 관리
// ============================================================

interface RoomDataItem {
  type: string;
  clientId: string;
  timestamp: number;
  data: unknown;
}

// CircularBuffer 사용 (추천!)
export function createSocketDataBuffer() {
  const buffer = new CircularBuffer<RoomDataItem>(100);

  // Socket 데이터 수신
  function onRoomData(items: RoomDataItem[]) {
    items.forEach(item => buffer.push(item));  // O(1) - 매우 빠름!
  }

  // 특정 타입 데이터 조회
  function getDataByType(type: string): RoomDataItem[] {
    return buffer.filter(item => item.type === type);
  }

  // 최근 N개 조회
  function getRecentData(count: number): RoomDataItem[] {
    return buffer.lastN(count);
  }

  return {
    onRoomData,
    getDataByType,
    getRecentData,
    buffer,
  };
}

// ============================================================
// 예제 2: 채팅 메시지 관리
// ============================================================

interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export function createChatHistory() {
  const messages = new LinkedList<ChatMessage>(50);  // 최근 50개만

  function addMessage(message: ChatMessage) {
    messages.push(message);  // 51번째부터는 자동으로 오래된 것 제거
  }

  function getMessages(): ChatMessage[] {
    return messages.toArray();
  }

  function getMessagesByUser(userId: string): ChatMessage[] {
    return messages.filter(msg => msg.userId === userId);
  }

  return {
    addMessage,
    getMessages,
    getMessagesByUser,
  };
}

// ============================================================
// 예제 3: FPS 측정
// ============================================================

export function createFPSTracker() {
  const frameTimes = new CircularBuffer<number>(60);  // 최근 60프레임
  let lastTime = performance.now();

  function recordFrame() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    frameTimes.push(deltaTime);
    lastTime = now;
  }

  function getAverageFPS(): number {
    if (frameTimes.isEmpty()) return 0;

    const times = frameTimes.toArray();
    const avgDeltaTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    return 1000 / avgDeltaTime;
  }

  function getCurrentFPS(): number {
    const lastDelta = frameTimes.last();
    return lastDelta ? 1000 / lastDelta : 0;
  }

  return {
    recordFrame,
    getAverageFPS,
    getCurrentFPS,
  };
}

// ============================================================
// 예제 4: 플레이어 위치 히스토리
// ============================================================

interface Position {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export function createPositionHistory() {
  const positions = new CircularBuffer<Position>(100);

  function recordPosition(pos: Position) {
    positions.push(pos);
  }

  function getTrajectory(): Position[] {
    return positions.toArray();
  }

  function getRecentPositions(count: number): Position[] {
    return positions.lastN(count);
  }

  // 속도 계산
  function getCurrentVelocity(): { x: number; y: number; z: number } | null {
    if (positions.size < 2) return null;

    const current = positions.last()!;
    const previous = positions.get(positions.size - 2)!;

    const dt = (current.timestamp - previous.timestamp) / 1000; // 초 단위

    return {
      x: (current.x - previous.x) / dt,
      y: (current.y - previous.y) / dt,
      z: (current.z - previous.z) / dt,
    };
  }

  return {
    recordPosition,
    getTrajectory,
    getRecentPositions,
    getCurrentVelocity,
  };
}

// ============================================================
// 예제 5: 실행 취소/재실행 (Undo/Redo)
// ============================================================

interface State<T> {
  data: T;
  timestamp: number;
}

export function createUndoManager<T>(maxHistory: number = 50) {
  const history = new LinkedList<State<T>>(maxHistory);
  let currentIndex = -1;

  function saveState(data: T) {
    // 현재 위치 이후의 히스토리 제거
    while (currentIndex < history.size - 1) {
      history.pop();
    }

    history.push({
      data,
      timestamp: Date.now(),
    });

    currentIndex = history.size - 1;
  }

  function undo(): T | null {
    if (currentIndex <= 0) return null;

    currentIndex--;
    return history.get(currentIndex)?.data ?? null;
  }

  function redo(): T | null {
    if (currentIndex >= history.size - 1) return null;

    currentIndex++;
    return history.get(currentIndex)?.data ?? null;
  }

  function canUndo(): boolean {
    return currentIndex > 0;
  }

  function canRedo(): boolean {
    return currentIndex < history.size - 1;
  }

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

// ============================================================
// 성능 벤치마크
// ============================================================

export function benchmarkDataStructures() {
  const iterations = 10000;

  console.log('=== Performance Benchmark ===\n');

  // 배열
  console.time('Array (with slice)');
  let arr: number[] = [];
  for (let i = 0; i < iterations; i++) {
    arr.push(i);
    if (arr.length > 100) {
      arr = arr.slice(-100);  // O(n) - 느림!
    }
  }
  console.timeEnd('Array (with slice)');

  // CircularBuffer
  console.time('CircularBuffer');
  const buffer = new CircularBuffer<number>(100);
  for (let i = 0; i < iterations; i++) {
    buffer.push(i);  // O(1) - 빠름!
  }
  console.timeEnd('CircularBuffer');

  // LinkedList
  console.time('LinkedList');
  const list = new LinkedList<number>(100);
  for (let i = 0; i < iterations; i++) {
    list.push(i);  // O(1) - 빠름!
  }
  console.timeEnd('LinkedList');

  console.log('\n=== Results ===');
  console.log('Array:', arr.length, 'items');
  console.log('CircularBuffer:', buffer.size, 'items');
  console.log('LinkedList:', list.size, 'items');
}


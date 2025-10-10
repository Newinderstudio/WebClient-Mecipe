/**
 * 순환 버퍼 (Circular Buffer / Ring Buffer)
 * 고정 크기, 최신 데이터만 유지 (실시간 데이터에 최적화)
 */
export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private writeIndex: number;
  private readIndex: number;
  private _size: number;
  private capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.writeIndex = 0;
    this.readIndex = 0;
    this._size = 0;
  }

  /**
   * 현재 저장된 요소 개수
   */
  get size(): number {
    return this._size;
  }

  /**
   * 버퍼가 가득 찼는지 확인
   */
  isFull(): boolean {
    return this._size === this.capacity;
  }

  /**
   * 버퍼가 비어있는지 확인
   */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * 요소 추가 (O(1))
   * 버퍼가 가득 차면 가장 오래된 데이터를 덮어씀
   */
  push(data: T): void {
    this.buffer[this.writeIndex] = data;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;

    if (this._size < this.capacity) {
      this._size++;
    } else {
      // 버퍼가 가득 찼으면 readIndex도 이동
      this.readIndex = (this.readIndex + 1) % this.capacity;
    }
  }

  /**
   * 가장 오래된 요소 제거 및 반환 (O(1))
   */
  shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const data = this.buffer[this.readIndex];
    this.buffer[this.readIndex] = undefined;
    this.readIndex = (this.readIndex + 1) % this.capacity;
    this._size--;

    return data;
  }

  /**
   * 특정 인덱스의 요소 조회 (O(1))
   * 0이 가장 오래된 요소, size-1이 가장 최신 요소
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }

    const actualIndex = (this.readIndex + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  /**
   * 첫 번째 (가장 오래된) 요소 조회 (O(1))
   */
  first(): T | undefined {
    return this.isEmpty() ? undefined : this.buffer[this.readIndex];
  }

  /**
   * 마지막 (가장 최신) 요소 조회 (O(1))
   */
  last(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const lastIndex = (this.writeIndex - 1 + this.capacity) % this.capacity;
    return this.buffer[lastIndex];
  }

  /**
   * 배열로 변환 (O(n))
   * 가장 오래된 것부터 최신 순으로 반환
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const index = (this.readIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * 마지막 n개 요소를 배열로 반환 (O(n))
   */
  lastN(n: number): T[] {
    if (n <= 0) return [];
    if (n >= this._size) return this.toArray();

    const result: T[] = [];
    const startOffset = this._size - n;

    for (let i = startOffset; i < this._size; i++) {
      const index = (this.readIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * 조건에 맞는 요소 필터링 (O(n))
   */
  filter(predicate: (data: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const index = (this.readIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined && predicate(item)) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * 각 요소에 대해 콜백 실행 (O(n))
   */
  forEach(callback: (data: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const index = (this.readIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        callback(item, i);
      }
    }
  }

  /**
   * 버퍼 초기화
   */
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.writeIndex = 0;
    this.readIndex = 0;
    this._size = 0;
  }

  /**
   * Iterator 구현 (for...of 사용 가능)
   */
  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const index = (this.readIndex + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        yield item;
      }
    }
  }
}


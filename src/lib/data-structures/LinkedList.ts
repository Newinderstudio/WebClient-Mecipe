/**
 * 링크드 리스트 노드
 */
class Node<T> {
    data: T;
    next: Node<T> | null;
    prev: Node<T> | null;

    constructor(data: T) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }

    remove(): void {
        if(this.prev) this.prev.next = this.next;
        if(this.next) this.next.prev = this.prev;
    }
}

/**
 * 양방향 링크드 리스트
 * 실시간 데이터 관리에 최적화된 자료구조
 */
export class LinkedList<T> {
    private head: Node<T> | null;
    private tail: Node<T> | null;
    private _size: number;
    private maxSize: number | null;

    constructor(maxSize: number | null = null) {
        this.head = null;
        this.tail = null;
        this._size = 0;
        this.maxSize = maxSize;
    }

    /**
     * 리스트의 크기
     */
    get size(): number {
        return this._size;
    }

    /**
     * 리스트가 비어있는지 확인
     */
    isEmpty(): boolean {
        return this._size === 0;
    }

    /**
     * 리스트의 끝에 요소 추가 (O(1))
     */
    push(...datas: T[]): void {
        datas.forEach(data => {
            const newNode = new Node(data);

            if (this.isEmpty()) {
                this.head = newNode;
                this.tail = newNode;
            } else {
                newNode.prev = this.tail;
                this.tail!.next = newNode;
                this.tail = newNode;
            }

            this._size++;

            // 최대 크기 초과 시 가장 오래된 요소 제거
            if (this.maxSize !== null && this._size > this.maxSize) {
                this.shift();
            }
        });

    }

    /**
     * 리스트의 시작에 요소 추가 (O(1))
     */
    unshift(data: T): void {
        const newNode = new Node(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head!.prev = newNode;
            this.head = newNode;
        }

        this._size++;

        // 최대 크기 초과 시 가장 최근 요소 제거
        if (this.maxSize !== null && this._size > this.maxSize) {
            this.pop();
        }
    }

    /**
     * 리스트의 끝에서 요소 제거 (O(1))
     */
    pop(): T | null {
        if (this.isEmpty()) {
            return null;
        }

        const data = this.tail!.data;

        if (this._size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail!.prev;
            this.tail!.next = null;
        }

        this._size--;
        return data;
    }

    /**
     * 리스트의 시작에서 요소 제거 (O(1))
     */
    shift(): T | null {
        if (this.isEmpty()) {
            return null;
        }

        const data = this.head!.data;

        if (this._size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head!.next;
            this.head!.prev = null;
        }

        this._size--;
        return data;
    }

    /**
     * 특정 인덱스의 요소 조회 (O(n))
     */
    get(index: number): T | null {
        if (index < 0 || index >= this._size) {
            return null;
        }

        let current: Node<T> | null;

        // 최적화: 인덱스가 중간보다 앞이면 head부터, 뒤면 tail부터 순회
        if (index < this._size / 2) {
            current = this.head;
            for (let i = 0; i < index; i++) {
                current = current!.next;
            }
        } else {
            current = this.tail;
            for (let i = this._size - 1; i > index; i--) {
                current = current!.prev;
            }
        }

        return current!.data;
    }

    /**
     * 첫 번째 요소 조회 (O(1))
     */
    first(): T | null {
        return this.head?.data ?? null;
    }

    /**
     * 마지막 요소 조회 (O(1))
     */
    last(): T | null {
        return this.tail?.data ?? null;
    }

    /**
     * 배열로 변환 (O(n))
     */
    toArray(): T[] {
        const result: T[] = [];
        let current = this.head;

        while (current) {
            result.push(current.data);
            current = current.next;
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
        let current = this.tail;
        let count = 0;

        while (current && count < n) {
            result.unshift(current.data);
            current = current.prev;
            count++;
        }

        return result;
    }

    /**
     * 조건에 맞는 요소 필터링 (O(n))
     */
    filter(predicate: (data: T) => boolean): T[] {
        const result: T[] = [];
        let current = this.head;

        while (current) {
            if (predicate(current.data)) {
                result.push(current.data);
            }
            current = current.next;
        }

        return result;
    }

    /**
     * 각 요소에 대해 콜백 실행 (O(n))
     */
    forEach(callback: (data: T, index: number) => void): void {
        let current = this.head;
        let index = 0;

        while (current) {
            callback(current.data, index);
            current = current.next;
            index++;
        }
    }

        /**
     * 각 요소에 대해 콜백 실행 (O(n)) 단, 노드를 받음 (읽고 삭제 가능능)
     */
    forEachWithNode(callback: (data: T, index: number, ndoe?: Node<T>) => void): void {
        let current = this.head;
        let index = 0;

        while (current) {
            callback(current.data, index, current);
            current = current.next;
            index++;
        }
    }

    /**
     * 리스트 초기화
     */
    clear(): void {
        this.head = null;
        this.tail = null;
        this._size = 0;
    }

    /**
     * 리스트를 역순으로 순회
     */
    forEachReverse(callback: (data: T, index: number) => void): void {
        let current = this.tail;
        let index = this._size - 1;

        while (current) {
            callback(current.data, index);
            current = current.prev;
            index--;
        }
    }

    /**
     * 배열에서 링크드 리스트 생성
     */
    static fromArray<T>(array: T[], maxSize: number | null = null): LinkedList<T> {
        const list = new LinkedList<T>(maxSize);
        array.forEach(item => list.push(item));
        return list;
    }

    /**
     * Iterator 구현 (for...of 사용 가능)
     */
    *[Symbol.iterator](): Iterator<T> {
        let current = this.head;
        while (current) {
            yield current.data;
            current = current.next;
        }
    }
}


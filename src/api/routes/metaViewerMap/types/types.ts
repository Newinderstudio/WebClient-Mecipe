// 세션 저장소 (메모리 - 실제로는 Redis 등 사용 권장)
export interface UploadSession {
    sessionId: string;
    filename: string;
    totalSize: number;
    totalChunks: number;
    uploadedChunks: Set<number>;
    chunks: Map<number, Buffer>; // chunkIndex -> Buffer
    mapType: string;
    prefix: string;
    nickname: string;
    createdAt: number;
}
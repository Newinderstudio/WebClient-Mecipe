import { NextResponse } from 'next/server';
import fetchCompat from '@/util/fetchCompat';
import { randomUUID } from 'crypto';

// 세션 저장소 (메모리 - 실제로는 Redis 등 사용 권장)
interface UploadSession {
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

// 전역 세션 저장소 (모든 API Route에서 공유)
declare global {
  var uploadSessions: Map<string, UploadSession> | undefined;
  var sessionCleanupInterval: NodeJS.Timeout | undefined;
}

if (!global.uploadSessions) {
  global.uploadSessions = new Map();
}

// 오래된 세션 정리 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;
if (!global.sessionCleanupInterval) {
  global.sessionCleanupInterval = setInterval(() => {
    const now = Date.now();
    if (!global.uploadSessions) return;
    
    for (const [sessionId, session] of global.uploadSessions.entries()) {
      if (now - session.createdAt > SESSION_TIMEOUT) {
        console.log('세션 타임아웃:', sessionId);
        global.uploadSessions.delete(sessionId);
      }
    }
  }, 5 * 60 * 1000); // 5분마다 체크
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const auth = await fetchCompat<{authToken: boolean}>('GET', 'auth/me', token);

  if (!auth || auth.authToken !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, totalSize, totalChunks, mapType, prefix, nickname } = await request.json();

    if (!filename || !totalSize || !totalChunks || !mapType || !prefix || !nickname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionId = randomUUID();
    const session: UploadSession = {
      sessionId,
      filename,
      totalSize,
      totalChunks,
      uploadedChunks: new Set(),
      chunks: new Map(),
      mapType,
      prefix,
      nickname,
      createdAt: Date.now(),
    };

    if (!global.uploadSessions) {
      global.uploadSessions = new Map();
    }
    global.uploadSessions.set(sessionId, session);

    console.log(`업로드 세션 생성: ${sessionId} (${filename}, ${(totalSize / 1024 / 1024).toFixed(2)} MB, ${totalChunks} chunks)`);

    return NextResponse.json({
      sessionId,
      message: 'Upload session created',
    });

  } catch (error) {
    console.error('Init upload error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize upload' },
      { status: 500 }
    );
  }
}


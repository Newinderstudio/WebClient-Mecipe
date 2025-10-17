import { NextResponse } from 'next/server';
import fetchCompat from '@/util/fetchCompat';

// 세션 관리 (메모리 저장소 공유)
interface UploadSession {
  sessionId: string;
  filename: string;
  totalSize: number;
  totalChunks: number;
  uploadedChunks: Set<number>;
  chunks: Map<number, Buffer>;
  mapType: string;
  prefix: string;
  nickname: string;
  createdAt: number;
}

declare global {
  var uploadSessions: Map<string, UploadSession> | undefined;
}

if (!global.uploadSessions) {
  global.uploadSessions = new Map();
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const auth = await fetchCompat<{authToken: boolean}>('GET', 'auth/me', token);

  if (!auth || auth.authToken !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const chunkFile = formData.get('chunk') as File;

    if (!sessionId || chunkIndex === undefined || !chunkFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = global.uploadSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 청크를 Buffer로 변환하여 저장
    const arrayBuffer = await chunkFile.arrayBuffer();
    const chunkBuffer = Buffer.from(arrayBuffer);
    
    session.chunks.set(chunkIndex, chunkBuffer);
    session.uploadedChunks.add(chunkIndex);

    const progress = (session.uploadedChunks.size / session.totalChunks) * 100;

    console.log(`청크 업로드: ${sessionId} [${chunkIndex + 1}/${session.totalChunks}] ${progress.toFixed(1)}%`);

    return NextResponse.json({
      sessionId,
      chunkIndex,
      uploadedChunks: session.uploadedChunks.size,
      totalChunks: session.totalChunks,
      progress: Math.round(progress),
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    );
  }
}

// Next.js body parser 설정
export const config = {
  api: {
    bodyParser: false,
  },
};


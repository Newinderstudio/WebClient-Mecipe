import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { encryptGlbBuffer } from '@/util/encrypt-aes-gcm-paced';
import fetchCompat from '@/util/fetchCompat';
import crypto from 'crypto';

if (!global.uploadSessions) {
    global.uploadSessions = new Map();
}

export async function POST(request: Request): Promise<NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat<{ authToken: boolean }>('GET', 'auth/me', token);

    if (!auth || auth.authToken !== true) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const glbEncryptionKey = process.env.GLB_ENCRYPTION_KEY;
    if (!glbEncryptionKey) {
        console.error('GLB_ENCRYPTION_KEY is not set');
        return NextResponse.json({ error: 'Encryption key not configured' }, { status: 500 });
    }

    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const session = global.uploadSessions!.get(sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // 모든 청크가 업로드되었는지 확인
        if (session.uploadedChunks.size !== session.totalChunks) {
            return NextResponse.json({
                error: `Missing chunks: ${session.uploadedChunks.size}/${session.totalChunks}`,
            }, { status: 400 });
        }

        console.log(`세션 완료 처리 시작: ${sessionId} (${session.totalChunks} chunks)`);

        // 1. 청크 조립
        console.log('청크 조립 시작...');
        const sortedChunks: Buffer[] = [];
        for (let i = 0; i < session.totalChunks; i++) {
            const chunk = session.chunks.get(i);
            if (!chunk) {
                // 청크 누락 (이론적으로 불가능하지만 체크)
                global.uploadSessions!.delete(sessionId);
                return NextResponse.json({
                    error: `Chunk ${i} is missing`,
                }, { status: 400 });
            }
            sortedChunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(sortedChunks);
        console.log(`청크 조립 완료: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

        // 새로운 CONTENT_KEY (32 bytes) 생성
        const contentKey = crypto.randomBytes(32); // 이 키로 GLB를 암호화할 것임

        // 2. 파일 암호화
        console.log('파일 암호화 시작...');
        const encryptedBuffer = encryptGlbBuffer(fileBuffer, contentKey);
        console.log(`암호화 완료: ${(encryptedBuffer.length / 1024 / 1024).toFixed(2)} MB`);

        // 3. CONTENT_KEY 암호화
        console.log('CONTENT_KEY 암호화 시작...');
        const encryptedContentKey = encryptGlbBuffer(contentKey, glbEncryptionKey);
        console.log('CONTENT_KEY 암호화 완료', encryptedContentKey);

        // 4. Vercel Blob 업로드
        const originalExtension = session.filename.split('.').pop() || 'glb';
        const filename = `${session.prefix}/${session.mapType}/${session.nickname}-${Date.now()}.${originalExtension}.enc`;

        console.log('Vercel Blob 업로드 시작...');
        const blob = await put(filename, encryptedBuffer, {
            access: 'public',
            contentType: 'application/octet-stream',
        });
        console.log('업로드 완료:', blob.url);

        // 5. 세션 삭제 (메모리 정리)
        global.uploadSessions!.delete(sessionId);
        console.log(`세션 삭제: ${sessionId}`);

        return NextResponse.json({
            url: blob.url,
            size: encryptedBuffer.length,
            originalSize: fileBuffer.length,
            contentKey: encryptedContentKey.toString('base64'),
        });

    } catch (error) {
        console.error('Complete upload error:', error);
        return NextResponse.json(
            { error: 'Failed to complete upload: ' + (error as Error).message },
            { status: 500 }
        );
    }
}


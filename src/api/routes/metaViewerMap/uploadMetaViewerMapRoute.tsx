import fetchCompat from '@/util/fetchCompat';
import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { encryptGlbBuffer } from '@/util/encryptGlbFile';

export async function POST(request: Request): Promise<NextResponse> {
    console.log('uploadMetaViewerMapRoute', request);
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat('GET', 'auth/me', token);

    if (auth?.authToken !== true) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') ?? 'metaviewer';
    const mapType = searchParams.get('mapType') ?? 'map'; // render or collider
    const nickname = searchParams.get('nickname') ?? 'nickname'; // nickname

    const uploadedUrls: string[] = [];

    try {
        const formData = await request.formData();
        const mapFile = formData.get('mapFile') as File;

        if (!mapFile) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. 파일을 Buffer로 변환
        const arrayBuffer = await mapFile.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        
        // 2. 파일 암호화
        console.log('서버에서 파일 암호화 시작:', mapFile.name);
        const encryptedBuffer = encryptGlbBuffer(fileBuffer);
        console.log('서버에서 파일 암호화 완료');
        
        // 3. 암호화된 파일 업로드
        // 파일 확장자에 .enc 추가
        const originalExtension = mapFile.name.split('.').pop() || 'glb';
        const filename = `${prefix}/${mapType}/${nickname}-${Date.now()}.${originalExtension}.enc`;
        
        const blob = await put(filename, encryptedBuffer, {
            access: 'public',
            contentType: 'application/octet-stream', // 암호화된 파일
        });
        
        uploadedUrls.push(blob.url);

        return NextResponse.json({
            url: blob.url,
            size: encryptedBuffer.length, // 암호화된 파일 크기
        });

    } catch (error) {
        // 에러 발생 시 업로드된 모든 파일 삭제
        console.error('Upload error:', error);
        
        // 업로드된 URL들을 삭제하려고 시도
        const deletePromises = uploadedUrls.map((url: string) => del(url).catch((deleteError: unknown) => {
            console.error('Failed to delete file:', url, deleteError);
        }));
        
        await Promise.all(deletePromises);
        
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function deleteMap(url: string): Promise<void> {
   return await del(url);
}

// The next lines are required for Pages API Routes only
export const config = {
    api: {
        bodyParser: false,
    },
};
import fetchCompat from '@/util/fetchCompat';
import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat('GET', 'auth/me', token);

    if (auth?.authToken !== true) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') ?? 'metaviewer';
    const mapType = searchParams.get('mapType') ?? 'map'; // render or collider

    const uploadedUrls: string[] = [];

    try {
        const formData = await request.formData();
        const mapFile = formData.get('mapFile') as File;

        if (!mapFile) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 파일 확장자 추출 (주로 .glb 파일)
        const fileExtension = mapFile.name.split('.').pop() || 'glb';
        const filename = `${prefix}/${mapType}/${Date.now()}.${fileExtension}`;
        
        const arrayBuffer = await mapFile.arrayBuffer();
        const blob = await put(filename, arrayBuffer, {
            access: 'public',
            contentType: mapFile.type || 'model/gltf-binary',
        });
        
        uploadedUrls.push(blob.url);

        return NextResponse.json({
            url: blob.url,
            size: mapFile.size,
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
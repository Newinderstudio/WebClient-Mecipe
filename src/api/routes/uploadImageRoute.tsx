import fetchCompat from '@/util/fetchCompat';
import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat('GET', 'auth/me', token);

    if (auth?.authToken !== true) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') ?? '';

    const uploadedUrls: string[] = [];

    try {
        const formData = await request.formData();
        const imageFiles = formData.getAll('image') as File[];
        const thumbnailFiles = formData.getAll('thumbnail') as File[];

        const uploadedFiles: { url: string; thumbnailUrl?: string }[] = [];

        // 이미지 파일들 업로드
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            // 파일 확장자 추출
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const filename = `${prefix}/${Date.now()}_${i}.${fileExtension}`;
            
            const arrayBuffer = await file.arrayBuffer();
            const blob = await put(filename, arrayBuffer, {
                access: 'public',
                contentType: file.type,
            });
            
            uploadedUrls.push(blob.url);
            
            const result: { url: string; thumbnailUrl?: string } = {
                url: blob.url
            };

            // 해당하는 썸네일 파일이 있으면 업로드
            if (thumbnailFiles[i]) {
                const thumbnailFile = thumbnailFiles[i];
                // 썸네일 파일 확장자 추출
                const thumbnailExtension = thumbnailFile.name.split('.').pop() || 'jpg';
                const thumbnailFilename = `${prefix}/thumbnail/${Date.now()}_${i}.${thumbnailExtension}`;
                
                const thumbnailArrayBuffer = await thumbnailFile.arrayBuffer();
                const thumbnailBlob = await put(thumbnailFilename, thumbnailArrayBuffer, {
                    access: 'public',
                    contentType: thumbnailFile.type,
                });
                
                uploadedUrls.push(thumbnailBlob.url);
                result.thumbnailUrl = thumbnailBlob.url;
            }

            uploadedFiles.push(result);
        }

        return NextResponse.json(uploadedFiles);

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

export async function deleteImage(url: string): Promise<void> {
   return await del(url);
}

// The next lines are required for Pages API Routes only
export const config = {
    api: {
        bodyParser: false,
    },
};
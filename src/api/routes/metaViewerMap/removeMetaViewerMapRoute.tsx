import fetchCompat from '@/util/fetchCompat';
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request): Promise<NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat('GET', 'auth/me', token);

    if (auth?.authToken !== true) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const urlsParam = searchParams.get('urls');
        
        if (!urlsParam) {
            return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
        }

        // 쉼표로 구분된 URL을 배열로 변환 (디코딩)
        const urls = urlsParam.split(',').map(url => decodeURIComponent(url));

        if (urls.length === 0) {
            return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
        }

        console.log('파일 삭제 요청:', urls);

        // 모든 파일 삭제
        const deletePromises = urls.map(async (url: string) => {
            try {
                await del(url);
                console.log('파일 삭제 완료:', url);
            } catch (error) {
                console.error('파일 삭제 실패:', url, error);
                // 개별 파일 삭제 실패는 로그만 남기고 계속 진행
            }
        });

        await Promise.all(deletePromises);

        return NextResponse.json({ 
            message: 'Files deleted successfully',
            deletedCount: urls.length 
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

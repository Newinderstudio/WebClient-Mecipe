import { NextResponse } from "next/server";
import { decryptAesGcmPacked } from "@/util/encrypt-aes-gcm-paced";
import fetchCompat from "@/util/fetchCompat";

export async function POST(request: Request): Promise<NextResponse> {

    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat<{ authToken: boolean }>('GET', 'auth/me', token);

    if (!auth || auth.authToken !== true) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ request.arrayBuffer()로 직접 읽기
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    const encodingUrl = encodeURIComponent(url);
    const rawGltfResponse = await fetch(encodingUrl);
    if (rawGltfResponse.ok) {
        const encryptedData = await rawGltfResponse.arrayBuffer();
        const glbEncryptionKey = process.env.GLB_ENCRYPTION_KEY;
        if (!glbEncryptionKey) {
            console.error('GLB_ENCRYPTION_KEY is not set');
            return NextResponse.json({ error: 'KEY is not set' }, { status: 500 });
        }

        const decryptedData = await decryptAesGcmPacked(encryptedData, glbEncryptionKey);
        // ✅ ArrayBuffer를 직접 반환 (JSON 아님)
        return new NextResponse(decryptedData, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
    } else {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
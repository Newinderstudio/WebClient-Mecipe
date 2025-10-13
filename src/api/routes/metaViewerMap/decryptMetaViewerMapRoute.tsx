import { NextResponse } from "next/server";
import { decryptAesGcmPacked } from "@/util/encrypt-aes-gcm-paced";

export async function POST(request: Request): Promise<NextResponse> {
    // ✅ request.arrayBuffer()로 직접 읽기
    const encryptedData = await request.arrayBuffer();
    
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
}
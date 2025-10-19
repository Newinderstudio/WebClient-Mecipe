import { NextResponse } from "next/server";
import { decryptAesGcmPacked } from "@/util/encrypt-aes-gcm-paced";
import { sign } from "jsonwebtoken";

export async function POST(request: Request): Promise<NextResponse> {

    // GLB_ENCRYPTION_KEY 암호화된 contentKey를 복호화
    const { contentKey } = await request.json();

    const glbEncryptionKey = process.env.GLB_ENCRYPTION_KEY;
    if (!glbEncryptionKey) {
        console.error('GLB_ENCRYPTION_KEY is not set');
        return NextResponse.json({ error: 'KEY is not set' }, { status: 500 });
    }

    // contentKey가 base64 문자열로 전달되므로 ArrayBuffer로 변환
    const contentKeyBuffer = Buffer.from(contentKey, 'base64');
    const originalContentKey = await decryptAesGcmPacked(contentKeyBuffer, glbEncryptionKey);

    const payload = {
        fileId: contentKey,
        contentKey: Buffer.from(originalContentKey).toString('base64'),
    };

    // 만료 시간 설정 (초 단위, 짧게! 예: 5분)
    const expiresIn = '30s';

    // ✨ JWT 서명에 사용할 비밀 키 ✨
    // 이 키는 서버에만 보관되어야 하며, `MASTER_AES_KEY`와는 또 다른 키여야 해.
    const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET as string;

    // JWT 서명 (생성)
    const jwtToken = sign(payload, JWT_SIGNING_SECRET, { expiresIn: expiresIn });
    return NextResponse.json({ jwtToken }, { status: 200 });
}
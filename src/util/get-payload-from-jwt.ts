import { Buffer } from 'buffer'; // 브라우저 환경에서는 'buffer' 패키지를 폴리필해야 할 수 있음.
                               // 또는 그냥 base64를 직접 다룰 수도 있음.
// 또는 'jwt-decode' 같은 라이브러리를 사용할 수도 있음.

export async function getPayloadFromJwt(jwtToken: string, payloadKey: string): Promise<Buffer> {
    // 1. JWT 디코딩 (서명 검증 없이 페이로드만 보는 것)
    // 클라이언트에서 또 복잡한 검증을 할 필요는 없을 수 있음.
    // 하지만 만료 여부 정도는 확인하는 게 좋음.
    const parts = jwtToken.split('.');
    const decodedPayload = JSON.parse(atob(parts[1])); // Base64 디코딩 후 JSON 파싱

    // 2. 만료 시간 확인 (선택 사항이지만 권장)
    if (decodedPayload.exp * 1000 < Date.now()) {
        throw new Error('Decryption key JWT has expired.');
    }

    // 3. decryptionKey 추출 및 Buffer로 변환
    const payloadValue = decodedPayload[payloadKey];
    if (!payloadValue) {
        throw new Error('Decryption key not found in JWT.');
    }

    // Base64 문자열을 Buffer(Uint8Array)로 변환하여 반환
    return Buffer.from(payloadValue, 'base64');
}

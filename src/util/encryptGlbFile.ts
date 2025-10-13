/**
 * GLB 파일을 AES-256-GCM으로 암호화 (서버 전용)
 * 포맷: [IV(12)] [TAG(16)] [CIPHERTEXT]
 * 
 * 암호화 키는 환경변수 GLB_ENCRYPTION_KEY에서 가져오며,
 * 없을 경우 기본 키를 사용합니다.
 * 
 * ⚠️ 이 파일은 서버 측(API 라우트)에서만 사용됩니다.
 */

import crypto from 'crypto';


/**
 * GLB 파일을 암호화 (Node.js crypto 사용)
 * @param buffer 암호화할 파일의 Buffer
 * @returns 암호화된 Buffer
 */
export function encryptGlbBuffer(buffer: Buffer): Buffer {
  try {
    const secret = process.env.GLB_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error('GLB_ENCRYPTION_KEY is not set');
    }
    const key = Buffer.from(secret, 'base64');

    if (key.length !== 32) {
      throw new Error('Key must be 32 bytes (AES-256).');
    }

    // 1. IV (Initialization Vector) 생성 - GCM 권장 12바이트
    const iv = crypto.randomBytes(12);

    // 2. Cipher 생성 및 암호화
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const enc1 = cipher.update(buffer);
    const enc2 = cipher.final();
    const tag = cipher.getAuthTag();

    // 3. 최종 포맷: [IV(12)] [TAG(16)] [CIPHERTEXT]
    const result = Buffer.concat([iv, tag, enc1, enc2]);

    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('파일 암호화 중 오류가 발생했습니다.');
  }
}


import crypto from 'crypto';
import { Buffer } from 'buffer';

/**
 * 버퍼를 AES-256-GCM으로 복호화
 * 포맷: [IV(12)] [TAG(16)] [CIPHERTEXT]
 * 
 * 서버(Node.js)와 클라이언트(브라우저) 모두에서 사용 가능
 */

// 환경에 맞는 crypto.subtle 가져오기
function getSubtleCrypto(): SubtleCrypto {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // 브라우저 환경
    return window.crypto.subtle;
  } else if (crypto?.subtle) {
    // Node.js 환경 (v15.0.0+)
    return crypto.subtle as SubtleCrypto;
  }
  throw new Error('SubtleCrypto is not available in this environment');
}

export async function decryptAesGcmPacked(buf: ArrayBuffer | Buffer, secret: string | Buffer | Uint8Array): Promise<ArrayBuffer> {

  if (!secret) {
    throw new Error('secret is not set');
  }

    const subtleCrypto = getSubtleCrypto();
    
    // secret을 Uint8Array로 변환
    let secretBytes: Uint8Array;
    if (typeof secret === 'string') {
        secretBytes = Buffer.from(secret, 'base64');
    } else if (secret instanceof Buffer) {
        secretBytes = new Uint8Array(secret);
    } else {
        secretBytes = secret;
    }

    const key: CryptoKey = await subtleCrypto.importKey(
        'raw',
        secretBytes,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const all = new Uint8Array(buf);
    const iv = all.slice(0, 12);
    const tag = all.slice(12, 28);
    const ciphertext = all.slice(28);

    // 브라우저 subtle.decrypt는 GCM tag를 append한 형식을 기대하므로, ciphertext 뒤에 tag를 붙여줘야 함
    const ctWithTag = new Uint8Array(ciphertext.length + tag.length);
    ctWithTag.set(ciphertext, 0);
    ctWithTag.set(tag, ciphertext.length);

    return subtleCrypto.decrypt({ name: 'AES-GCM', iv }, key, ctWithTag);
}


/**
 * GLB 파일을 암호화 (Node.js crypto 사용)
 * @param buffer 암호화할 파일의 Buffer
 * @returns 암호화된 Buffer
 */
export function encryptGlbBuffer(buffer: Buffer, secret: string | Buffer): Buffer {
  try {
    if (!secret) {
      throw new Error('secret is not set');
    }
    const key = typeof secret === 'string' ? Buffer.from(secret, 'base64') : secret;

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

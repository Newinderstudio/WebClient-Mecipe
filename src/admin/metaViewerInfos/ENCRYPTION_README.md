# GLB 파일 암호화 시스템

## 개요
MetaViewerInfo 맵 파일(GLB/GLTF)은 업로드 전에 **AES-256-GCM** 알고리즘으로 암호화됩니다.
이는 Vercel Blob에 저장되는 3D 모델 파일을 보호하기 위함입니다.

## 암호화 사양

### 알고리즘
- **암호화 방식**: AES-256-GCM
- **키 길이**: 256비트 (32바이트)
- **IV 길이**: 12바이트 (GCM 권장)
- **인증 태그**: 16바이트 (128비트)

### 파일 포맷
암호화된 파일은 다음과 같은 구조를 갖습니다:

```
[IV(12바이트)] [AUTH_TAG(16바이트)] [CIPHERTEXT(가변)]
```

- **Offset 0-11**: Initialization Vector (IV)
- **Offset 12-27**: Authentication Tag
- **Offset 28-EOF**: 암호화된 데이터

### 파일명 규칙
- 원본: `model.glb` → 암호화: `model.glb.enc`
- 원본: `collider.gltf` → 암호화: `collider.gltf.enc`

## 구현

### 서버 측 암호화
파일은 API 라우트에서 암호화됩니다. 이는 암호화 키를 클라이언트에 노출하지 않기 위함입니다.

**위치**: `src/util/encryptGlbFile.ts`

**주요 함수**:
- `encryptGlbBuffer(buffer: Buffer): Buffer` - Buffer를 암호화 (서버 전용)

### 암호화 플로우
1. 사용자가 GLB/GLTF 파일 선택
2. 파일을 API 라우트로 전송
3. **서버에서 암호화 수행** (Node.js crypto)
   - 12바이트 IV 생성
   - AES-256-GCM으로 암호화
   - 16바이트 인증 태그 생성
4. 암호화된 파일을 Vercel Blob에 업로드
5. URL을 데이터베이스에 저장

### 복호화
클라이언트(게임 엔진, 뷰어 등)에서 다운로드 후 복호화해야 합니다.

**Node.js 복호화 예제**:
```javascript
import { readFile } from 'fs/promises';
import crypto from 'crypto';

const key = Buffer.from('TEY23cxf317iI/0qXOCERxa4EvPrVY+UH7YaS6kA4Eg=', 'base64');
const encrypted = await readFile('model.glb.enc');

const iv = encrypted.slice(0, 12);
const tag = encrypted.slice(12, 28);
const ciphertext = encrypted.slice(28);

const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);

const decrypted = Buffer.concat([
  decipher.update(ciphertext),
  decipher.final()
]);

await writeFile('model.glb', decrypted);
```

**브라우저 복호화 예제**:
```typescript
async function decryptGlbFile(encryptedArrayBuffer: ArrayBuffer, keyBase64: string): Promise<ArrayBuffer> {
  const encryptedArray = new Uint8Array(encryptedArrayBuffer);
  
  // 1. IV, TAG, CIPHERTEXT 추출
  const iv = encryptedArray.slice(0, 12);
  const tag = encryptedArray.slice(12, 28);
  const ciphertext = encryptedArray.slice(28);
  
  // 2. 키 임포트
  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // 3. 복호화 (ciphertext + tag 결합 필요)
  const dataToDecrypt = new Uint8Array(ciphertext.length + tag.length);
  dataToDecrypt.set(ciphertext);
  dataToDecrypt.set(tag, ciphertext.length);
  
  // 4. 복호화 수행
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    dataToDecrypt
  );
  
  return decrypted;
}
```

## 암호화 키 관리

### 기본 키
개발 및 테스트용 기본 키:
```
TEY23cxf317iI/0qXOCERxa4EvPrVY+UH7YaS6kA4Eg=
```

### 환경변수 설정 (권장)
프로덕션 환경에서는 환경변수로 키를 관리하세요:

⚠️ **중요**: `NEXT_PUBLIC_` 접두사를 사용하지 마세요! (클라이언트 노출 위험)

**.env.local** (서버 전용):
```bash
GLB_ENCRYPTION_KEY=your_base64_key_here
```

### 새 키 생성
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32
```

## 보안 고려사항

### ✅ 장점
1. **전송 중 보호**: 네트워크 스니핑 방지
2. **저장소 보호**: Vercel Blob에서 직접 다운로드해도 사용 불가
3. **인증 태그**: 데이터 무결성 검증

### ⚠️ 주의사항
1. **키 관리**: 암호화 키는 반드시 안전하게 보관 (서버 측 환경변수)
2. **키 공유**: 클라이언트(게임)도 동일한 키 필요
3. **키 로테이션**: 주기적인 키 변경 고려
4. **서버 측 암호화**: 암호화는 서버에서 수행되므로 키가 클라이언트에 노출되지 않음

### 🔒 추가 보안 강화 옵션
1. ✅ **서버 측 암호화**: API 라우트에서 암호화 (구현됨)
2. **키 관리 서비스**: AWS KMS, Azure Key Vault 등
3. **다중 키**: 카페별 또는 맵별 다른 키 사용
4. **접근 제어**: 서명된 URL로 다운로드 제한

## 파일 크기 영향
- 암호화로 인한 오버헤드: **28바이트** (IV 12 + TAG 16)
- 압축률: 원본과 동일 (이미 GLB는 압축됨)
- 성능: 브라우저 Web Crypto API는 하드웨어 가속 지원

## 트러블슈팅

### "Key must be 32 bytes" 에러
- Base64 키가 정확히 32바이트로 디코딩되는지 확인
- 새 키 생성: `openssl rand -base64 32`

### 복호화 실패
- IV, TAG, CIPHERTEXT 순서 확인
- 동일한 키 사용 여부 확인
- 파일이 손상되지 않았는지 확인

### 성능 문제
- 큰 파일(100MB+)은 암호화에 수 초 소요 가능
- 진행 상태 표시 구현됨 ("파일 암호화 중...")

## 코드 위치
- **암호화 유틸** (서버): `src/util/encryptGlbFile.ts`
- **업로드 컴포넌트** (클라이언트): `src/admin/metaViewerInfos/components/MapFileUploadComponent.tsx`
- **API 라우트** (서버): `src/api/routes/metaViewerMap/uploadMetaViewerMapRoute.tsx`

## 보안 개선사항

### ✅ 서버 측 암호화의 장점
1. **키 보안**: 암호화 키가 클라이언트에 절대 노출되지 않음
2. **환경변수 보호**: `GLB_ENCRYPTION_KEY`는 서버에서만 접근 가능
3. **일관성**: 모든 파일이 동일한 서버 환경에서 암호화됨
4. **감사 추적**: 서버 로그로 암호화 작업 추적 가능

## 참고
- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM - NIST](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)


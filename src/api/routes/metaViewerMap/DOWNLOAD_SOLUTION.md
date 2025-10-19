*커서AI가 작성한 md 참고용*

# 대용량 파일 다운로드 해결 방안

## 🚨 문제 상황
- Vercel Response body size 제한: **4.5MB**
- 현재: 서버에서 5GB 파일 복호화 → 응답으로 전송 ❌
- 결과: 4.5MB 제한에 걸려 실패

---

## ✅ 추천 솔루션: 클라이언트 직접 복호화

### **플로우:**
```
1. 클라이언트 → 서버: "파일 다운로드 요청"
2. 서버 → 클라이언트: 암호화된 Blob URL + 복호화 키 (세션)
3. 클라이언트: Blob URL에서 직접 다운로드 (암호화된 파일)
4. 클라이언트: Web Crypto API로 복호화
5. 완료!
```

---

## 🔧 구현 방법

### **1. 서버: URL + 임시 키 제공**

```typescript
// src/api/routes/metaViewerMap/getDecryptionInfo.tsx
export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  const auth = await fetchCompat<{authToken: boolean}>('GET', 'auth/me', token);
  
  if (!auth || auth.authToken !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { url } = await request.json();
  
  // ✅ 암호화된 URL과 복호화 정보만 반환
  const sessionKey = generateTemporaryKey(); // 1시간 유효
  
  return NextResponse.json({
    encryptedUrl: url,
    decryptionKey: sessionKey, // 또는 다른 방식으로 전달
    algorithm: 'AES-GCM',
    expiresAt: Date.now() + 3600000 // 1시간
  });
}
```

---

### **2. 클라이언트: 직접 다운로드 + 복호화**

```typescript
// src/util/downloadAndDecryptFile.ts
export async function downloadAndDecryptFile(
  token: string,
  encryptedUrl: string,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  
  // 1단계: 복호화 정보 받기
  const infoResponse = await fetch('/api/meta-viewer/decryption-info', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: encryptedUrl }),
  });
  
  const { encryptedUrl: blobUrl, decryptionKey } = await infoResponse.json();
  
  // 2단계: 암호화된 파일 직접 다운로드 (Blob에서)
  console.log('암호화된 파일 다운로드 시작...');
  const response = await fetch(blobUrl);
  const totalSize = parseInt(response.headers.get('content-length') || '0');
  
  // 진행률 추적
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let receivedSize = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    chunks.push(value);
    receivedSize += value.length;
    
    const progress = (receivedSize / totalSize) * 50; // 50%까지 다운로드
    onProgress?.(Math.round(progress));
  }
  
  const encryptedData = new Uint8Array(receivedSize);
  let position = 0;
  for (const chunk of chunks) {
    encryptedData.set(chunk, position);
    position += chunk.length;
  }
  
  console.log('다운로드 완료, 복호화 시작...');
  
  // 3단계: Web Crypto API로 복호화
  const decryptedData = await decryptWithWebCrypto(
    encryptedData.buffer,
    decryptionKey,
    (progress) => {
      onProgress?.(50 + progress / 2); // 50~100%
    }
  );
  
  console.log('복호화 완료!');
  return decryptedData;
}

async function decryptWithWebCrypto(
  encryptedData: ArrayBuffer,
  keyHex: string,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  
  // 키 임포트
  const keyData = hexToArrayBuffer(keyHex);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // IV와 암호문 분리 (첫 12바이트가 IV)
  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);
  
  // 복호화
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    cryptoKey,
    ciphertext
  );
  
  onProgress?.(100);
  return decrypted;
}
```

---

### **3. UI 컴포넌트에서 사용**

```typescript
// 사용 예시
const decryptedData = await downloadAndDecryptFile(
  token,
  encryptedFileUrl,
  (progress) => {
    console.log(`다운로드 및 복호화: ${progress}%`);
    // 0~50%: 다운로드
    // 50~100%: 복호화
  }
);

// THREE.js에서 사용
const blob = new Blob([decryptedData], { type: 'model/gltf-binary' });
const objectUrl = URL.createObjectURL(blob);
const gltf = await gltfLoader.loadAsync(objectUrl);
```

---

## 🔒 보안 고려사항

### **문제: 복호화 키를 클라이언트에 전달?**

**해결책 1: 세션 기반 임시 키**
```typescript
// 서버에서 임시 세션 키 생성 (1시간 유효)
const sessionKey = crypto.randomBytes(32).toString('hex');
redis.set(`decrypt-session:${sessionId}`, masterKey, 'EX', 3600);

// 클라이언트는 sessionId만 받음
// 복호화 시 서버에 sessionId 전송 → 실제 키 받음
```

**해결책 2: 비밀번호 기반 키 유도 (PBKDF2)**
```typescript
// 사용자 계정의 비밀번호에서 키 유도
const derivedKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['decrypt']
);
```

**해결책 3: 공개키 암호화 (RSA)**
```typescript
// 서버: 복호화 키를 클라이언트 공개키로 암호화
const encryptedKey = await crypto.subtle.encrypt(
  { name: 'RSA-OAEP' },
  clientPublicKey,
  decryptionKey
);

// 클라이언트: 자신의 개인키로 복호화
const decryptionKey = await crypto.subtle.decrypt(
  { name: 'RSA-OAEP' },
  clientPrivateKey,
  encryptedKey
);
```

---

## 📊 성능 비교

| 방법 | 다운로드 | 복호화 | 총 시간 | 서버 부하 |
|------|---------|--------|---------|----------|
| 서버 복호화 (기존) | ❌ 불가능 | - | - | 높음 |
| 클라이언트 복호화 | ~5분 | ~2분 | ~7분 | **낮음** ✅ |
| 스트리밍 복호화 | ~5분 | 실시간 | ~5분 | 중간 |

---

## ⚠️ 주의사항

### **Web Crypto API 제한**
- AES-GCM 태그 검증 실패 시 전체 실패
- 대용량 파일은 메모리 많이 사용
- 💡 **해결:** Service Worker에서 처리

### **브라우저 메모리**
- 5GB 파일 = 브라우저 메모리 5GB 필요
- 💡 **해결:** Streaming 또는 청크 단위 처리

---

## 🚀 최종 추천

**운영 환경:**
- **클라이언트 직접 복호화** (보안 강화 버전)
- 세션 기반 임시 키 사용
- Service Worker로 백그라운드 처리

**개발 환경:**
- 복호화 없이 테스트 (더미 파일)
- 또는 작은 파일로 테스트

---

## 📚 참고 코드

- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Streams API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API


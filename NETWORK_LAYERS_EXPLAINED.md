# HTTP 프로토콜 레벨 vs Edge Network 레벨

## 🌐 네트워크 계층 구조

### **OSI 7계층 모델**

```
┌─────────────────────────────────────┐
│ 7. Application Layer                │  ← 애플리케이션 레벨
│    - HTTP, HTTPS, FTP               │     (Next.js, Node.js)
├─────────────────────────────────────┤
│ 6. Presentation Layer               │
│    - 암호화, 압축                    │
├─────────────────────────────────────┤
│ 5. Session Layer                    │
│    - 세션 관리                       │
├─────────────────────────────────────┤
│ 4. Transport Layer                  │
│    - TCP, UDP                       │
├─────────────────────────────────────┤
│ 3. Network Layer                    │
│    - IP (라우팅)                    │
├─────────────────────────────────────┤
│ 2. Data Link Layer                  │
│    - 이더넷                         │
├─────────────────────────────────────┤
│ 1. Physical Layer                   │
│    - 케이블, 무선                    │
└─────────────────────────────────────┘
```

---

## 🔍 HTTP 프로토콜 레벨 vs Edge Network 레벨

### **차이점 요약:**

| 항목 | HTTP 프로토콜 레벨 | Edge Network 레벨 |
|------|-------------------|------------------|
| **계층** | OSI 7계층 (Application) | 인프라/하드웨어 |
| **위치** | 요청/응답 데이터 구조 | 서버 측 네트워크 장비 |
| **역할** | 데이터 형식 정의 | 트래픽 제어 및 필터링 |
| **체크 시점** | 데이터 해석 시 | 데이터 수신 중 |
| **변경 가능성** | 애플리케이션에서 제어 | 인프라 설정 필요 |

---

## 📊 실제 요청 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. 클라이언트 (브라우저)                                 │
│                                                         │
│    HTTP Request 생성:                                    │
│    POST /api/upload HTTP/1.1                            │
│    Content-Type: multipart/form-data                    │
│    Transfer-Encoding: chunked                           │  ← HTTP 프로토콜 레벨
│    Content-Length: ...                                  │
│                                                         │
│    Body:                                                │
│    [파일 데이터 청크들...]                              │
└─────────────────────────────────────────────────────────┘
                        ↓ (인터넷 전송)
┌─────────────────────────────────────────────────────────┐
│ 2. Vercel Edge Network (nginx/프록시 서버)               │
│                                                         │
│    ┌──────────────────────────────────────────────┐    │
│    │  Edge Network 레벨 (인프라)                   │    │
│    │                                               │    │
│    │  - 요청 수신                                  │    │
│    │  - 헤더 파싱                                   │    │
│    │  - Body 크기 체크 (누적 계산)                  │    │  ← Edge Network 레벨
│    │    if (bodySize > 4.5MB) {                    │    │
│    │      return 413;  // 거부!                    │    │
│    │    }                                           │    │
│    │  - 라우팅                                      │    │
│    └──────────────────────────────────────────────┘    │
│                                                         │
│    [HTTP 프로토콜 해석은 여기서 진행]                    │
│    - Transfer-Encoding: chunked 분석                    │  ← HTTP 프로토콜 레벨
│    - 청크 디코딩                                        │
│    - 최종 body 재구성                                   │
└─────────────────────────────────────────────────────────┘
                        ↓ (통과 시)
┌─────────────────────────────────────────────────────────┐
│ 3. Next.js API Route (애플리케이션)                     │
│                                                         │
│    export async function POST(request: Request) {      │
│      // request.body 읽기                               │  ← HTTP 프로토콜 레벨
│      // multipart 파싱                                  │
│      // 애플리케이션 로직                                │
│    }                                                    │
│                                                         │
│    [여기서 도달하기 전에 Edge Network에서 이미 막힘]      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔬 상세 비교

### **1. HTTP 프로토콜 레벨**

**정의:**
- HTTP/HTTPS 프로토콜의 **규격(Specification)**
- 데이터의 **형식과 의미**를 정의
- RFC 7230, RFC 7231 등에 정의됨

**특징:**
- ✅ 애플리케이션에서 제어 가능
- ✅ 브라우저와 서버가 이해하는 "언어"
- ✅ 요청/응답의 구조를 정의

**예시:**
```http
POST /api/upload HTTP/1.1
Host: example.com
Content-Type: multipart/form-data
Transfer-Encoding: chunked    ← HTTP 프로토콜 헤더

1000\r\n
[1000 bytes]\r\n
1000\r\n
[1000 bytes]\r\n
0\r\n\r\n
```

**체크 내용:**
- 헤더 형식이 올바른가?
- Transfer-Encoding이 유효한가?
- multipart boundary가 올바른가?

---

### **2. Edge Network 레벨**

**정의:**
- **물리적 네트워크 인프라**
- Vercel의 **프록시 서버(nginx)**
- 요청이 애플리케이션에 도달하기 **전에** 처리

**특징:**
- ❌ 애플리케이션에서 직접 제어 불가능
- ✅ 인프라 관리자가 설정
- ✅ 모든 요청에 공통 적용

**예시 (nginx 설정):**
```nginx
# /etc/nginx/nginx.conf (Vercel Edge Network 내부)

http {
    client_max_body_size 4.5m;  ← Edge Network 레벨 설정
    
    # 모든 요청에 적용
    # 애플리케이션 도달 전에 체크
}
```

**체크 내용:**
- Body 크기가 제한 이하인가? (4.5MB)
- 요청 속도가 너무 빠른가? (Rate limiting)
- IP가 차단되었는가? (DDoS 방어)

---

## 🎯 핵심 차이점

### **시점 (Timing)**

```
요청 전송
    ↓
┌─────────────────────────────────────┐
│ Edge Network 레벨 (먼저 체크)       │  ← 1단계: 인프라 레벨
│ - nginx가 요청 수신                  │
│ - Body 크기 즉시 계산                │
│ - 4.5MB 초과 → 413 에러 반환        │
└─────────────────────────────────────┘
    ↓ (통과 시)
┌─────────────────────────────────────┐
│ HTTP 프로토콜 레벨 (나중에 해석)     │  ← 2단계: 애플리케이션 레벨
│ - Next.js가 요청 파싱                │
│ - Transfer-Encoding 해석             │
│ - multipart 디코딩                   │
└─────────────────────────────────────┘
```

### **제어 가능성**

| 레벨 | 제어 가능 | 누가 제어? |
|------|----------|-----------|
| **HTTP 프로토콜** | ✅ 가능 | 개발자 (코드) |
| **Edge Network** | ❌ 불가능 | Vercel (인프라) |

---

## 💡 비유로 이해하기

### **우편 시스템 비유:**

```
┌─────────────────────────────────────┐
│ [편지 작성]                          │
│ - 글쓰기 (HTTP 프로토콜 레벨)        │  ← 애플리케이션
│ - 봉투에 넣기                        │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ [우체국 입구]                        │
│ - 무게 체크 (Edge Network 레벨)      │  ← 인프라
│ - 4.5kg 초과 → 반송                  │  ← 여기서 막힘!
└─────────────────────────────────────┘
        ↓ (통과 시)
┌─────────────────────────────────────┐
│ [편지 처리 센터]                     │
│ - 편지 내용 읽기 (HTTP 프로토콜)      │  ← 애플리케이션
│ - 배송                                │
└─────────────────────────────────────┘
```

**핵심:**
- **HTTP 프로토콜**: 편지 **내용의 형식** (어떻게 쓸지)
- **Edge Network**: 우체국 **시스템의 규칙** (무게 제한)

---

## 🔧 실제 코드 예시

### **HTTP 프로토콜 레벨 (애플리케이션)**

```typescript
// src/app/api/upload/route.tsx
export async function POST(request: Request) {
  // HTTP 프로토콜 해석
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('multipart/form-data')) {
    // multipart 파싱 (HTTP 프로토콜 레벨)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // 여기서 파일 크기 체크 가능
    if (file.size > 100 * 1024 * 1024) {  // 100MB
      return NextResponse.json({ error: 'Too large' }, { status: 400 });
    }
    
    // 파일 처리...
  }
}
```

**문제:** 이 코드에 **도달하기 전에** Edge Network에서 이미 막힘!

---

### **Edge Network 레벨 (인프라)**

```nginx
# Vercel Edge Network 내부 (우리가 볼 수 없음)

http {
    # 모든 요청에 적용되는 전역 설정
    client_max_body_size 4.5m;  ← 여기서 체크!
    
    # 요청이 도착하면:
    # 1. Body 크기 계산 (청크 포함)
    # 2. 4.5MB 초과 → 413 반환
    # 3. 애플리케이션으로 전달 안 됨
}
```

---

## 📈 요청 처리 순서

```
[클라이언트]
  ↓ HTTP Request 생성
  ↓ Transfer-Encoding: chunked 헤더 추가
  ↓ 청크로 데이터 전송

[Vercel Edge Network]
  ├─ 1. 요청 수신
  ├─ 2. 헤더 읽기 (HTTP 프로토콜 해석)
  ├─ 3. Body 크기 체크 (Edge Network 레벨)
  │   └─ 누적 크기 > 4.5MB?
  │       ├─ Yes → 413 에러 반환 ❌
  │       └─ No → 계속 진행
  ├─ 4. Transfer-Encoding 해석 (HTTP 프로토콜)
  ├─ 5. 청크 디코딩
  └─ 6. Next.js로 전달

[Next.js API Route]
  ├─ 7. request.body 읽기
  ├─ 8. multipart 파싱 (HTTP 프로토콜)
  └─ 9. 애플리케이션 로직 실행
```

**핵심:** 3단계에서 막히면 4-9단계는 실행되지 않음!

---

## 🎓 정리

### **HTTP 프로토콜 레벨:**
- **무엇**: 데이터 형식과 규격
- **언제**: 애플리케이션에서 파싱할 때
- **누가**: 개발자가 제어
- **예시**: Transfer-Encoding, Content-Type, multipart boundary

### **Edge Network 레벨:**
- **무엇**: 인프라의 트래픽 제어
- **언제**: 요청이 서버에 도달하기 전
- **누가**: Vercel (인프라 관리자)
- **예시**: body size limit, rate limiting, DDoS 방어

---

## 🔑 결론

**HTTP 프로토콜 레벨:**
- ✅ "어떻게 데이터를 보낼지" 정의
- ✅ 애플리케이션 코드에서 제어
- ✅ Transfer-Encoding, multipart 등

**Edge Network 레벨:**
- ✅ "어떤 요청을 받아들일지" 제한
- ✅ 인프라에서 제어 (변경 불가능)
- ✅ Body size limit, Rate limiting 등

**차이점:**
- HTTP 프로토콜: 데이터의 **형식**
- Edge Network: 인프라의 **규칙**

**왜 청크 업로드가 필요한가?**
→ Edge Network 규칙(4.5MB 제한)을 우회하기 위해 각 요청을 4MB 이하로 제한!







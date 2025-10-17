/**
 * 대용량 파일을 청크로 나누어 업로드하는 유틸 함수
 * Next.js API Route의 4.5MB body size 제한을 우회
 */

export interface ChunkedUploadOptions {
  token: string;
  file: File;
  mapType: 'render' | 'collider';
  prefix: string;
  nickname: string;
  chunkSize?: number; // 기본 4MB (4.5MB 제한보다 작게)
  onProgress?: (progress: number, stage: string) => void;
}

export interface ChunkedUploadResult {
  url: string;
  size: number;
  originalSize: number;
}

const DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

export async function uploadChunkedFile(
  options: ChunkedUploadOptions
): Promise<ChunkedUploadResult> {
  const {
    token,
    file,
    mapType,
    prefix,
    nickname,
    chunkSize = DEFAULT_CHUNK_SIZE,
    onProgress,
  } = options;

  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / chunkSize);

  console.log(`청크 업로드 시작: ${file.name} (${(totalSize / 1024 / 1024).toFixed(2)} MB, ${totalChunks} chunks)`);

  try {
    // 1단계: 업로드 세션 초기화
    onProgress?.(0, '업로드 준비 중...');
    const initResponse = await fetch('/api/meta-viewer/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: file.name,
        totalSize,
        totalChunks,
        mapType,
        prefix,
        nickname,
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(error.error || 'Failed to initialize upload');
    }

    const { sessionId } = await initResponse.json();
    console.log('세션 생성 완료:', sessionId);

    // 2단계: 청크 업로드 (순차적으로)
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('chunk', chunk);

      const chunkResponse = await fetch('/api/meta-viewer/upload/chunk', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!chunkResponse.ok) {
        const error = await chunkResponse.json();
        throw new Error(`Chunk ${chunkIndex} upload failed: ${error.error}`);
      }

      const chunkResult = await chunkResponse.json();
      const progress = Math.round((chunkResult.uploadedChunks / totalChunks) * 100);
      
      onProgress?.(
        progress,
        `업로드 중... (${chunkResult.uploadedChunks}/${totalChunks})`
      );

      console.log(`청크 업로드 완료: [${chunkIndex + 1}/${totalChunks}] ${progress}%`);
    }

    // 3단계: 업로드 완료 및 암호화
    onProgress?.(100, '파일 암호화 및 저장 중...');
    console.log('모든 청크 업로드 완료, 서버 처리 시작...');

    const completeResponse = await fetch('/api/meta-viewer/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.error || 'Failed to complete upload');
    }

    const result = await completeResponse.json();
    console.log('업로드 완료:', result.url);

    return {
      url: result.url,
      size: result.size,
      originalSize: result.originalSize || totalSize,
    };

  } catch (error) {
    console.error('Chunked upload failed:', error);
    throw error;
  }
}


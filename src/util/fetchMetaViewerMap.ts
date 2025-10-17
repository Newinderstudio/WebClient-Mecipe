import { uploadChunkedFile } from './uploadChunkedFile';

export interface UploadMapResult {
  url: string;
  size: number;
}

/**
 * 대용량 파일 업로드 (청크 방식)
 * - 파일을 4MB 청크로 분할하여 업로드
 * - Next.js API의 4.5MB body size 제한 우회
 * - 서버에서 암호화 처리 (키 안전)
 */
export async function uploadMetaViewerMapFile(
  token: string,
  file: File,
  mapType: 'render' | 'collider',
  prefix: string,
  nickname: string,
  onProgress?: (progress: number, stage: string) => void
): Promise<UploadMapResult> {
  try {
    const result = await uploadChunkedFile({
      token,
      file,
      mapType,
      prefix,
      nickname,
      chunkSize: 4 * 1024 * 1024, // 4MB
      onProgress,
    });

    return {
      url: result.url,
      size: result.size,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

export const deleteMetaViewerMapFile = async (token: string, urls: string[]) => {
  if (!token) console.error('token is undefined');
  let res;
  const encodedUrls = urls.map(url => encodeURIComponent(url));
  const path = `/api/meta-viewer/remove?urls=${encodedUrls.join(',')}`;
  try {
    const raw = await fetch(path, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    res = raw;
    const json = await raw.json();
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'fetchCompat status : ' +
        raw.url +
        ' ' +
        raw.status +
        ' ' +
        raw.statusText,
        '\n',
        'response body : ',
        json,
        '\n',
        'request body : ',
      );
    }

    return json;
  } catch (e) {
    console.warn(
      'fetch compat error\n' +
      'request : ' +
      JSON.stringify(
        {
          path: path,
          token: token,
        },
        null,
        2,
      ) +
      '\n\n' +
      'url : ' +
      res?.url +
      ' ' +
      res?.status +
      ' ' +
      res?.statusText +
      '\n\n' +
      e,
    );

    throw e;
  }
}

export async function fetchDecryptMetaViewerMapFile(file: File | ArrayBuffer): Promise<ArrayBuffer> {
  const url = `/api/meta-viewer/decrypt`;
  const response = await fetch(url, {
    method: 'POST',
    body: file, // ✅ File이든 ArrayBuffer든 그대로 전송
  });

  if (!response.ok) {
    // 에러는 여전히 JSON으로 받을 수도 있음
    try {
      const error = await response.json();
      throw new Error(error.error || 'Decrypt failed');
    } catch {
      throw new Error(`Decrypt failed: ${response.statusText}`);
    }
  }

  // ✅ ArrayBuffer로 직접 받기
  return await response.arrayBuffer();
}
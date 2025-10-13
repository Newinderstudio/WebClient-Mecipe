"use client"

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getCache, setCache } from "../idb-cache";
import { fetchDecryptMetaViewerMapFile } from "../fetchMetaViewerMap";

export const gltfCacheDBName = "ModelCacheDB";
export const gltfCacheStoreName = "gltf-cache-v2"; // ✅ 버전 변경으로 기존 캐시 무효화

export type PromiseGroup = Promise<GLTF>;
// ✅ Promise 캐시 - 같은 파일은 한 번만 로드
const gltfPromiseCache = new Map<string, PromiseGroup>();

export function promiseForGLTFLoader(path: string, isDraco: boolean, options?: { cache: boolean, encrypted?: boolean }): PromiseGroup {

    const { cache, encrypted } = options ?? { cache: true, encrypted: false };

    const cacheKey = `${path}-${isDraco}`;

    // 🔒 서버 사이드 렌더링 방지 - 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
        console.log("🔴 [promiseForGLTFLoader] 서버 사이드 렌더링 방지", path);
        return Promise.reject(new Error("GLTFLoader는 브라우저 환경에서만 사용 가능합니다."));
    }

    // ✅ 캐시에 있으면 재사용
    if (gltfPromiseCache.has(cacheKey)) {
        return gltfPromiseCache.get(cacheKey)!;
    }

    const promise = new Promise<GLTF>(async (resolve, reject) => {

        const loader = new GLTFLoader();
        if (isDraco) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
            loader.setDRACOLoader(dracoLoader);
        }

        try {
            // ✅ 캐시에서 원본 데이터(ArrayBuffer) 가져오기
            if (cache) {
                let cachedData = await getCache(gltfCacheDBName, gltfCacheStoreName, cacheKey);
                if (cachedData) {
                    console.log("✅ [Cache Hit] Loading from IndexedDB:", path);
                    
                    if (encrypted) {
                        // 암호화된 경우: 복호화 후 파싱
                        cachedData = await fetchDecryptMetaViewerMapFile(cachedData as ArrayBuffer);
                    }
                    resolve(await loader.parseAsync(cachedData as ArrayBuffer, ''));
                    return;
                }
            }

            console.log("⬇️ [Cache Miss] Downloading:", path);

            if (encrypted) {
                // 암호화된 파일 처리
                const rawGltfResponse = await fetch(path);
                if (rawGltfResponse.ok) {
                    const rawGltf = await rawGltfResponse.arrayBuffer();
                    
                    // IndexedDB에 암호화된 원본 저장
                    if (cache) {
                        await setCache(gltfCacheDBName, gltfCacheStoreName, cacheKey, rawGltf);
                    }
                    
                    const decryptedData = await fetchDecryptMetaViewerMapFile(rawGltf);
                    const gltf = await loader.parseAsync(decryptedData, '');
                    resolve(gltf);
                } else {
                    throw new Error('Encrypted model fetch failed');
                }
            } else {
                // 일반 파일 처리
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${path}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                
                // IndexedDB에 원본 ArrayBuffer 저장
                if (cache) {
                    await setCache(gltfCacheDBName, gltfCacheStoreName, cacheKey, arrayBuffer);
                }
                
                const gltf = await loader.parseAsync(arrayBuffer, '');
                resolve(gltf);
            }

        } catch (error) {
            gltfPromiseCache.delete(cacheKey); // 실패 시 캐시 제거
            reject(error);
        }
    });

    // ✅ 캐시에 저장
    gltfPromiseCache.set(cacheKey, promise);
    return promise;
}
"use client"

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getCache, setCache } from "../idb-cache";
import { fetchDecryptMetaViewerMapContentKey } from "../fetchMetaViewerMap";
import { decryptAesGcmPacked } from "../encrypt-aes-gcm-paced";
import { getPayloadFromJwt } from "../get-payload-from-jwt";

export const gltfCacheDBName = "ModelCacheDB";
export const gltfCacheStoreName = "gltf-cache-v2"; // ✅ 버전 변경으로 기존 캐시 무효화

export type PromiseGroup = Promise<GLTF>;
// ✅ Promise 캐시 - 같은 파일은 한 번만 로드
const gltfPromiseCache = new Map<string, PromiseGroup>();

export function promiseForGLTFLoader(path: string, isDraco: boolean, options?: { cache: boolean, encryptOption?: { contentKey: string}}): PromiseGroup {

    const { cache, encryptOption } = options ?? { cache: true, encryptOption: undefined };

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
                    
                    if (encryptOption) {
                        if (!encryptOption.contentKey) {
                            throw new Error('contentKey is not set');
                        }

                        // 암호화된 경우: 복호화 후 파싱
                        const contentKeyJWT = await fetchDecryptMetaViewerMapContentKey(encryptOption.contentKey);

                        const contentKey = await getPayloadFromJwt(contentKeyJWT, 'contentKey');

                        cachedData = await decryptAesGcmPacked(cachedData as ArrayBuffer, contentKey);
                    }
                    resolve(await loader.parseAsync(cachedData as ArrayBuffer, ''));
                    return;
                }
            }

            console.log("⬇️ [Cache Miss] Downloading:", path);

            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${path}`);
            }
            
            let arrayBuffer = await response.arrayBuffer();
            
            // IndexedDB에 원본 ArrayBuffer 저장
            if (cache) {
                await setCache(gltfCacheDBName, gltfCacheStoreName, cacheKey, arrayBuffer);
            }

            if (encryptOption) {
                if (!encryptOption.contentKey) {
                    throw new Error('contentKey is not set');
                }

                // 암호화된 경우: 복호화 후 파싱
                const contentKeyJWT = await fetchDecryptMetaViewerMapContentKey(encryptOption.contentKey);

                const contentKey = await getPayloadFromJwt(contentKeyJWT, 'contentKey');

                arrayBuffer = await decryptAesGcmPacked(arrayBuffer as ArrayBuffer, contentKey);
            }
            
            const gltf = await loader.parseAsync(arrayBuffer, '');
            resolve(gltf);

        } catch (error) {
            gltfPromiseCache.delete(cacheKey); // 실패 시 캐시 제거
            reject(error);
        }
    });

    // ✅ 캐시에 저장
    gltfPromiseCache.set(cacheKey, promise);
    return promise;
}
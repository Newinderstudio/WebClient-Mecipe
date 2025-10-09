"use client"

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type PromiseGroup = Promise<GLTF>;
// ✅ Promise 캐시 - 같은 파일은 한 번만 로드
const gltfPromiseCache = new Map<string, PromiseGroup>();
const gltfCache = new Map<string, GLTF>();

export function promiseForGLTFLoader(path: string, isDraco: boolean, cache:boolean = true): PromiseGroup {
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
    
    const promise = new Promise<GLTF>((resolve, reject) => {

        if(cache && gltfCache.has(cacheKey)) {
            resolve(gltfCache.get(cacheKey)!);
            return;
        }

        const loader = new GLTFLoader();
        if(isDraco) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
            loader.setDRACOLoader(dracoLoader);
        }
        try {
            loader.load(path, (gltf) => {
                if(cache) {
                    gltfCache.set(cacheKey, gltf);
                }
                resolve(gltf);
            }, undefined, (error) => {
                gltfPromiseCache.delete(cacheKey); // 실패 시 캐시 제거
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
    
    // ✅ 캐시에 저장
    gltfPromiseCache.set(cacheKey, promise);
    return promise;
}
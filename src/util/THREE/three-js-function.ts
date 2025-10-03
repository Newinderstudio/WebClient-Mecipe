import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// 씬 그룹을 받아서 머터리얼별로 배치치된 씬 그룹을 반환
export function getBatchedScene(sceneGroup: THREE.Group): THREE.Group {
    const materialMap = new Map<string, { 
        material: THREE.Material, 
        geometries: THREE.BufferGeometry[], 
        maxUvIndex: number,
        instanceCount: number 
    }>();

    // 첫 번째 패스: 머터리얼별로 지오메트리 수집
    sceneGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const mat = child.material;
            const key = Array.isArray(mat) ? mat.map(m => m.uuid).join('-') : mat.uuid;

            if (!materialMap.has(key)) {
                materialMap.set(key, { 
                    material: mat, 
                    geometries: [], 
                    maxUvIndex: 0,
                    instanceCount: 0
                });
            }

            const entry = materialMap.get(key)!;
            entry.instanceCount++;

            // 지오메트리 복제 및 변환
            const geom = child.geometry.clone();
            geom.applyMatrix4(child.matrixWorld);

            // UV 인덱스 확인
            for(let i = 1; i < 10; i++) {
                if (geom.attributes[`uv${i}`]) {
                    entry.maxUvIndex = Math.max(entry.maxUvIndex, i);
                } else {
                    break;
                }
            }

            entry.geometries.push(geom);
        }
    });

    // 두 번째 패스: UV 속성 보완
    materialMap.forEach((entry) => {
        entry.geometries.forEach((geom) => {
            for(let i = 1; i <= entry.maxUvIndex; i++) {
                if (!geom.attributes[`uv${i}`]) {
                    const count = geom.attributes.position.count;
                    const uvArray = new Float32Array(count * 2).fill(0);
                    geom.setAttribute(`uv${i}`, new THREE.BufferAttribute(uvArray, 2));
                }
            }
        });
    });

    const optimizedScene = new THREE.Group();
    let totalBatches = 0;
    let totalInstances = 0;

    // 세 번째 패스: 배치 생성
    materialMap.forEach(({ material, geometries }) => {
        // 너무 많은 지오메트리를 한 번에 병합하지 않도록 청크 단위로 처리
        const chunkSize = 100; // 한 번에 병합할 최대 지오메트리 수
        
        for (let i = 0; i < geometries.length; i += chunkSize) {
            const chunk = geometries.slice(i, i + chunkSize);
            
            if (chunk.length === 0) continue;
            
            const merged = BufferGeometryUtils.mergeGeometries(chunk, true);
            if (!merged) continue;

            // 지오메트리 최적화
            merged.computeBoundingBox();
            merged.computeBoundingSphere();
            
            const mesh = new THREE.Mesh(merged, material);
            mesh.frustumCulled = true; // 프러스텀 컬링 활성화
            mesh.castShadow = false; // 그림자 캐스팅 비활성화
            mesh.receiveShadow = false; // 그림자 수신 비활성화
            
            optimizedScene.add(mesh);
            totalBatches++;
            totalInstances += chunk.length;
        }
    });

    console.log(`[getBatchedScene] Optimization complete: ${totalBatches} batches, ${totalInstances} instances from ${materialMap.size} materials`);
    
    return optimizedScene;
}

export function setDisableReflections(material: THREE.Material | THREE.Material[]): void {
    const materials = Array.isArray(material) ? material : [material];

    materials.forEach((mat) => {
        if (mat instanceof THREE.Material) {
            // Specular 반사광 비활성화
            if ('specular' in mat) {
                mat.specular = new THREE.Color(0x000000);
            }

            // Reflectivity 비활성화
            if ('reflectivity' in mat) {
                mat.reflectivity = 0;
            }

            // Metalness 비활성화 (PBR 머티리얼)
            if ('metalness' in mat) {
                mat.metalness = 0;
            }

            // Roughness 최대화 (반사광 감소)
            if ('roughness' in mat) {
                mat.roughness = 1.0;
            }

            // Environment Map 비활성화
            if ('envMap' in mat) {
                mat.envMap = null;
            }

            // // Environment Map Intensity 비활성화
            // if ('envMapIntensity' in mat) {
            //     mat.envMapIntensity = 0;
            // }

            // Clearcoat 비활성화 (투명 코팅)
            if ('clearcoat' in mat) {
                mat.clearcoat = 0;
            }

            // Clearcoat Roughness 비활성화
            if ('clearcoatRoughness' in mat) {
                mat.clearcoatRoughness = 1.0;
            }

            mat.needsUpdate = true;
        }
    });
}

export function setEnableReflections(material: THREE.Material | THREE.Material[]): void {
    const materials = Array.isArray(material) ? material : [material];

    materials.forEach((mat) => {
        if (mat instanceof THREE.Material) {
            if ('specular' in mat) {
                mat.specular = new THREE.Color(0x111111);
            }

            // Reflectivity 활성화 (기본값)
            if ('reflectivity' in mat) {
                mat.reflectivity = 0.5;
            }

            // Metalness 활성화 (기본값)
            if ('metalness' in mat) {
                mat.metalness = 0.5;
            }

            // Roughness 기본값
            if ('roughness' in mat) {
                mat.roughness = 0.5;
            }

            mat.needsUpdate = true;
        }
    });
}

export type PromiseGroup = Promise<GLTF>;
// ✅ Promise 캐시 - 같은 파일은 한 번만 로드
const gltfPromiseCache = new Map<string, PromiseGroup>();
const gltfCache = new Map<string, GLTF>();

export function promiseForGLTFLoader(path: string, isDraco: boolean, cache:boolean = true): PromiseGroup {
    const cacheKey = `${path}-${isDraco}`;
    
    // ✅ 캐시에 있으면 재사용
    if (gltfPromiseCache.has(cacheKey)) {
        console.log("🟢 [promiseForGLTFLoader] 이미 캐시된 프로미스스 반환", path);
        return gltfPromiseCache.get(cacheKey)!;
    }
    
    console.log("🟡 [promiseForGLTFLoader] 새로 로드 시작", path);
    
    const promise = new Promise<GLTF>((resolve, reject) => {

        if(cache && gltfCache.has(cacheKey)) {
            console.log("⭐ [promiseForGLTFLoader] 캐시에서 GLTF 객체 반환", path);
            resolve(gltfCache.get(cacheKey)!);
        }

        const loader = new GLTFLoader();
        if(isDraco) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
            loader.setDRACOLoader(dracoLoader);
        }
        try {
            loader.load(path, (gltf) => {
                console.log("✅ [promiseForGLTFLoader] 로드 완료!", path);
                if(cache) {
                    gltfCache.set(cacheKey, gltf);
                }
                resolve(gltf);
            }, undefined, (error) => {
                console.error("🔴 [promiseForGLTFLoader] 로드 실패", error);
                gltfPromiseCache.delete(cacheKey); // 실패 시 캐시 제거
                reject(error);
            });
        } catch (error) {
            console.error("🔴 [promiseForGLTFLoader] 로드 실패", error);
            reject(error);
        }
    });
    
    // ✅ 캐시에 저장
    gltfPromiseCache.set(cacheKey, promise);
    return promise;
}

// export function createMeshCollider(mesh: THREE.Mesh): Promise<{ collider: Collider, mesh: THREE.Mesh, type: 'static' } | null> {
//     if (!this.rapierWorld) return null;

//     try {
//         // 메시의 월드 변환을 적용한 지오메트리 생성
//         const geometry = mesh.geometry.clone();
//         geometry.applyMatrix4(mesh.matrixWorld);

//         const position = geometry.getAttribute('position');
//         const index = geometry.getIndex();

//         const vertices = new Float32Array(position.array);
//         const indices = index ? new Uint32Array(index.array) : new Uint32Array(0);

//         // Trimesh 콜라이더 생성
//         const colliderDesc = RAPIER.ColliderDesc
//             .trimesh(vertices, indices)
//             .setCollisionGroups(ColliderGroupType.Default << 16 | ColliderGroupType.Default)
//             .setSolverGroups(ColliderGroupType.Default << 16 | ColliderGroupType.Default);

//     } catch (error) {
//         console.error('Error creating mesh collider:', error);
//         return null;
//     }
// }

import * as THREE from "three";

/**
 * LOD (Level of Detail) 시스템을 위한 유틸리티 함수들
 */

/**
 * 거리에 따라 지오메트리의 복잡도를 조절합니다.
 * @param geometry 원본 지오메트리
 * @param distance 카메라로부터의 거리
 * @param lodLevels LOD 레벨 설정
 * @returns 최적화된 지오메트리
 */
export function createLODGeometry(
    geometry: THREE.BufferGeometry, 
    distance: number, 
    lodLevels: { distance: number; ratio: number }[] = [
        { distance: 50, ratio: 0.8 },
        { distance: 100, ratio: 0.6 },
        { distance: 200, ratio: 0.4 },
        { distance: 500, ratio: 0.2 }
    ]
): THREE.BufferGeometry {
    // 거리에 따른 적절한 LOD 레벨 찾기
    let targetRatio = 1.0;
    for (const level of lodLevels) {
        if (distance <= level.distance) {
            targetRatio = level.ratio;
            break;
        }
    }

    // 원본 복잡도가 충분히 낮으면 그대로 반환
    if (targetRatio >= 1.0 || geometry.attributes.position.count < 100) {
        return geometry;
    }

    // 지오메트리 단순화 (Decimation)
    const simplifiedGeometry = geometry.clone();
    
    // 간단한 버텍스 제거 (더 정교한 알고리즘 필요시 외부 라이브러리 사용)
    const positionAttribute = simplifiedGeometry.attributes.position;
    const vertexCount = Math.floor(positionAttribute.count * targetRatio);
    
    if (vertexCount < positionAttribute.count) {
        // 버텍스 수를 줄임 (간단한 방법)
        const newPositions = new Float32Array(vertexCount * 3);
        const step = Math.floor(positionAttribute.count / vertexCount);
        
        for (let i = 0; i < vertexCount; i++) {
            const sourceIndex = i * step;
            newPositions[i * 3] = positionAttribute.array[sourceIndex * 3];
            newPositions[i * 3 + 1] = positionAttribute.array[sourceIndex * 3 + 1];
            newPositions[i * 3 + 2] = positionAttribute.array[sourceIndex * 3 + 2];
        }
        
        simplifiedGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        simplifiedGeometry.computeVertexNormals();
    }

    return simplifiedGeometry;
}

/**
 * 씬에 LOD 시스템을 적용합니다.
 * @param scene 대상 씬
 * @param camera 카메라 (거리 계산용)
 * @returns 최적화된 씬
 */
export function applyLODSystem(scene: THREE.Group, camera: THREE.Camera): THREE.Group {
    const optimizedScene = scene.clone();
    
    optimizedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const distance = camera.position.distanceTo(child.position);
            
            // 원본 지오메트리를 LOD로 최적화
            const optimizedGeometry = createLODGeometry(child.geometry, distance);
            child.geometry = optimizedGeometry;
            
            // 거리가 매우 멀면 완전히 제거
            if (distance > 1000) {
                child.visible = false;
            }
        }
    });
    
    return optimizedScene;
}

/**
 * 텍스처 해상도를 거리에 따라 조절합니다.
 * @param texture 원본 텍스처
 * @param distance 카메라로부터의 거리
 * @param maxDistance 최대 거리
 * @returns 최적화된 텍스처
 */
export function createLODTexture(
    texture: THREE.Texture, 
    distance: number, 
    maxDistance: number = 200
): THREE.Texture {
    const lodTexture = texture.clone();
    
    // 거리에 따른 텍스처 해상도 조절
    const distanceRatio = Math.min(distance / maxDistance, 1.0);
    const scale = Math.max(0.25, 1.0 - distanceRatio * 0.75); // 25% ~ 100% 해상도
    
    if (scale < 1.0) {
        lodTexture.repeat.setScalar(scale);
        lodTexture.needsUpdate = true;
    }
    
    return lodTexture;
}

/**
 * InstancedMesh를 사용하여 동일한 객체들을 최적화합니다.
 * @param meshes 최적화할 메시들
 * @param maxInstances 인스턴스 최대 개수
 * @returns 최적화된 InstancedMesh
 */
export function createInstancedMesh(
    meshes: THREE.Mesh[], 
    maxInstances: number = 1000
): THREE.InstancedMesh | null {
    if (meshes.length === 0) return null;
    
    const firstMesh = meshes[0];
    const geometry = firstMesh.geometry;
    const material = firstMesh.material;
    
    const instanceCount = Math.min(meshes.length, maxInstances);
    const instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount);
    
    // 인스턴스 매트릭스 설정
    const matrix = new THREE.Matrix4();
    meshes.forEach((mesh, index) => {
        if (index >= instanceCount) return;
        
        mesh.updateMatrix();
        matrix.copy(mesh.matrix);
        instancedMesh.setMatrixAt(index, matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.frustumCulled = true;
    
    return instancedMesh;
}

/**
 * 씬의 전체적인 성능 최적화를 적용합니다.
 * @param scene 최적화할 씬
 * @param camera 카메라
 * @param options 최적화 옵션
 */
export function optimizeScenePerformance(
    scene: THREE.Group,
    camera: THREE.Camera,
    options: {
        enableLOD?: boolean;
        enableInstancing?: boolean;
        maxDrawDistance?: number;
        enableFrustumCulling?: boolean;
    } = {}
): THREE.Group {
    const {
        enableLOD = true,
        enableInstancing = true,
        maxDrawDistance = 1000,
        enableFrustumCulling = true
    } = options;

    const optimizedScene = scene.clone();
    
    // 1. Frustum Culling 설정
    if (enableFrustumCulling) {
        optimizedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.frustumCulled = true;
            }
        });
    }
    
    // 2. 거리 기반 최적화
    optimizedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const distance = camera.position.distanceTo(child.position);
            
            // 최대 거리 체크
            if (distance > maxDrawDistance) {
                child.visible = false;
                return;
            }
            
            // LOD 적용
            if (enableLOD && distance > 50) {
                child.geometry = createLODGeometry(child.geometry, distance);
            }
            
            // 텍스처 최적화
            if (child.material instanceof THREE.MeshBasicMaterial && child.material.map) {
                child.material.map = createLODTexture(child.material.map, distance);
            }
        }
    });
    
    console.log(`[optimizeScenePerformance] Applied optimizations: LOD=${enableLOD}, Instancing=${enableInstancing}, MaxDistance=${maxDrawDistance}`);
    
    return optimizedScene;
}

/**
 * 성능 모니터링을 위한 통계를 수집합니다.
 * @param scene 모니터링할 씬
 * @returns 성능 통계
 */
export function getPerformanceStats(scene: THREE.Group): {
    totalMeshes: number;
    totalVertices: number;
    totalFaces: number;
    totalMaterials: number;
    memoryUsage: number;
} {
    let totalMeshes = 0;
    let totalVertices = 0;
    let totalFaces = 0;
    const materials = new Set<THREE.Material>();
    let memoryUsage = 0;

    scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            totalMeshes++;
            
            const geometry = child.geometry;
            const positionAttribute = geometry.attributes.position;
            
            if (positionAttribute) {
                totalVertices += positionAttribute.count;
            }
            
            const index = geometry.index;
            if (index) {
                totalFaces += index.count / 3;
            } else {
                totalFaces += positionAttribute.count / 3;
            }
            
            // 메모리 사용량 추정
            if (positionAttribute) {
                memoryUsage += positionAttribute.array.byteLength;
            }
            
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => materials.add(mat));
            } else {
                materials.add(child.material);
            }
        }
    });

    return {
        totalMeshes,
        totalVertices,
        totalFaces,
        totalMaterials: materials.size,
        memoryUsage
    };
}

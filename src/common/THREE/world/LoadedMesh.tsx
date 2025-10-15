import { getSimpleBatchedSceneGroupByMaterial, setDisableReflections, setEnableReflections } from "@/util/THREE/three-js-function";
import { optimizeScenePerformance, getPerformanceStats } from "@/util/THREE/performance-optimization";
import { useMemo, useRef } from "react";
import { Material, Mesh, Object3D } from "three";
import { useFrame, useThree } from "@react-three/fiber";


export interface LoadedMeshProps {
    scene: Object3D;
    isBatching: boolean;
    isVisible: boolean;
    enableShadows: boolean;
    disableReflections: boolean;
    enablePerformanceOptimization?: boolean;
}
function LoadedMesh({ scene, isBatching, isVisible, enableShadows, disableReflections, enablePerformanceOptimization = true }: LoadedMeshProps) {
    const { camera } = useThree();
    const cameraRef = useRef(camera);
    cameraRef.current = camera;  // 항상 최신 camera 유지
    
    const performanceStatsRef = useRef<{
        totalMeshes: number;
        totalVertices: number;
        totalFaces: number;
        totalMaterials: number;
        memoryUsage: number;
    } | null>(null);

    const renderScene = useMemo(() => {
        let targetScene = scene;
        
        // 배치 처리 (변환된 머터리얼로)
        targetScene = isBatching ? getSimpleBatchedSceneGroupByMaterial(scene) : scene;
        
        // 성능 최적화 적용
        if (enablePerformanceOptimization) {
            targetScene = optimizeScenePerformance(targetScene, cameraRef.current, {
                enableLOD: true,
                enableInstancing: false, // 배치와 충돌 방지
                maxDrawDistance: 1000,
                enableFrustumCulling: true
            });
        }
        
        const meaterials = new Set<Material>();
        
        // 머터리얼 수집 및 최적화 설정
        targetScene.traverse((node) => {  // children.forEach 대신 traverse 사용
            node.receiveShadow = node.castShadow = enableShadows;
            if (node instanceof Mesh && node.material) {
                meaterials.add(node.material);
                
                // 추가 성능 최적화 설정
                node.frustumCulled = true;
                node.castShadow = false; // 그림자 성능 저하 방지
                node.receiveShadow = false;
            }
        });

        if (disableReflections) setDisableReflections(Array.from(meaterials));
        else setEnableReflections(Array.from(meaterials));

        // 성능 통계 수집
        performanceStatsRef.current = getPerformanceStats(targetScene);

        return targetScene;
    }, [scene, isBatching, enablePerformanceOptimization, enableShadows, disableReflections])

    // 성능 모니터링 (개발 모드에서만)
    useFrame(() => {
        if (process.env.NODE_ENV === 'development' && performanceStatsRef.current) {
            // 필요시 실시간 성능 모니터링 로직 추가
        }
    });

    return <group visible={isVisible}>
        <primitive object={renderScene} />
    </group>
}

export default LoadedMesh;
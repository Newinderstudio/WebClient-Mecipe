import { getBatchedScene, setDisableReflections, setEnableReflections } from "@/util/THREE/three-js-function";
import { convertSceneMaterialsToPhong } from "@/util/THREE/phong-material-function";
import { optimizeScenePerformance, getPerformanceStats } from "@/util/THREE/performance-optimization";
import { useMemo, useRef } from "react";
import { Group, Material, Mesh } from "three";
import { useFrame, useThree } from "@react-three/fiber";


function LoadedMesh({ scene, isBatching, isVisible, enableShadows, disableReflections, usePhongMaterial = false, enablePerformanceOptimization = true }: {
    scene: Group;
    isBatching: boolean;
    isVisible: boolean;
    enableShadows: boolean;
    disableReflections: boolean;
    usePhongMaterial?: boolean;
    enablePerformanceOptimization?: boolean;
}) {
    const { camera } = useThree();
    const performanceStatsRef = useRef<{
        totalMeshes: number;
        totalVertices: number;
        totalFaces: number;
        totalMaterials: number;
        memoryUsage: number;
    } | null>(null);

    const renderScene = useMemo(() => {
        let targetScene = scene;
        
        // PhongMaterial로 변환하는 경우 - 배치 처리 전에 변환
        if (usePhongMaterial) {
            console.log('[LoadedMesh] Converting materials to PhongMaterial before batching');
            const phongMaterials = convertSceneMaterialsToPhong(scene);
            console.log('[LoadedMesh] Converted materials:', phongMaterials.length);
        }
        
        // 배치 처리 (변환된 머터리얼로)
        targetScene = isBatching ? getBatchedScene(scene) : scene;
        
        // 성능 최적화 적용
        if (enablePerformanceOptimization) {
            console.log('[LoadedMesh] Applying performance optimizations');
            targetScene = optimizeScenePerformance(targetScene, camera, {
                enableLOD: true,
                enableInstancing: false, // 배치와 충돌 방지
                maxDrawDistance: 1000,
                enableFrustumCulling: true
            });
        }
        
        const meaterials = new Set<Material>();
        
        // 머터리얼 수집 및 최적화 설정
        targetScene.children.forEach((node) => {
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
        
        console.log('[LoadedMesh] Performance stats:', performanceStatsRef.current);
        console.log('[LoadedMesh] renderScene children length:', targetScene.children.length);
        console.log('[LoadedMesh] Materials count:', meaterials.size);

        return targetScene;
    }, [scene, enableShadows, disableReflections, isBatching, usePhongMaterial, enablePerformanceOptimization, camera])

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
import { Environment, Sky } from "@react-three/drei";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";
import LoadedCollider from "./LoadedCollider";
import useWorldRenderer from "./hooks/useWorldRenderer";
import LoadedMesh from "./LoadedMesh";
import React from "react";
import { Group } from "three";

export interface WorldRendererResult {
    options: WorldRendererProps;
    rendererScene: Group;
    rendererColliderScene: Group;
}

function WorldRenderer({ children, promiseForRendererOptions }: { children: React.ReactNode, promiseForRendererOptions: Promise<WorldRendererResult>}) {

    const { options, rendererScene, rendererColliderScene } = useWorldRenderer({ promiseForRendererOptions});

    return (
        <group>
            {/* 기본 조명 추가 - PhongMaterial이 제대로 렌더링되려면 필요 */}
            <ambientLight intensity={1} />
            <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                castShadow={false}
            />
            <pointLight 
                position={[-10, -10, -5]} 
                intensity={0.5}
            />
            
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <Sky />
            <group
                position={options.position}
                rotation={options.rotation}
                scale={options.scale}
            >
                <LoadedCollider scene={rendererColliderScene} isBatching={true} /> :
                <LoadedMesh 
                    scene={rendererScene} 
                    isBatching={true} 
                    isVisible={true} 
                    enableShadows={false} 
                    disableReflections={false}
                    usePhongMaterial={false}  // 성능을 위해 PhongMaterial 비활성화
                    enablePerformanceOptimization={true}  // 성능 최적화 활성화
                />
                
            </group>
            {children}
        </group>

    )
}

export default WorldRenderer;
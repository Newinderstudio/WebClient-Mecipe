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

function WorldRenderer({ children, rendererProps }: { children: React.ReactNode, rendererProps?: WorldRendererProps}) {

    const { options, rendererScene, rendererColliderScene } = useWorldRenderer({ rendererProps});

    return (
        <group>
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
                    isBatching={false} 
                    isVisible={true} 
                    enableShadows={false} 
                    disableReflections={true}
                    usePhongMaterial={false}  // 성능을 위해 PhongMaterial 비활성화
                    enablePerformanceOptimization={false}  // 성능 최적화 활성화
                />
                
            </group>
            {children}
        </group>

    )
}

export default WorldRenderer;
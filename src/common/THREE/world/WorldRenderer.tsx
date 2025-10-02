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
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <Sky />
            <group
                position={options.position}
                rotation={options.rotation}
                scale={options.scale}
            >
                <LoadedCollider scene={rendererColliderScene} isBatching={true} /> :
                <LoadedMesh scene={rendererScene} isBatching={true} isVisible={true} enableShadows={true} disableReflections={false} />
                
            </group>
            {children}
        </group>

    )
}

export default WorldRenderer;
import { Environment, Sky } from "@react-three/drei";
import { WorldGltfOptions } from "@/feature/TRHEE/virtual/components/hooks/useVirtualWorld";
import LoadedCollider from "./LoadedCollider";
import useWorldRenderer from "./hooks/useWorldRenderer";
import LoadedMesh from "./LoadedMesh";
import React, { Suspense } from "react";
import SuspendRenerer from "./SuspendRenerer";
import PlayersManager, { ControllerOptions, PlayersManagerOptions } from "../core/PlayersManager";


export interface WorldRendererProps {
    rendererProps: WorldGltfOptions;
    encrypted: boolean;
    characterOptions: PlayersManagerOptions;
    controllerOptions: ControllerOptions;
}

function WorldRenderer({ rendererProps, encrypted, characterOptions, controllerOptions }: WorldRendererProps) {

    const hookMemeber = useWorldRenderer({ rendererProps, encrypted });

    return (
        <group>
            <Environment preset="sunset" />
            <Sky />
            <group
                position={rendererProps.position}
                rotation={rendererProps.rotation}
                scale={rendererProps.scale}
            >
                <Suspense fallback={null}>
                    <SuspendRenerer promise={hookMemeber.promiseForColliderRenderer} Component={LoadedCollider} />
                    <PlayersManager characterOptions={characterOptions} controllerOptions={controllerOptions} />
                </Suspense>
                <Suspense fallback={null}>
                    <SuspendRenerer promise={hookMemeber.promiseForMeshRenderer} Component={LoadedMesh} />
                </Suspense>


            </group>
        </group>

    )
}

export default WorldRenderer;
import { RigidBody } from "@react-three/rapier";
import AdvancedGltfLoader from "./AdvancedGltfLoader";
import { useCallback } from "react";
import { Environment } from "@react-three/drei";

export interface WorldRendererProps {
    worldGltfOptions: {
        path: string;
        isDraco: boolean;
    }
    colliderGltfOptions?: {
        path: string;
        isDraco: boolean;
    }
}

const WorldRenderer = (props: WorldRendererProps) => {
    const { worldGltfOptions, colliderGltfOptions } = props;

    const VisibleGltfLoader = useCallback(() => {
        return <AdvancedGltfLoader
            gltfPath={worldGltfOptions.path}
            options={{
                isBatching: true,
                isDraco: worldGltfOptions.isDraco,
                isVisible: true,
                enableShadows: true,
                disableReflections: true,
            }}
        />
    }, [worldGltfOptions]);

    const ColliderGltfLoader = useCallback(() => {
        if (!colliderGltfOptions) return null;
        return <AdvancedGltfLoader
            gltfPath={colliderGltfOptions.path}
            options={{
                isBatching: true,
                isDraco: colliderGltfOptions.isDraco,
                isVisible: false,
                enableShadows: false,
                disableReflections: true,
            }}
        />
    }, [colliderGltfOptions]);


    return (
        <group>
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <RigidBody type="fixed" colliders={false} >
                {<ColliderGltfLoader /> ?? <VisibleGltfLoader />}
            </RigidBody>
            <VisibleGltfLoader />
        </group>

    )
}

export default WorldRenderer;
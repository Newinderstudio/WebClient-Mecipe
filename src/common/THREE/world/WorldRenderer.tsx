import { MeshCollider } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import { JSX, useMemo } from "react";

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

function WorldRenderer({ visibleRenderer, colliderRenderer }: { visibleRenderer: JSX.Element, colliderRenderer?: JSX.Element }) {

    const collider = useMemo(() => {
        if (!colliderRenderer) return <MeshCollider type="trimesh">{visibleRenderer}</MeshCollider>
        return colliderRenderer;
    }, [colliderRenderer,visibleRenderer]);

    return (
        <group>
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <group visible={false}>
                {collider}
            </group>
            {visibleRenderer}
        </group>

    )
}

export default WorldRenderer;
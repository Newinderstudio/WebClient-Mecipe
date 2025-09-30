import { MeshCollider, RigidBody } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import { JSX } from "react";

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

function WorldRenderer({ visibleRenderer: VisibleRenderer, colliderRenderer: ColliderRenderer }: { visibleRenderer: JSX.Element, colliderRenderer?: JSX.Element }) {

    const Collider = ColliderRenderer ? ColliderRenderer : VisibleRenderer;

    return (
        <group>
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <RigidBody type="fixed" colliders="trimesh">
                {/* {Collider} */}
                <group visible={false}>

                    <MeshCollider type="trimesh">{Collider}</MeshCollider>

                </group>

            </RigidBody>
            {VisibleRenderer}
        </group>

    )
}

export default WorldRenderer;
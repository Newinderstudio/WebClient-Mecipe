import { RigidBody } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import useWorldRenderer from "./hooks/useWorldRenderer";

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
    const { VisibleGltfLoader, ColliderGltfLoader } = useWorldRenderer(props);
    
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
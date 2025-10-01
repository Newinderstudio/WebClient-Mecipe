import { Environment, Sky } from "@react-three/drei";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";
import LoadedCollider from "./LoadedCollider";
import useWorldRenderer from "./hooks/useWorldRenderer";
import LoadedMesh from "./LoadedMesh";

function WorldRenderer({ children, rendererOptions }: { children: React.ReactNode, rendererOptions?: WorldRendererProps}) {

    const { option, rendererScene, rendererColliderScene } = useWorldRenderer({ rendererOptions});

    console.warn("WorldRenderer", rendererOptions);

    return (
        <group>
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <Sky />
            <group
                position={option.position}
                rotation={option.rotation}
                scale={option.scale}
            >
                <LoadedCollider scene={rendererColliderScene} isBatching={true} /> :
                <LoadedMesh scene={rendererScene} isBatching={true} isVisible={true} enableShadows={true} disableReflections={false} />
                
            </group>
            {children}
        </group>

    )
}

export default WorldRenderer;
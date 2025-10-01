import { Environment, Sky } from "@react-three/drei";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";
import useWorldRenderer from "./hooks/useWorldRenderer";
import AdvancedGltfLoader from "./AdvancedGltfLoader";

function WorldRenderer({ rendererOptions }: { rendererOptions: WorldRendererProps }) {

    const { visibleRendererOptions, colliderRendererOptions } = useWorldRenderer({ rendererOptions });

    return (
        <group>
            {/* <Sky sunPosition={[100, 20, 100]} /> */}
            <Environment preset="sunset" />
            <Sky />
            <AdvancedGltfLoader {...visibleRendererOptions} />
            <AdvancedGltfLoader {...colliderRendererOptions} />
        </group>

    )
}

export default WorldRenderer;
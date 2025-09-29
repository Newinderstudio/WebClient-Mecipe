import { Vector3, Euler } from "three";
import LoadedMesh from "./LoadedMesh";
import useAdvancedGltfLoader from "./hooks/useAdvancedGltfLoader";

export interface AdvancedGltfLoaderOptions {
    position: Vector3
    rotation: Euler;
    scale: Vector3;

    isBatching: boolean;
    isVisible: boolean;

    disableReflections: boolean;
    enableShadows: boolean;

    onLoad: () => void;
}

export interface AdvancedGltfLoaderProps {
    gltfPath: string;
    isDraco: boolean;
    options?: Partial<AdvancedGltfLoaderOptions>;
    onLoad: () => void;
}

function AdvancedGltfLoader({ gltfPath, isDraco, options, onLoad }: AdvancedGltfLoaderProps) {

    const { gltf } = useAdvancedGltfLoader({ gltfPath, isDraco, onLoad });
    return (
        <group
            position={options?.position ?? new Vector3()}
            rotation={options?.rotation ?? new Euler()}
            scale={options?.scale ?? new Vector3(1, 1, 1)}
        >
            {gltf.scene && <LoadedMesh
                scene={gltf.scene}
                isBatching={options?.isBatching ?? false}
                isVisible={options?.isVisible === undefined ? true : options?.isVisible}
                enableShadows={options?.enableShadows ?? true}
                disableReflections={options?.disableReflections ?? false}
            />}
        </group>
    );
}

export default AdvancedGltfLoader;
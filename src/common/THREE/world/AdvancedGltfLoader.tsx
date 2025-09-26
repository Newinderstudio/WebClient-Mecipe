import { useGLTF } from "@react-three/drei";
import { Vector3, Euler } from "three";
import LoadedMesh from "./LoadedMesh";

export interface AdvancedGltfLoaderOptions {
    position: Vector3
    rotation: Euler;
    scale: Vector3;

    isBatching: boolean;
    isDraco: boolean;
    isVisible: boolean;

    disableReflections: boolean;
    enableShadows: boolean;
}

export interface AdvancedGltfLoaderProps {
    gltfPath: string;
    options?: Partial<AdvancedGltfLoaderOptions>;
}


const AdvancedGltfLoader = ({ gltfPath, options }: AdvancedGltfLoaderProps) => {
    const gltf = useGLTF(gltfPath, options?.isDraco);
    return (
        <group
            position={options?.position ?? new Vector3()}
            rotation={options?.rotation ?? new Euler()}
            scale={options?.scale ?? new Vector3(1, 1, 1)}
        >
            {gltf.scene && (
                <LoadedMesh
                    scene={gltf.scene}
                    isBatching={options?.isBatching ?? false}
                    isVisible={options?.isVisible === undefined ? true : options?.isVisible}
                    enableShadows={options?.enableShadows ?? true}
                    disableReflections={options?.disableReflections ?? false}
                />
            )}
        </group>
    );
};

export default AdvancedGltfLoader;
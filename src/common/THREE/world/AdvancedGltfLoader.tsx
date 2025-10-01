import { Vector3, Euler } from "three";
import useAdvancedGltfLoader from "./hooks/useAdvancedGltfLoader";
import LoadedCollider from "./LoadedCollider";
import LoadedMesh from "./LoadedMesh";

export interface AdvancedGltfLoaderOptions {
    position: Vector3
    rotation: Euler;
    scale: Vector3;

    isBatching: boolean;
    isVisible?: boolean;

    disableReflections?: boolean;
    enableShadows?: boolean;
}

export interface AdvancedGltfLoaderProps {
    gltfPath: string;
    isDraco: boolean;
    isCollider?: boolean;
    options?: Partial<AdvancedGltfLoaderOptions>;
    
    requiredId?: string;
}

function AdvancedGltfLoader({ gltfPath, isDraco, isCollider, options, requiredId }: AdvancedGltfLoaderProps) {

    const { rendererScene } = useAdvancedGltfLoader({ gltfPath, isDraco, requiredId });

    // useGLTF는 Suspense를 지원하므로, rendererScene이 없으면 자동으로 suspend됨
    // 따라서 여기서 rendererScene은 항상 존재함
    
    return (
        <group
            position={options?.position}
            rotation={options?.rotation}
            scale={options?.scale}
        >
            {
                isCollider ? <LoadedCollider scene={rendererScene} isBatching={options?.isBatching ?? false} /> : 
                <LoadedMesh scene={rendererScene} isBatching={options?.isBatching ?? false} isVisible={options?.isVisible ?? true} enableShadows={options?.enableShadows ?? true} disableReflections={options?.disableReflections ?? false} />

            }
        </group>
    );
}

export default AdvancedGltfLoader;
import { Vector3, Euler } from "three";
import useAdvancedGltfLoader from "./hooks/useAdvancedGltfLoader";
import LoadedCollider from "./LoadedCollider";
import LoadedMesh from "./LoadedMesh";
import { useRef } from "react";

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
    children?: React.ReactNode;
    gltfPath: string;
    isDraco: boolean;
    isCollider?: boolean;
    options?: Partial<AdvancedGltfLoaderOptions>;
}

function AdvancedGltfLoader({ children, gltfPath, isDraco, isCollider, options }: AdvancedGltfLoaderProps) {
    const renderCount = useRef(0);
    console.log(`🟡 [AdvancedGltfLoader:${isCollider ? 'collider' : 'visible'}] 렌더링`, renderCount.current++);

    const { rendererScene } = useAdvancedGltfLoader({ gltfPath, isDraco });

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
            {children}
        </group>
    );
}

export default AdvancedGltfLoader;
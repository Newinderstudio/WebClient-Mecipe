import { Vector3, Euler } from "three";
import useAdvancedGltfLoader from "./hooks/useAdvancedGltfLoader";
import { useMemo } from "react";

export interface AdvancedGltfLoaderOptions {
    position: Vector3
    rotation: Euler;
    scale: Vector3;

    isBatching: boolean;
    isVisible?: boolean;

    disableReflections?: boolean;
    enableShadows?: boolean;

    onLoad: () => void;
}

export interface AdvancedGltfLoaderProps {
    gltfPath: string;
    isDraco: boolean;
    isCollider?: boolean;
    options?: Partial<AdvancedGltfLoaderOptions>;
    onLoad: () => void;
}

function AdvancedGltfLoader({ gltfPath, isDraco, isCollider, options, onLoad }: AdvancedGltfLoaderProps) {

    const { targetRenderer } = useAdvancedGltfLoader({ gltfPath, isDraco, isCollider: isCollider ?? false, options, onLoad });
    
    // 기본 값들을 메모이제이션
    const defaultPosition = useMemo(() => new Vector3(), []);
    const defaultRotation = useMemo(() => new Euler(), []);
    const defaultScale = useMemo(() => new Vector3(1, 1, 1), []);
    
    return (
        <group
            position={options?.position ?? defaultPosition}
            rotation={options?.rotation ?? defaultRotation}
            scale={options?.scale ?? defaultScale}
        >
            {targetRenderer}
        </group>
    );
}

export default AdvancedGltfLoader;
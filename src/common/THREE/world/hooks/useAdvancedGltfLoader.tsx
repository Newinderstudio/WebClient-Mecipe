import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import LoadedCollider from "../LoadedCollider";
import LoadedMesh from "../LoadedMesh";

export default function useAdvancedGltfLoader({ gltfPath, isDraco, isCollider, options, onLoad }: {
    gltfPath: string, isDraco: boolean, isCollider: boolean,
    options?: {
        isBatching?: boolean;
        isVisible?: boolean;

        disableReflections?: boolean;
        enableShadows?: boolean;
    }, onLoad: () => void
}) {
    const gltf = useGLTF(gltfPath, isDraco);

    useEffect(() => {
        if (gltf.scene) {
            onLoad();
        }
    }, [gltf.scene, onLoad]);

    // JSX를 직접 useMemo로 캐싱
    const targetRenderer = useMemo(() => {
        if (!gltf.scene) return null;
        
        if (isCollider === true) {
            return <LoadedCollider 
                scene={gltf.scene} 
                isBatching={options?.isBatching ?? false} 
            />;
        }
        
        return <LoadedMesh
            scene={gltf.scene}
            isBatching={options?.isBatching ?? false}
            isVisible={options?.isVisible ?? true}
            enableShadows={options?.enableShadows ?? true}
            disableReflections={options?.disableReflections ?? false}
        />;
    }, [gltf.scene, isCollider, options]);

    return { targetRenderer };
}
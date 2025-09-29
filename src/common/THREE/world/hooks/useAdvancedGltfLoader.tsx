import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function useAdvancedGltfLoader({ gltfPath, isDraco, onLoad }: { gltfPath: string, isDraco: boolean, onLoad: () => void }) {
    const gltf = useGLTF(gltfPath, isDraco);

    useEffect(() => {
        if (gltf.scene) {
            onLoad();
        }
    }, [gltf.scene, onLoad]);

    return { gltf };
}
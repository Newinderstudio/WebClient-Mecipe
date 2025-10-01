import { useGLTF } from "@react-three/drei";

export default function useAdvancedGltfLoader({ gltfPath, isDraco }: {
    gltfPath: string, isDraco: boolean,
}) {
    const gltf = useGLTF(gltfPath, isDraco);

    return { rendererScene: gltf.scene };
}
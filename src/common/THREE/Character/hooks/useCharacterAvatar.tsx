import { useGLTF } from "@react-three/drei";

export default function useCharacterAvatar({ 
    gltfPath,
    isDraco,
}: {
    gltfPath: string;
    isDraco: boolean;
}) {

    const gltf = useGLTF(gltfPath, isDraco);

    return {
        gltf,
    }
}
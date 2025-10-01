import { useThreeDispatchContext } from "@/store/THREE/store";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function useAdvancedGltfLoader({ gltfPath, isDraco, requiredId }: {
    gltfPath: string, isDraco: boolean,
    requiredId?: string
}) {
    const gltf = useGLTF(gltfPath, isDraco);
    const dispatch = useThreeDispatchContext();

    useEffect(() => {
        if (gltf.scene && dispatch && requiredId) {
            dispatch({ type: "SetRenderingState", payload: { [requiredId]: true } });
        }
    }, [gltf.scene, dispatch, requiredId]);

    return { rendererScene: gltf.scene };
}
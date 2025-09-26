import { useCallback } from "react";
import AdvancedGltfLoader from "../AdvancedGltfLoader";

export default function useWorldRenderer(props: { worldGltfOptions: { path: string; isDraco: boolean; }, colliderGltfOptions?: { path: string; isDraco: boolean; } }) {
    const { worldGltfOptions, colliderGltfOptions } = props;

    const VisibleGltfLoader = useCallback(() => {
        return <AdvancedGltfLoader
            gltfPath={worldGltfOptions.path}
            options={{
                isBatching: true,
                isDraco: worldGltfOptions.isDraco,
                isVisible: true,
                enableShadows: true,
                disableReflections: true,
            }}
        />
    }, [worldGltfOptions]);

    const ColliderGltfLoader = useCallback(() => {
        if (!colliderGltfOptions) return null;
        return <AdvancedGltfLoader
            gltfPath={colliderGltfOptions.path}
            options={{
                isBatching: true,
                isDraco: colliderGltfOptions.isDraco,
                isVisible: false,
                enableShadows: false,
                disableReflections: true,
            }}
        />
    }, [colliderGltfOptions]);

    return {
        VisibleGltfLoader,
        ColliderGltfLoader,
    }
}
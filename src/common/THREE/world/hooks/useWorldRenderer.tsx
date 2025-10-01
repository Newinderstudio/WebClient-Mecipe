import { useEffect, useMemo } from "react";
import { AdvancedGltfLoaderProps } from "../AdvancedGltfLoader";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";

export default function useWorldRenderer({ rendererOptions }: { rendererOptions: WorldRendererProps }) {

    const visibleRendererOptions: AdvancedGltfLoaderProps = useMemo(() => {

        console.log("visibleRenderer", rendererOptions.worldGltfOptions);
        return (
            {
                gltfPath: rendererOptions.worldGltfOptions.path,
                isDraco: rendererOptions.worldGltfOptions.isDraco,
                requiredId: "visibleRenderer",
                options: {
                    isBatching: true,
                }
            }
        )
    }, [rendererOptions.worldGltfOptions]);

    const colliderRendererOptions: AdvancedGltfLoaderProps = useMemo(() => {
        console.log("colliderRenderer", rendererOptions.colliderGltfOptions);
        return {
            gltfPath: rendererOptions.colliderGltfOptions.path,
            isDraco: rendererOptions.colliderGltfOptions.isDraco,
            requiredId: "colliderRenderer",
            isCollider: true,
            options: {
                isBatching: true,
            }
        }
    }, [rendererOptions.colliderGltfOptions]);

useEffect(() => {
    console.log("--useVisibleOptions", rendererOptions.worldGltfOptions);
    console.log("--useColliderOptions", rendererOptions.colliderGltfOptions);
}, [rendererOptions.worldGltfOptions, rendererOptions.colliderGltfOptions]);

return { visibleRendererOptions, colliderRendererOptions };
}
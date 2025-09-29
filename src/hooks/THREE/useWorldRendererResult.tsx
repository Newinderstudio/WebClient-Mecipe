import AdvancedGltfLoader from "@/common/THREE/world/AdvancedGltfLoader";
import WorldRenderer, { WorldRendererProps } from "@/common/THREE/world/WorldRenderer";
import { useCallback, useState } from "react";

export default function useWorldRendererResult(props: WorldRendererProps) {

    const { worldGltfOptions, colliderGltfOptions } = props;

    const [visibleLoaded, setVisibleLoaded] = useState(false);
    const [colliderLoaded, setColliderLoaded] = useState(colliderGltfOptions ? false : true);

    const renderer = useCallback(() => {
        return <WorldRenderer
            visibleRenderer={
                <AdvancedGltfLoader
                    gltfPath={worldGltfOptions.path}
                    isDraco={worldGltfOptions.isDraco}
                    onLoad={() => setVisibleLoaded(true)}
                    options={{
                        isBatching: true,
                        isVisible: true,
                        enableShadows: false,
                        disableReflections: true,
                    }}
                />
            }
            colliderRenderer={colliderGltfOptions ?
                <AdvancedGltfLoader
                    gltfPath={colliderGltfOptions.path}
                    isDraco={colliderGltfOptions.isDraco}
                    onLoad={() => setColliderLoaded(true)}
                    options={{
                        isBatching: true,
                        isVisible: true,
                        enableShadows: false,
                        disableReflections: true,
                    }}
                /> : undefined
            }
        />
    }, [worldGltfOptions, colliderGltfOptions]);

    return {
        renderer, isLoaded: visibleLoaded && colliderLoaded
    }
}
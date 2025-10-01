import AdvancedGltfLoader from "@/common/THREE/world/AdvancedGltfLoader";
import WorldRenderer, { WorldRendererProps } from "@/common/THREE/world/WorldRenderer";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useWorldRendererResult(props: WorldRendererProps) {

    const { worldGltfOptions, colliderGltfOptions } = props;

    const [visibleLoaded, setVisibleLoaded] = useState(false);
    const [colliderLoaded, setColliderLoaded] = useState(colliderGltfOptions ? false : true);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if(visibleLoaded && colliderLoaded) {
            setIsLoaded(true);
        }
    }, [visibleLoaded, colliderLoaded]);

    // onLoad 콜백을 안정화
    const handleVisibleLoad = useCallback(() => {
        setVisibleLoaded(true);
    }, []);

    const handleColliderLoad = useCallback(() => {
        setColliderLoaded(true);
    }, []);

    // 옵션 객체들을 메모이제이션
    const visibleOptions = useMemo(() => ({
        isBatching: true,
        isVisible: true,
        enableShadows: false,
        disableReflections: true,
    }), []);

    const colliderOptions = useMemo(() => ({
        isBatching: true,
    }), []);

    // JSX를 useMemo로 캐싱
    const renderer = useMemo(() => {
        return <WorldRenderer
            visibleRenderer={
                <AdvancedGltfLoader
                    gltfPath={worldGltfOptions.path}
                    isDraco={worldGltfOptions.isDraco}
                    onLoad={handleVisibleLoad}
                    options={visibleOptions}
                />
            }
            colliderRenderer={colliderGltfOptions ?
                <AdvancedGltfLoader
                    isCollider={true}
                    gltfPath={colliderGltfOptions.path}
                    isDraco={colliderGltfOptions.isDraco}
                    onLoad={handleColliderLoad}
                    options={colliderOptions}
                /> : undefined
            }
        />
    }, [worldGltfOptions.path, worldGltfOptions.isDraco, colliderGltfOptions, handleVisibleLoad, handleColliderLoad, visibleOptions, colliderOptions]);

    return {
        renderer, isLoaded
    }
}
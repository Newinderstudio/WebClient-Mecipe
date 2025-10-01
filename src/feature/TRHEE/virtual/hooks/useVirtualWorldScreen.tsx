import { useThreeStateContext } from '@/store/THREE/store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';

export interface WorldRendererProps {
    worldGltfOptions: {
        path: string;
        isDraco: boolean;
    }
    colliderGltfOptions: {
        path: string;
        isDraco: boolean;
    }
}

export default function useVirtualWorldScreen() {
    const { gravity, renderingState } = useThreeStateContext();

    // 옵션 객체를 메모이제이션하여 불필요한 리렌더링 방지
    const [rendererOptions, setRendererOptions] = useState<WorldRendererProps | undefined>(undefined);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 서버에서 렌더러 옵션을 가져오는 로직 (나중에 API 호출로 대체)
        const fetchRendererOptions = async () => {
            try {
                setIsLoadingOptions(true);
                
                // TODO: 실제로는 서버 API 호출
                // const response = await fetch('/api/world-config');
                // const data = await response.json();
                
                // 임시: 하드코딩된 옵션
                const options: WorldRendererProps = {
                    worldGltfOptions: {
                        path: "/3d/test_virtual_world/virtual_world.glb",
                        isDraco: true,
                    },
                    colliderGltfOptions: {
                        path: "/3d/test_virtual_world/virtual_world_collider.glb",
                        isDraco: true,
                    }
                };
                
                setRendererOptions(options);
            } catch (error) {
                console.error('Failed to load renderer options:', error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchRendererOptions();
    }, []);

    useEffect(() => {
        if (renderingState.visibleRenderer && renderingState.colliderRenderer) {
            setIsLoaded(true);
        }
    }, [renderingState.visibleRenderer, renderingState.colliderRenderer]);

    const keyBoardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "reset", keys: ["r", "R"] },
    ], []);

    // CharacterOptions를 메모이제이션하여 불필요한 리렌더링 방지
    const characterOptions = useMemo(() => ({
        height: 1,
        radius: 0.2,
        spawnPoint: new Vector3(0, 10, 0),
        playerJumpForce: 4,
        playerSpeed: 10,
    }), []);

    // gravity 배열도 메모이제이션
    const gravityArray = useMemo(() => gravity.toArray(), [gravity]);

    const loadingScreen = useMemo(() => {
        console.log("loadingScreen");
        return (
            <group>

            </group>
        );
    }, []);

    const renderingCount = useRef(0);
    
    console.warn("VirtualWorldScreen ReRendering", renderingState, renderingCount.current++);

    return {
        rendererOptions,
        isLoadingOptions,
        isLoaded,
        keyBoardMap,

        gravity,
        characterOptions,
        gravityArray,
        loadingScreen,
    }
}
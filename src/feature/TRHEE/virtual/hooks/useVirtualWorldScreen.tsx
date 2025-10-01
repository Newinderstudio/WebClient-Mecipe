import { useThreeStore } from '@/store/THREE/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Euler, Vector3 } from 'three';

export interface WorldRendererProps {
    worldGltfOptions: {
        path: string;
        isDraco: boolean;
    }
    colliderGltfOptions: {
        path: string;
        isDraco: boolean;
    },
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
}

export default function useVirtualWorldScreen() {
    // ✅ Zustand selector 패턴 - 필요한 값만 선택적으로 구독
    const gravity = useThreeStore(state => state.gravity);

    // 옵션 객체를 메모이제이션하여 불필요한 리렌더링 방지
    const [rendererOptions, setRendererOptions] = useState<WorldRendererProps | undefined>(undefined);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

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
                    },
                    position: new Vector3(0, 0, 0),
                    rotation: new Euler(0, 0, 0),
                    scale: new Vector3(1, 1, 1),
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

    const loadingScreen = useCallback(({msg}:{msg:string}) => {
        console.log("loadingScreen", msg);
        return (
            <group>

            </group>
        );
    }, []);

    useEffect(() => {
        console.log("🛑 Test Renderer Options&IsLoadingOptions", rendererOptions,isLoadingOptions);
    }, [rendererOptions,isLoadingOptions]);

    const renderingCount = useRef(0);
    
    console.warn("VirtualWorldScreen ReRendering", { rendererOptions, isLoadingOptions }, renderingCount.current++);

    return {
        rendererOptions,
        isLoadingOptions,
        keyBoardMap,

        gravity,
        characterOptions,
        gravityArray,
        loadingScreen,
    }
}
import { WorldRendererResult } from '@/common/THREE/world/WorldRenderer';
import { useThreeStore } from '@/store/THREE/store';
import { promiseForGLTFLoader } from '@/util/THREE/three-js-function';
import { useCallback, useMemo, useState } from 'react';
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
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

    const fetchRendererOptions = useCallback(async () => {
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
                position: new Vector3(0, -10, 0),
                rotation: new Euler(0, 0, 0),
                scale: new Vector3(1, 1, 1),
            };
            
            return options;
        } catch (error) {
            console.error('Failed to load renderer options:', error);
        } finally {
            setIsLoadingOptions(false);
        }
    }, []);

    const promiseForRendererOptions = useMemo(() => {
        if(!fetchRendererOptions) {
            return new Promise<WorldRendererResult>((resolve, reject) => {
                reject("fetchRendererOptions is not defined");
            });
        }
        return new Promise<WorldRendererResult>(async (resolve, reject) => {
            try {
                const options = await fetchRendererOptions();
                if (!options) {
                    reject("options is not defined");
                    return;
                }
                const rendererScene = await promiseForGLTFLoader(options.worldGltfOptions.path, options.worldGltfOptions.isDraco);
                const rendererColliderScene = await promiseForGLTFLoader(options.colliderGltfOptions.path, options.colliderGltfOptions.isDraco);
                resolve({ options, rendererScene: rendererScene.scene, rendererColliderScene: rendererColliderScene.scene });
            } catch (error) {
                reject(error);
            }

        });
    }, [fetchRendererOptions]);

    const keyBoardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "reset", keys: ["r", "R"] },
        { name: "special", keys: ["e", "E"] },
    ], []);

    // CharacterOptions를 메모이제이션하여 불필요한 리렌더링 방지
    const characterOptions = useMemo(() => ({
        height: 1,
        radius: 0.2,
        spawnPoint: new Vector3(0, 10, 0),
        playerJumpForce: 2,
        playerSpeed: 6,
        scale: new Vector3(0.8, 0.8, 0.8),
        rotation: new Euler(0, 0, 0),
        rotationSpeed: 0.2,
        defaultAnimationClip: "Idle"
    }), []);

    // gravity 배열도 메모이제이션
    const gravityArray = useMemo(() => gravity.toArray(), [gravity]);

    return {
        promiseForRendererOptions,
        isLoadingOptions,
        keyBoardMap,

        gravity,
        characterOptions,
        gravityArray,
    }
}
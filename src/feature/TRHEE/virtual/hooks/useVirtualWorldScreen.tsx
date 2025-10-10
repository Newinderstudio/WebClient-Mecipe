import { CharacterManagerOptions } from '@/common/THREE/character/WorldPlayer';
import { useThreeStore } from '@/store/THREE/store';
import { useEffect, useMemo, useState } from 'react';
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

    const [rendererProps, setRendererProps] = useState<WorldRendererProps | undefined>(undefined);

    // 비동기 맵 다운로드 실행 예제
    useEffect(()=>{
        const fetchRendererProps = async () => {
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
            setRendererProps(options);
            setIsLoadingOptions(false);
        }
        fetchRendererProps();
    }, []);

    const keyBoardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "reset", keys: ["r", "R"] },
        { name: "test", keys: ["t", "T"] },
    ], []);

    // CharacterOptions를 메모이제이션하여 불필요한 리렌더링 방지
    const characterOptions: CharacterManagerOptions = useMemo(() => ({
        height: 1.3,
        radius: 0.2,
        spawnPoint: new Vector3(0, 5, 5),
        playerJumpForce: 2,
        playerSpeed: 6,
        scale: new Vector3(0.8, 0.8, 0.8),
        rotation: new Euler(0, 0, 0),
        rotationSpeed: 0.2,
        defaultAnimationClip: "Idle"
    }), []);

    const controllerOptions = useMemo(() => ({
        offset: 0.01,
        mass: 3,
        slopeClimbAngle: Math.PI / 4,
        slopeSlideAngle: Math.PI / 4,
    }), []);

    // gravity 배열도 메모이제이션
    const gravityArray = useMemo(() => gravity.toArray(), [gravity]);

    return {
        rendererProps,
        isLoadingOptions,
        keyBoardMap,

        gravity,
        characterOptions,
        gravityArray,
        controllerOptions,
    }
}
import { useThreeStore } from '@/store/THREE/store';
import { useMemo } from 'react';
import { Euler, Vector3 } from 'three';
import { useFindOneMetaViewerInfoByCodeQuery } from '@/api/metaViewerInfosApi';
import { ControllerOptions, PlayersManagerOptions } from '@/common/THREE/core/PlayersManager';
import { WorldRendererProps } from '@/common/THREE/world/WorldRenderer';

/**
 * @description: 하위 컴포넌트 리렌더링 방지를 위해 다수의의 훅 멤버 메모이제이션
 */
export interface WorldGltfOptions {
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

export default function useVirtualWorld(worldCode: string) {
    // ✅ Zustand selector 패턴 - 필요한 값만 선택적으로 구독
    const gravity = useThreeStore(state => state.gravity);

    const { data: worldData } = useFindOneMetaViewerInfoByCodeQuery({ code: worldCode });

    const gltfOptions:WorldGltfOptions | undefined = useMemo(() => {
        if(!worldData) return undefined;
        const worldPosition = worldData.worldData.worldPosition as { x: number; y: number; z: number };
        const worldRotation = worldData.worldData.worldRotation as { x: number; y: number; z: number };
        const worldScale = worldData.worldData.worldScale as { x: number; y: number; z: number };
        return {
            worldGltfOptions: {
                path: worldData.ActiveMaps.ActiveRenderMap.url,
                isDraco: worldData.ActiveMaps.ActiveRenderMap.isDraco,
            },
            colliderGltfOptions: {
                path: worldData.ActiveMaps.ActiveColliderMap.url,
                isDraco: worldData.ActiveMaps.ActiveColliderMap.isDraco,
            },
            position: worldPosition? new Vector3(worldPosition.x, worldPosition.y, worldPosition.z) : new Vector3(0, 0, 0),
            rotation: worldRotation? new Euler(worldRotation.x, worldRotation.y, worldRotation.z) : new Euler(0, 0, 0),
            scale: worldScale? new Vector3(worldScale.x, worldScale.y, worldScale.z) : new Vector3(1, 1, 1),
        };
    }, [worldData]);

    const characterOptions:PlayersManagerOptions | undefined = useMemo(() => {
        if(!worldData) return undefined;
        const playerHeight = worldData.worldData.playerHeight as number;
        const playerRadius = worldData.worldData.playerRadius as number;
        const playerScale = worldData.worldData.playerScale as { x: number; y: number; z: number };
        const playerRotation = worldData.worldData.playerRotation as { x: number; y: number; z: number };
        const playerRotationSpeed = worldData.worldData.playerRotationSpeed as number;
        const defaultAnimationClip = worldData.worldData.defaultAnimationClip as string;
        const playerJumpForce = worldData.worldData.playerJumpForce as number;
        const playerSpeed = worldData.worldData.playerSpeed as number;
        const spawnPoint = worldData.worldData.spawnPoint as { x: number; y: number; z: number };
        return {
            height: playerHeight? playerHeight : 1.3,
            radius: playerRadius? playerRadius : 0.2,
            spawnPoint: spawnPoint? new Vector3(spawnPoint.x, spawnPoint.y, spawnPoint.z) : new Vector3(0, 5, 5),
            playerJumpForce: playerJumpForce? playerJumpForce : 2,
            playerSpeed: playerSpeed? playerSpeed : 6,
            scale: playerScale? new Vector3(playerScale.x, playerScale.y, playerScale.z) : new Vector3(0.8, 0.8, 0.8),
            rotation: playerRotation? new Euler(playerRotation.x, playerRotation.y, playerRotation.z) : new Euler(0, 0, 0),
            rotationSpeed: playerRotationSpeed? playerRotationSpeed : 0.2,
            defaultAnimationClip: defaultAnimationClip? defaultAnimationClip : "Idle"
        };
    }, [worldData]);

    const keyBoardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "reset", keys: ["r", "R"] },
        { name: "test", keys: ["t", "T"] },
    ], []);

    const controllerOptions:ControllerOptions = useMemo(() => ({
        offset: 0.01,
        mass: 3,
        slopeClimbAngle: Math.PI / 4,
        slopeSlideAngle: Math.PI / 4,
    }), []);

    // gravity 배열도 메모이제이션
    const gravityArray = useMemo(() => gravity.toArray(), [gravity]);

    const worldRenderProps:WorldRendererProps | undefined = useMemo(() => {
        if(!gltfOptions || !characterOptions || !controllerOptions) return undefined;
        return {
            rendererProps: gltfOptions,
            characterOptions,
            controllerOptions,
            encrypted: true,
        }
    }, [characterOptions, controllerOptions, gltfOptions]);

    return {
        gltfOptions,
        keyBoardMap,

        gravity,
        characterOptions,
        gravityArray,
        controllerOptions,
        worldRenderProps,
    }
}
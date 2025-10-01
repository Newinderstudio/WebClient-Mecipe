import useWorldRendererResult from '@/hooks/THREE/useWorldRendererResult';
import { useThreeStateContext } from '@/store/THREE/store';
import { useMemo } from 'react';

export default function useVirtualWorldScreen() {
    const {gravity} = useThreeStateContext();

    // 옵션 객체를 메모이제이션하여 불필요한 리렌더링 방지
    const rendererOptions = useMemo(() => ({
        worldGltfOptions: {
            path: "/3d/test_virtual_world/virtual_world.glb",
            isDraco: true,
        },
        colliderGltfOptions: {
            path: "/3d/test_virtual_world/virtual_world_collider.glb",
            isDraco: true,
        }
    }), []);

    const { renderer: World, isLoaded: isWorldLoaded } = useWorldRendererResult(rendererOptions);

    const keyBoardMap = useMemo(() => [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "reset", keys: ["r", "R"] },
    ], []);

    return {
        World,
        isWorldLoaded,
        keyBoardMap,

        gravity
    }
}
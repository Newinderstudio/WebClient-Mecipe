import useWorldRendererResult from '@/hooks/THREE/useWorldRendererResult';
import { useMemo } from 'react';

export default function useVirtualWorldScreen() {
    const worldGltfPath = "/3d/test_virtual_world/virtual_world.glb";
    const colliderGltfPath = "/3d/test_virtual_world/virtual_world_collider.glb";

    const worldGltfIsDraco = true;
    const colliderGltfIsDraco = true;

    const { renderer: World, isLoaded: isWorldLoaded } = useWorldRendererResult({
        worldGltfOptions: {
            path: worldGltfPath,
            isDraco: worldGltfIsDraco,
        },
        colliderGltfOptions: {
            path: colliderGltfPath,
            isDraco: colliderGltfIsDraco,
        }
    });

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
        keyBoardMap
    }
}
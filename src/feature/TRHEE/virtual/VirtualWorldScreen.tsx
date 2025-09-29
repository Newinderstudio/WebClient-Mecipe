"use client"

import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'

import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import CharacterAvatar from '@/common/THREE/Character/CharacterAvatar';
import { KeyboardController } from '@/common/THREE/Character/controllers';
import useWorldRendererResult from '@/hooks/THREE/useWorldRendererResult';

export default function TestThreeScreen() {

    const worldGltfPath = "/3d/test_virtual_world/virtual_world.glb";
    const colliderGltfPath = "/3d/test_virtual_world/virtual_world_collider.glb";

    const worldGltfIsDraco = true;
    const colliderGltfIsDraco = true;

    const characterGltfPath = "/3d/test_virtual_world/character.glb";
    const characterGltfIsDraco = true;
    const characterController = new KeyboardController();

    const { renderer: WorldRenderer, isLoaded: isWorldLoaded } = useWorldRendererResult({
        worldGltfOptions: {
            path: worldGltfPath,
            isDraco: worldGltfIsDraco,
        },
        colliderGltfOptions: {
            path: colliderGltfPath,
            isDraco: colliderGltfIsDraco,
        }
    });

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
            }}
        >
            <Canvas camera={{ fov: 45 }}>
                <Physics timeStep="vary" gravity={[0, -10, 0]}>
                    <Suspense fallback={null}>
                        {WorldRenderer && <WorldRenderer />}
                    </Suspense>
                    {isWorldLoaded &&
                        <group>
                            <CharacterAvatar
                                gltfPath={characterGltfPath}
                                isDraco={characterGltfIsDraco}
                                controller={characterController}
                            />
                        </group>
                    }
                </Physics>
                <PointerLockControls />
            </Canvas>

        </div>
    )
}
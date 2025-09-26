"use client"

import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'

import { Physics } from '@react-three/rapier';
import WorldRenderer from "@/common/THREE/world/WorldRenderer";
import { Suspense } from 'react';

export default function TestThreeScreen() {

    const worldGltfPath = "/3d/test_virtual_world/virtual_world.glb";
    const colliderGltfPath = "/3d/test_virtual_world/virtual_world_collider.glb";

    const worldGltfIsDraco = true;
    const colliderGltfIsDraco = true;

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
            }}
        >
            <Canvas camera={{ fov: 45 }}>
                <Physics gravity={[0, -30, 0]}>
                    <Suspense fallback={null}>
                        <WorldRenderer
                            worldGltfOptions={{
                                path: worldGltfPath,
                                isDraco: worldGltfIsDraco,
                            }}
                            colliderGltfOptions={{
                                path: colliderGltfPath,
                                isDraco: colliderGltfIsDraco,
                            }}
                        />
                    </Suspense>

                </Physics>
                <PointerLockControls />
            </Canvas>

        </div>
    )
}
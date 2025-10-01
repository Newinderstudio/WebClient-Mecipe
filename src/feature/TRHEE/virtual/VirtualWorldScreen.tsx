"use client"

import { Canvas } from '@react-three/fiber'
import { Capsule, KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Suspense, useMemo } from 'react';

import { Physics } from '@react-three/rapier';
import CharacterManager from '@/common/THREE/core/CharacterManager';
import useVirtualWorldScreen from './hooks/useVirtualWorldScreen';
import GameControlManager from '@/common/THREE/core/GameControlManager';
import { Vector3 } from 'three';

export default function VirtualWorldScreen() {

    const { World, isWorldLoaded, keyBoardMap, gravity } = useVirtualWorldScreen();

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

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
            }}
        >
            <KeyboardControls
                map={keyBoardMap}
            >
                <Canvas camera={{ fov: 45 }}>
                    <GameControlManager />
                    <Physics timeStep={1.0 / 60.0} gravity={gravityArray}>

                        {
                            <>
                                <Suspense fallback={null}>
                                    {World}
                                </Suspense>
                                {isWorldLoaded && <CharacterManager characterOptions={characterOptions} />}
                            </>
                        }
                        <Capsule args={[0.3, 1]} position={[-3, 3, 0]} />
                    </Physics>
                    <PointerLockControls />
                </Canvas>
            </KeyboardControls>

        </div>
    )
}
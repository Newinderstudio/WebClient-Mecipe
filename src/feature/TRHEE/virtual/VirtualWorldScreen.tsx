"use client"

import { Canvas } from '@react-three/fiber'
import { Capsule, KeyboardControls, PointerLockControls } from '@react-three/drei'
import { Suspense } from 'react';

import { Physics } from '@react-three/rapier';
import CharacterManager from '@/common/THREE/core/CharacterManager';
import useVirtualWorldScreen from './hooks/useVirtualWorldScreen';
import GameControlManager from '@/common/THREE/core/GameControlManager';
import WorldRenderer from '@/common/THREE/world/WorldRenderer';

export default function VirtualWorldScreen() {

    const { 
        rendererOptions, 
        isLoadingOptions,
        isLoaded: isWorldLoaded, 
        keyBoardMap, 
        characterOptions, 
        gravityArray, 
        loadingScreen 
    } = useVirtualWorldScreen();

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
                        <Suspense fallback={loadingScreen}>
                            {/* 옵션 로딩 중이거나 옵션이 없으면 fallback 표시 */}
                            {!isLoadingOptions && rendererOptions ? (
                                <>
                                    <WorldRenderer
                                        rendererOptions={rendererOptions}
                                    />
                                    {isWorldLoaded && <CharacterManager characterOptions={characterOptions} />}
                                </>
                            ) : (
                                loadingScreen
                            )}
                        </Suspense>
                        <Capsule args={[0.3, 1]} position={[-3, 3, 0]} />
                    </Physics>
                    <PointerLockControls />
                </Canvas>
            </KeyboardControls>

        </div>
    )
}
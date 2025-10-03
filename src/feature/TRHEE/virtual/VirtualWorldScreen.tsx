"use client"

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react';

import { Physics } from '@react-three/rapier';
import CharacterManager from '@/common/THREE/core/CharacterManager';
import useVirtualWorldScreen from './hooks/useVirtualWorldScreen';
import GameControlManager from '@/common/THREE/core/GameControlManager';
import WorldRenderer from '@/common/THREE/world/WorldRenderer';
import TPSCameraController from '@/common/THREE/camera/TPSCameraController';

export default function VirtualWorldScreen() {

    const {
        promiseForRendererOptions,
        keyBoardMap,
        characterOptions,
        gravityArray,
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
                <Canvas 
                    camera={{ fov: 45 }}
                    dpr={[1, 2]} // 디스플레이 픽셀 비율 제한
                    performance={{ min: 0.5 }} // 성능 모니터링
                    gl={{
                        antialias: false, // 안티앨리어싱 비활성화
                        alpha: false, // 알파 채널 비활성화
                        powerPreference: "high-performance", // 고성능 GPU 우선
                        stencil: false, // 스텐실 버퍼 비활성화
                        depth: true, // 깊이 버퍼만 활성화
                    }}
                >
                    <GameControlManager />
                    <Physics 
                        timeStep={1.0 / 60.0}  // 더 높은 정확도
                        gravity={gravityArray}
                    >
                        <Suspense fallback={null}>
                            {/* 옵션 로딩 중이거나 옵션이 없으면 fallback 표시 */}
                            <WorldRenderer
                                promiseForRendererOptions={promiseForRendererOptions}
                            >
                                <CharacterManager characterOptions={characterOptions} />
                            </WorldRenderer>
                        </Suspense>
                        <TPSCameraController />
                    </Physics>
                </Canvas>
            </KeyboardControls>

        </div>
    )
}
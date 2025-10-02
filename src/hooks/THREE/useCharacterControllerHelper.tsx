import { IController } from "@/common/THREE/character/controllers";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterManagerOptions } from "@/common/THREE/core/CharacterManager";
import { useThreeStore } from "@/store/THREE/store";
import { RapierCollider } from "@react-three/rapier/dist/declarations/src/types";
import { Vector3 } from "three";
import CharacterWrapper from "@/common/THREE/character/CharacterWrapper";
import { World } from "@dimforge/rapier3d-compat";
import { useKeyboardControls } from "@react-three/drei";

export default function useCharacterControllerHelper<T>({
    controller,
    options,
    gltfPath,
    isDraco,
    moveProps,
    rapierWorld
}: {
    controller: IController<T>;
    options: CharacterManagerOptions;
    gltfPath: string;
    isDraco: boolean;
    moveProps: T;
}) {

    const threeState = useThree();

    const colliderRef = useRef<RapierCollider>(null);

    const [, getKeyboardState] = useKeyboardControls();

    // ✅ Zustand selector 패턴

    const position = useRef<Vector3>(options.spawnPoint);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [characterController, setCharacterController] = useState<any>(null);

    // 컨트롤러 초기화
    useEffect(() => {
        if (controller && threeState && options) {
            controller.initialize(threeState, options);
            return () => controller.dispose();
        }
    }, [controller, threeState, options]);

    // CharacterController 생성
    useEffect(() => {
        if (!rapier.world) {
            console.log('Waiting for rapier.world...');
            return;
        }

        try {
            console.log('Creating CharacterController', rapier.world);
            const charCtrl = rapier.world.createCharacterController(0.01);

            if (!charCtrl) {
                console.error('Failed to create CharacterController');
                return;
            }

            charCtrl.setApplyImpulsesToDynamicBodies(true);
            charCtrl.setCharacterMass(3);

            // 계단 오르기 설정
            charCtrl.setMaxSlopeClimbAngle(Math.PI / 4); // 45도
            charCtrl.setMinSlopeSlideAngle(Math.PI / 4); // 45도

            // snap to ground 설정
            charCtrl.enableSnapToGround(0.5);
            charCtrl.enableAutostep(0.5, 0.2, true);

            console.log('CharacterController created successfully');
            setCharacterController(charCtrl);

            // Cleanup
            return () => {
                console.log('Removing CharacterController');
                if (rapier.world) {
                    rapier.world.removeCharacterController(charCtrl);
                }
                setCharacterController(null);
            };
        } catch (error) {
            console.error('Error creating CharacterController:', error);
        }
    }, [rapier.world]);

    // 컨트롤러 업데이트
    useFrame((state, delta) => {
        // 모든 필수 요소가 준비될 때까지 기다림
        if (!controller || !controller.isEnabled()) return;
        if (!colliderRef.current) return;
        if (!rapier.world) return;
        if (!characterController) return;

        try {

        } catch (error) {
            console.error('Error in character controller update:', error);
        }
    });

    const renderer = useCallback(() => {
        if (!options) return null;

        return (
            <CharacterWrapper
                options={options}
                colliderRef={colliderRef}
                position={position.current}
                gltfPath={gltfPath}
                isDraco={isDraco}
            />
        )
    }, [options, colliderRef, position, gltfPath, isDraco]); // colliderRef는 ref이므로 의존성에서 제거

    return {
        renderer,
    }
}
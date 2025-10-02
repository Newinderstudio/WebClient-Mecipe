import { IController } from "@/common/THREE/character/controllers";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, CapsuleColliderProps, useRapier } from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterManagerOptions } from "@/common/THREE/core/CharacterManager";
import { useThreeStore } from "@/store/THREE/store";
import { RapierCollider } from "@react-three/rapier/dist/declarations/src/types";
import { Capsule } from "@react-three/drei";

export default function useCharacterControllerHelper<T>({
    controller,
    options,
    moveProps,
}: {
    controller: IController<T>;
    options: CharacterManagerOptions;
    moveProps: T;
}) {

    const threeState = useThree();
    
    const colliderRef = useRef<RapierCollider>(null);

    // ✅ Zustand selector 패턴
    const gravity = useThreeStore(state => state.gravity);
    const rapier = useRapier();
    
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
            const movementInput = controller.getMovementInput(colliderRef, moveProps);

            // 중력 및 델타 타임 적용
            const movement = movementInput.direction.clone().add(gravity).multiplyScalar(delta);

            // CharacterController로 충돌 계산
            characterController.computeColliderMovement(
                colliderRef.current, 
                movement,
                undefined, // filterFlags
                colliderGroup(ColliderGroupType.Player, ColliderGroupType.Default) // filterGroups
            );

            // 보정된 이동량 가져오기
            const correctedMovement = characterController.computedMovement();
            
            // 실제 collider 위치 업데이트
            const currentPos = colliderRef.current.translation();
            const newPos = {
                x: currentPos.x + correctedMovement.x,
                y: currentPos.y + correctedMovement.y,
                z: currentPos.z + correctedMovement.z
            };
            colliderRef.current.setTranslation(newPos);

            // 카메라 위치 업데이트
            state.camera.position.set(newPos.x, newPos.y, newPos.z);
        } catch (error) {
            console.error('Error in character controller update:', error);
        }
    });

    const renderer = useCallback(({ children }: { children: React.ReactNode }) => {
        if (!options) return null;

        const capsuleColliderProps: CapsuleColliderProps = {
            args: [options.height / 2 - options.radius, options.radius],
            collisionGroups: colliderGroup(ColliderGroupType.Player, ColliderGroupType.Default),
        };
        return (
            <CapsuleCollider {...capsuleColliderProps} ref={colliderRef} position={options.spawnPoint}>
                {children}
                <Capsule args={[options.height / 2 - options.radius, options.radius]} />
            </CapsuleCollider>
        )
    }, [options]); // colliderRef는 ref이므로 의존성에서 제거

    return {
        renderer,
    }
}
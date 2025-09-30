import { IController } from "@/common/THREE/character/controllers";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, CapsuleColliderProps, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { CharacterManagerOptions } from "@/common/THREE/core/CharacterManager";

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

    const ref = useRef<RapierRigidBody>(null);

    // 컨트롤러 초기화
    useEffect(() => {
        if (controller && threeState && options) {
            controller.initialize(threeState, options);
            return () => controller.dispose();
        }
    }, [controller, threeState, options]);

    // 컨트롤러 업데이트
    useFrame((state) => {
        if (!controller || !controller.isEnabled() || !ref.current || !ref.current) return;

        const movementInput = controller.getMovementInput(ref, moveProps);

        const curPos = ref.current.translation();
        state.camera.position.set(curPos.x, curPos.y, curPos.z);

        // 이동 처리
        ref.current.setLinvel(movementInput.direction, true);
    });

    const renderer = useCallback(({ children }: { children: React.ReactNode }) => {
        if(!options) return null;

        const capsuleColliderProps: CapsuleColliderProps = {
            args: [options.height / 2 - options.radius, options.radius],
            collisionGroups: colliderGroup(ColliderGroupType.Player, ColliderGroupType.Player),
        };
        return (
            <RigidBody type="dynamic" ref={ref} mass={1} density={0.001} colliders={false} position={new Vector3(0, 10, 0)} enabledRotations={[false, false, false]} collisionGroups={colliderGroup(ColliderGroupType.Player, ColliderGroupType.Player)}>
                <CapsuleCollider {...capsuleColliderProps} />
                {children}
            </RigidBody>
        )
    }, [ref, options]);

    useEffect(() => {
        console.log(renderer);
    }, [renderer]);

    return {
        renderer,
    }
}
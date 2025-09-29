import { useGLTF } from "@react-three/drei";
import { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { IController } from "../controllers/IController";
import { Vector3 } from "three";

export default function useCharacterAvatar({ 
    gltfPath,
    isDraco,
    controller,
}: {
    gltfPath: string;
    isDraco: boolean;
    controller?: IController;
}) {

    const ref = useRef<RapierRigidBody>(null);

    const gltf = useGLTF(gltfPath, isDraco);

    // 컨트롤러 초기화
    useEffect(() => {
        if (controller) {
            controller.initialize();
            return () => controller.dispose();
        }
    }, [controller]);

    useFrame((state) => {
        if (!controller || !controller.isEnabled() || !ref.current) return;

        const movementInput = controller.getMovementInput();

        const curPos = ref.current.translation();
        state.camera.position.set(curPos.x, curPos.y, curPos.z);
        
        // 이동 처리
        if (movementInput.direction.length() > 0) {
            const speed = movementInput.run ? 10 : 5;
            const velocity = movementInput.direction.clone().multiplyScalar(speed);
            
            // Y축 속도는 유지 (중력 영향)
            const currentVelocity = ref.current.linvel();
            velocity.y = currentVelocity.y;
            velocity.applyEuler(state.camera.rotation)
            ref.current.setLinvel(velocity, true);
        }

        // 점프 처리
        if (movementInput.jump) {
            const currentVelocity = ref.current.linvel();
            if (Math.abs(currentVelocity.y) < 0.1) { // 지면에 있을 때만 점프
                ref.current.setLinvel(
                    new Vector3(currentVelocity.x, 8, currentVelocity.z),
                    true
                );
            }
        }
    });

    return {
        gltf,
        ref,
    }
}
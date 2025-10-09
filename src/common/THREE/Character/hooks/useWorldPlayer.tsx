import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { Vector3 } from "@dimforge/rapier3d-compat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CapsuleColliderProps, useRapier } from "@react-three/rapier";
import { WorldPlayerProps } from "../WorldPlayer";
import { KinematicCharacterController, Collider } from "@react-three/rapier/node_modules/@dimforge/rapier3d-compat";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useThreeStore } from "@/store/THREE/store";
import useWorldPlayerAnimation from "./useWorldPlayerAnimation";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js"

export default function useWorldPlayer<T>({ gltf, isLocal, controllerOptions, bodyOptions, collisionGroup, controllerRef }: WorldPlayerProps<T>) {
    const rapier = useRapier();

    const ctrlOpt = useMemo(() => ({
        offset: 0.01,
        mass: 3,
        slopeClimbAngle: Math.PI / 4,
        slopeSlideAngle: Math.PI / 4,
        ...controllerOptions
    }), [controllerOptions]);

    const bodyOpt = useMemo(() => ({
        height: 1,
        radius: 0.2,
        spawnPoint: new Vector3(0, 1.8, 0),
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: new Vector3(1, 1, 1),
        playerJumpForce: 10,
        playerSpeed: 6,
        ...bodyOptions
    }), [bodyOptions]);

    const colGroup = useMemo(() => ({
        collisionGroup: ColliderGroupType.Player,
        collisionMask: ColliderGroupType.Default,
        ...collisionGroup
    }), [collisionGroup]);

    const clone = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene])
    const { playAnimator, updateAnimator } = useWorldPlayerAnimation({ animations: gltf.animations, scene: clone, defaultAnimationClipName: bodyOptions?.defaultAnimationClip || "Idle" });

    const setHeadSocket = useThreeStore(state => state.setHeadSocket);

    // 점프 상태 관리
    const [isJumped, setIsJumped] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpStartTime, setJumpStartTime] = useState(0);

    const playerBodyRef = useRef<THREE.Group | null>(null);
    const characterControllerRef = useRef<KinematicCharacterController | null>(null);
    const colliderRef = useRef<Collider | null>(null);
    const headSocketRef = useRef<THREE.Group | null>(null);

    const headSocketProps = useMemo(() => (
        {
            position: new THREE.Vector3(0, bodyOpt.height - bodyOpt.radius, 0),
        }
    ), [bodyOpt]);

    const capsuleColliderProps: CapsuleColliderProps = useMemo(() => ({
        args: [bodyOpt.height / 2 - bodyOpt.radius, bodyOpt.radius],
        collisionGroups: colliderGroup(colGroup.collisionGroup, colGroup.collisionMask),
    }), [bodyOpt, colGroup]);

    useEffect(() => {
        if (!headSocketRef.current || !isLocal) return;
        setHeadSocket(headSocketRef.current);
    }, [isLocal, setHeadSocket]);

    useEffect(() => {
        if (rapier.world && !characterControllerRef.current) {
            try {
                const characterController = rapier.world.createCharacterController(ctrlOpt.offset);
                characterController.setCharacterMass(ctrlOpt.mass);
                characterController.setMaxSlopeClimbAngle(ctrlOpt.slopeClimbAngle);
                characterController.setMinSlopeSlideAngle(ctrlOpt.slopeSlideAngle);

                characterControllerRef.current = characterController;
            } catch (error) {
                console.error('Error creating CharacterController:', error);
            }
        }

        return () => {
            if (characterControllerRef.current && rapier.world) {
                rapier.world.removeCharacterController(characterControllerRef.current);
                characterControllerRef.current = null;
                console.log("characterController remove");
            }
        };
    }, [ctrlOpt, rapier.world]);

    const startJump = useCallback(() => {
        if (!isJumped) setIsJumped(true);
        if (!isJumping) setIsJumping(true);
        setJumpStartTime(Date.now());
    }, [isJumped, isJumping, setJumpStartTime]);

    useFrame((_, delta) => {
        if (!characterControllerRef.current || !rapier.world || !colliderRef.current || !controllerRef.current || !bodyOpt || !playerBodyRef.current) return;
        try {
            const pos = colliderRef.current.translation();
            const rot = playerBodyRef.current.rotation;
            const { direction, rotation, jump } = controllerRef.current.getMovementInput(new THREE.Vector3(pos.x, pos.y, pos.z), rot);

            const currentTime = Date.now();

            if (isJumped) {
                setIsJumped(false);
            }

            const movement = direction.clone().multiplyScalar(bodyOpt.playerSpeed);

            const rawGravity = rapier.world.gravity;
            const gravity = new THREE.Vector3(rawGravity.x, rawGravity.y, rawGravity.z);

            if (Math.abs(movement.x) > 0.1 || Math.abs(movement.z) > 0.1) {
                playAnimator("Walk");
            } else {
                playAnimator("Idle");
            }

            updateAnimator(delta);

            const isGrounded = characterControllerRef.current.computedGrounded();
            let tempIsJumping = isJumping
            let tempJumpStartTime = jumpStartTime;
            if (isGrounded) {
                if (jump) {
                    startJump();
                    tempIsJumping = true;
                    tempJumpStartTime = currentTime;
                } else {
                    if (isJumping) setIsJumping(false);
                }

            } else {
                movement.add(gravity);
            }

            if (tempIsJumping) {
                const jumpDuration = currentTime - tempJumpStartTime;

                const jumpDecay = Math.max(0, 1 - Math.pow(jumpDuration / 1000, 2)) * 8;
                if (jumpDuration < 1000) {
                    movement.add(new Vector3(0, bodyOpt.playerJumpForce * jumpDecay, 0));
                }
            }

            movement.multiplyScalar(delta);

            characterControllerRef.current.computeColliderMovement(
                colliderRef.current,
                movement,
                undefined,
                colliderGroup(colGroup.collisionGroup, colGroup.collisionMask)
            );

            const correctedMovement = characterControllerRef.current.computedMovement();
            const currentPos = colliderRef.current.translation();
            let newPos = new Vector3(
                currentPos.x + correctedMovement.x,
                currentPos.y + correctedMovement.y,
                currentPos.z + correctedMovement.z
            );

            colliderRef.current.setTranslation(newPos);

            newPos.y -= bodyOpt.height / 2;
            newPos = new THREE.Vector3(
                THREE.MathUtils.lerp(playerBodyRef.current.position.x, newPos.x, 0.2),
                THREE.MathUtils.lerp(playerBodyRef.current.position.y, newPos.y, 0.2),
                THREE.MathUtils.lerp(playerBodyRef.current.position.z, newPos.z, 0.2)
            );
            playerBodyRef.current.position.set(newPos.x, newPos.y, newPos.z);
            if (rotation) playerBodyRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
        } catch (error) {
            console.error('Error in moveDirection:', error);
        }
    });

    return {
        playerBodyRef,
        characterControllerRef,
        colliderRef,
        headSocketRef,
        headSocketProps,
        capsuleColliderProps,
        clonedNodes: clone,
    }



}
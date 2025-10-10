import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { Vector3 } from "@dimforge/rapier3d-compat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CapsuleColliderProps, useRapier } from "@react-three/rapier";
import { CharacterManagerOptions, WorldPlayerProps } from "../WorldPlayer";
import { KinematicCharacterController, Collider } from "@react-three/rapier/node_modules/@dimforge/rapier3d-compat";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useThreeStore } from "@/store/THREE/store";
import useWorldPlayerAnimation from "./useWorldPlayerAnimation";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js"
import { PlayerControlInterface } from "../controllers/IController";

export default function useWorldPlayer<T>({ gltf, isLocal, controllerOptions, characterOptions, collisionGroup, controllerRef }: WorldPlayerProps<T>) {
    const rapier = useRapier();

    const ctrlOpt = useMemo(() => ({
        offset: 0.01,
        mass: 3,
        slopeClimbAngle: Math.PI / 4,
        slopeSlideAngle: Math.PI / 4,
        ...controllerOptions
    }), [controllerOptions]);

    const characterOpt: CharacterManagerOptions = useMemo(() => ({
        height: 1,
        radius: 0.2,
        spawnPoint: new THREE.Vector3(0, 1.8, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        playerJumpForce: 10,
        playerSpeed: 6,
        rotationSpeed: 0.2,
        defaultAnimationClip: "Idle",
        ...characterOptions
    }), [characterOptions]);

    const colGroup = useMemo(() => ({
        collisionGroup: ColliderGroupType.Player,
        collisionMask: ColliderGroupType.Default,
        ...collisionGroup
    }), [collisionGroup]);

    const clone = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene])
    const { playAnimator, updateAnimator } = useWorldPlayerAnimation({ animations: gltf.animations, scene: clone, defaultAnimationClipName: characterOpt?.defaultAnimationClip || "Idle" });

    const setHeadSocket = useThreeStore(state => state.setHeadSocket);

    // 점프 상태 관리
    const [isJumped, setIsJumped] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpStartTime, setJumpStartTime] = useState(0);

    const playerBodyRef = useRef<THREE.Group | null>(null);
    const characterControllerRef = useRef<KinematicCharacterController | null>(null);
    const colliderRef = useRef<Collider | null>(null);
    const headSocketRef = useRef<THREE.Group | null>(null);

    const playerControl: PlayerControlInterface = useMemo(() => ({
        setPosition: (position: THREE.Vector3) => {
            colliderRef.current?.setTranslation(position);
        },
        setRotation: (rotation: THREE.Euler) => {
            playerBodyRef.current?.rotation.set(rotation.x, rotation.y, rotation.z);
        },
        getPosition: () => {const pos = colliderRef.current?.translation();  return pos? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3(0, 0, 0)},
        getRotation: () => playerBodyRef.current?.rotation ?? new THREE.Euler(0, 0, 0),
    }), [playerBodyRef, colliderRef]);

    const headSocketProps = useMemo(() => (
        {
            position: new THREE.Vector3(0, characterOpt.height - characterOpt.radius, 0),
        }
    ), [characterOpt]);

    const capsuleColliderProps: CapsuleColliderProps = useMemo(() => ({
        args: [characterOpt.height / 2 - characterOpt.radius, characterOpt.radius],
        collisionGroups: colliderGroup(colGroup.collisionGroup, colGroup.collisionMask),
    }), [characterOpt, colGroup]);

    useEffect(() => {
        if (!headSocketRef.current || !isLocal) return;
        setHeadSocket(headSocketRef.current);
    }, [isLocal, setHeadSocket]);

    useEffect(()=>{
        if (colliderRef.current) {
            colliderRef.current.setTranslation(characterOpt.spawnPoint);
            colliderRef.current.setRotation({x: characterOpt.rotation.x, y: characterOpt.rotation.y, z: characterOpt.rotation.z, w: 1});
        }
    }, [characterOpt]);

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
        if (!characterControllerRef.current || !rapier.world || !colliderRef.current || !controllerRef.current || !characterOpt || !playerBodyRef.current) return;
        try {
            const pos = colliderRef.current.translation();
            const rot = playerBodyRef.current.rotation;
            const { direction, rotation, jump, speed } = controllerRef.current.getMovementInput(new THREE.Vector3(pos.x, pos.y, pos.z), rot);

            const currentTime = Date.now();

            if (isJumped) {
                setIsJumped(false);
            }

            const movement = direction.clone().multiplyScalar(characterOpt.playerSpeed);

            const rawGravity = rapier.world.gravity;
            const gravity = new THREE.Vector3(rawGravity.x, rawGravity.y, rawGravity.z);

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
                    movement.add(new Vector3(0, characterOpt.playerJumpForce * jumpDecay, 0));
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

            newPos.y -= characterOpt.height / 2;
            newPos = new THREE.Vector3(
                THREE.MathUtils.lerp(playerBodyRef.current.position.x, newPos.x, 0.2),
                THREE.MathUtils.lerp(playerBodyRef.current.position.y, newPos.y, 0.2),
                THREE.MathUtils.lerp(playerBodyRef.current.position.z, newPos.z, 0.2)
            );
            playerBodyRef.current.position.set(newPos.x, newPos.y, newPos.z);
            playerBodyRef.current.rotation.set(rotation.x, rotation.y, rotation.z);


            if (speed > 0.1) {
                playAnimator("Walk");
            } else {
                playAnimator("Idle");
            }
            updateAnimator(delta);

            controllerRef.current.postMovementProcess(playerControl);
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
        characterOpt,
    }



}
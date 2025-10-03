import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { promiseForGLTFLoader } from "@/util/THREE/three-js-function";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import * as THREE from "three";
import RAPIER, { KinematicCharacterController, World, Collider, Vector3 } from "@react-three/rapier/node_modules/@dimforge/rapier3d-compat";
import { useThreeStore } from '@/store/THREE/store';
import { ThreeWorldPlayerComponentProps } from '../ThreeWorldPlayerComponent';
import useThreeWorldPlayerAnimator from '@/common/THREE/character/hooks/useThreeWorldPlayerAnimator';

export type AnimationType = "Idle" | "Walk";

export default function useThreeWorldPlayerComponent({ controllerOptions, bodyOptions, collisionGroup, isLocal, gltfOptions }: ThreeWorldPlayerComponentProps) {
    const { scene } = useThree();
    const rapier = useRapier();

    const ctrlOpt = useMemo(() => ({
        offset: 0.01,
        mass: 3,
        slopeClimbAngle: Math.PI / 4,
        slopeSlideAngle: Math.PI / 4,
        ...controllerOptions
    }), [controllerOptions]);

    const bodyOpt = useMemo(() => ({
        height: 1.8,
        radius: 0.5,
        spawnPoint: new Vector3(0, 1.8, 0),
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: new Vector3(1, 1, 1),
        ...bodyOptions
    }), [bodyOptions]);

    const colGroup = useMemo(() => ({
        collisionGroup: ColliderGroupType.Player,
        collisionMask: ColliderGroupType.Default,
        ...collisionGroup
    }), [collisionGroup]);

    const playerBodyRef = useRef<THREE.Group | null>(null);
    const characterControllerRef = useRef<KinematicCharacterController | null>(null);
    const colliderRef = useRef<Collider | null>(null);
    const worldRef = useRef<World | null>(null);
    const headSocketRef = useRef<THREE.Group | null>(null);

    // 점프 상태 관리
    const [isJumped, setIsJumped] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpStartTime, setJumpStartTime] = useState(0);
    const [jumpForce, setJumpForce] = useState(0);
    const [collisionGroupState, setCollisionGroupState] = useState<ColliderGroupType>(ColliderGroupType.Player);
    const [collisionMaskState, setCollisionMaskState] = useState<ColliderGroupType>(ColliderGroupType.Default);

    const setHeadSocket = useThreeStore(state => state.setHeadSocket);

    const { initAnimator, updateAnimator, playAnimator } = useThreeWorldPlayerAnimator();

    // Rapier World 초기화
    useEffect(() => {
        if (rapier.world) {
            worldRef.current = rapier.world;
        }
    }, [rapier.world]);

    // CharacterController 생성
    useEffect(() => {
        if (!worldRef.current) return;

        try {
            const characterController = worldRef.current.createCharacterController(ctrlOpt.offset);
            characterController.setCharacterMass(ctrlOpt.mass);
            characterController.setMaxSlopeClimbAngle(ctrlOpt.slopeClimbAngle);
            characterController.setMinSlopeSlideAngle(ctrlOpt.slopeSlideAngle);

            characterControllerRef.current = characterController;
            setCollisionGroupState(colGroup.collisionGroup);
            setCollisionMaskState(colGroup.collisionMask);

            return () => {
                if (characterControllerRef.current && worldRef.current) {
                    worldRef.current.removeCharacterController(characterControllerRef.current);
                }
            };
        } catch (error) {
            console.error('Error creating CharacterController:', error);
        }
    }, [ctrlOpt, colGroup]);

    // Collider 생성
    useEffect(() => {
        if (!worldRef.current || !characterControllerRef.current) return;

        try {
            const colliderDesc = RAPIER.ColliderDesc.capsule(
                (bodyOpt.height - ctrlOpt.offset) / 2 - bodyOpt.radius,
                bodyOpt.radius
            ).setTranslation(
                bodyOpt.spawnPoint.x,
                bodyOpt.spawnPoint.y,
                bodyOpt.spawnPoint.z
            ).setRotation(
                { x: bodyOpt.rotation.x, y: bodyOpt.rotation.y, z: bodyOpt.rotation.z, w: 1 }
            ).setCollisionGroups(colliderGroup(colGroup.collisionGroup, colGroup.collisionMask))
                .setSolverGroups(colliderGroup(colGroup.collisionGroup, colGroup.collisionMask));

            const collider = worldRef.current.createCollider(colliderDesc);
            colliderRef.current = collider;

            return () => {
                if (colliderRef.current && worldRef.current) {
                    worldRef.current.removeCollider(colliderRef.current, true);
                }
            };
        } catch (error) {
            console.error('Error creating Collider:', error);
        }
    }, [bodyOpt, ctrlOpt, colGroup]);

    // GLTF 모델 로드
    useEffect(() => {

        if (!gltfOptions.gltfPath || !gltfOptions.isDraco) return;
        if (playerBodyRef.current) return;

        const loadModel = async () => {
            try {
                const gltfScene = await promiseForGLTFLoader(gltfOptions.gltfPath, gltfOptions.isDraco);

                gltfScene.scene.position.set(bodyOpt.spawnPoint.x, bodyOpt.spawnPoint.y, bodyOpt.spawnPoint.z);
                gltfScene.scene.rotation.set(bodyOpt.rotation.x, bodyOpt.rotation.y, bodyOpt.rotation.z);
                gltfScene.scene.scale.set(bodyOpt.scale.x, bodyOpt.scale.y, bodyOpt.scale.z);

                playerBodyRef.current = gltfScene.scene;
                scene.add(gltfScene.scene);

                headSocketRef.current = new THREE.Group();
                gltfScene.scene.add(headSocketRef.current);
                headSocketRef.current.position.set(0, bodyOpt.height - bodyOpt.radius, 0);

                if (isLocal) {
                    setHeadSocket(headSocketRef.current);
                }

                initAnimator(gltfScene, bodyOpt.defaultAnimationClip);

                return () => {
                    if (headSocketRef.current) {
                        scene.remove(headSocketRef.current);
                    }
                    if (playerBodyRef.current) {
                        scene.remove(playerBodyRef.current);
                    }
                };
            } catch (error) {
                console.error('Error loading GLTF model:', error);
            }
        };

        loadModel();
    }, [gltfOptions, bodyOpt, scene, colGroup, isLocal, setHeadSocket, initAnimator, playAnimator]);

    const moveDirection = useCallback((direction: THREE.Vector3, rotation: THREE.Euler, delta: number) => {
        if (!worldRef.current || !characterControllerRef.current || !colliderRef.current) {
            console.warn('Character not fully initialized');
            return;
        }

        try {
            const currentTime = Date.now();

            // 점프 상태 트리거
            if (isJumped) {
                setIsJumped(false);
            }

            const movement = direction.clone();

            const rawGravity = worldRef.current.gravity;
            const gravity = new THREE.Vector3(rawGravity.x, rawGravity.y, rawGravity.z);


            if (isJumping) {
                // 점프 중: 점프 힘을 적용하고 중력은 점진적으로 적용
                const jumpDuration = currentTime - jumpStartTime;

                const jumpDecay = Math.max(0, 1 - (jumpDuration / 1000));
                if (jumpDuration < 1000) {
                    movement.add(new Vector3(0, jumpForce * jumpDecay * jumpDecay, 0));
                }
            }

            if(Math.abs(movement.x) > 0.1 || Math.abs(movement.z) > 0.1) {
                playAnimator("Walk");
            } else {
                playAnimator("Idle");
            }

            if(!characterControllerRef.current.computedGrounded()) {
                movement.add(gravity);
            }

            movement.multiplyScalar(delta);

            characterControllerRef.current.computeColliderMovement(
                colliderRef.current,
                movement,
                undefined,
                colliderGroup(collisionGroupState, collisionMaskState)
            );

            const correctedMovement = characterControllerRef.current.computedMovement();
            const currentPos = colliderRef.current.translation();
            let newPos = new Vector3(
                currentPos.x + correctedMovement.x,
                currentPos.y + correctedMovement.y,
                currentPos.z + correctedMovement.z
            );

            colliderRef.current.setTranslation(newPos);

            if (playerBodyRef.current) {
                newPos.y -= bodyOpt.height / 2;
                newPos = new THREE.Vector3(
                    THREE.MathUtils.lerp(playerBodyRef.current.position.x, newPos.x, 0.2),
                    THREE.MathUtils.lerp(playerBodyRef.current.position.y, newPos.y, 0.2),
                    THREE.MathUtils.lerp(playerBodyRef.current.position.z, newPos.z, 0.2)
                );
                playerBodyRef.current.position.set(newPos.x, newPos.y, newPos.z);
                playerBodyRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
            }

            if (isJumping && characterControllerRef.current.computedGrounded()) {
                setIsJumping(false);
            }
        } catch (error) {
            console.error('Error in moveDirection:', error);
        }
    }, [bodyOpt, isJumping, jumpStartTime, jumpForce, isJumped, collisionGroupState, collisionMaskState, playAnimator]);

    const getPlayerPosition = useCallback(() => {
        if (colliderRef.current) {
            return colliderRef.current.translation();
        }
        return new Vector3(0, 0, 0);
    }, []);

    const getPlayerRotation = useCallback(() => {
        if (playerBodyRef.current) {
            return playerBodyRef.current.rotation;
        }
        return new THREE.Euler(0, 0, 0);
    }, []);
    
    const getIsGrounded = useCallback(() => {
        if (characterControllerRef.current) {
            return characterControllerRef.current.computedGrounded();
        }
        return false;
    }, []);

    const getPlayerBody = useCallback(() => {
        return playerBodyRef.current || undefined;
    }, []);

    const getHeadSocket = useCallback(() => {
        return headSocketRef.current || undefined;
    }, []);
    
    const startJump = useCallback((force?: number) => {
        if(!isJumped) setIsJumped(true);
        if(!isJumping) setIsJumping(true);
        setJumpStartTime(Date.now());
        setJumpForce((force || 0)*10);
    }, [isJumped, isJumping, setJumpStartTime, setJumpForce]);

    return {
        useTreeWorldPlayerComponent: useThreeWorldPlayerComponent,
        moveDirection,
        getPlayerPosition,
        getPlayerRotation,
        getIsGrounded,
        getPlayerBody,
        startJump,
        getHeadSocket,
        updateAnimator,
        playAnimator
    }
}

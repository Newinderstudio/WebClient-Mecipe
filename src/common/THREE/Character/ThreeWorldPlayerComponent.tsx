import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { promiseForGLTFLoader } from "@/util/THREE/three-js-function";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import * as THREE from "three";
import RAPIER,{ KinematicCharacterController, World, Collider, Quaternion, Vector3  } from "@react-three/rapier/node_modules/@dimforge/rapier3d-compat";
export interface ThreeWorldPlayerRef {
    moveDirection: (direction: THREE.Vector3, delta: number) => void;
    getPlayerPosition: () => Vector3;
    getIsGrounded: () => boolean;
    getPlayerBody: () => THREE.Group | undefined;
    startJump: (force?: number) => void;
}

export interface ThreeWorldPlayerGltfOptions {
    gltfPath: string;
    isDraco: boolean;
}

export interface ThreeWorldPlayerBodyOptions {
    height: number;
    radius: number;
    spawnPoint: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

export interface ThreeWorldPlayerControllerOptions {
    offset: number;
    mass: number;
    slopeClimbAngle: number;
    slopeSlideAngle: number;
}

export interface ThreeWorldPlayerCollisionGroupOptions {
    collisionGroup: number;
    collisionMask: number;
}

export interface ThreeWorldPlayerComponentProps {
    gltfOptions: ThreeWorldPlayerGltfOptions;
    bodyOptions?: Partial<ThreeWorldPlayerBodyOptions>;
    controllerOptions?: Partial<ThreeWorldPlayerControllerOptions>;
    collisionGroup?: Partial<ThreeWorldPlayerCollisionGroupOptions>;
}

const ThreeWorldPlayerComponent = forwardRef<ThreeWorldPlayerRef, ThreeWorldPlayerComponentProps>(
    ({ gltfOptions, bodyOptions, controllerOptions, collisionGroup }, ref) => {
        const { scene } = useThree();
        const rapier = useRapier();
        
        const playerBodyRef = useRef<THREE.Group | null>(null);
        const characterControllerRef = useRef<KinematicCharacterController | null>(null);
        const colliderRef = useRef<Collider | null>(null);
        const worldRef = useRef<World | null>(null);
        
        // 점프 상태 관리
        const [isJumped, setIsJumped] = useState(false);
        const [isJumping, setIsJumping] = useState(false);
        const [jumpStartTime, setJumpStartTime] = useState(0);
        const [jumpForce, setJumpForce] = useState(0);
        const [collisionGroupState, setCollisionGroupState] = useState<ColliderGroupType>(ColliderGroupType.Player);
        const [collisionMaskState, setCollisionMaskState] = useState<ColliderGroupType>(ColliderGroupType.Default);

        // Rapier World 초기화
        useEffect(() => {
            if (rapier.world) {
                worldRef.current = rapier.world;
            }
        }, [rapier.world]);

        // CharacterController 생성
        useEffect(() => {
            if (!worldRef.current) return;

            const ctrlOpt = {
                offset: 0.01,
                mass: 3,
                slopeClimbAngle: Math.PI / 4,
                slopeSlideAngle: Math.PI / 4,
                ...controllerOptions
            };

            const colGroup = {
                collisionGroup: ColliderGroupType.Player,
                collisionMask: ColliderGroupType.Default,
                ...collisionGroup
            };

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
        }, [controllerOptions, collisionGroup]);

        // Collider 생성
        useEffect(() => {
            if (!worldRef.current || !characterControllerRef.current) return;

            const bodyOpt = {
                height: 1.8,
                radius: 0.5,
                spawnPoint: new Vector3(0, 1.8, 0),
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: new Vector3(1, 1, 1),
                ...bodyOptions
            };

            const ctrlOpt = {
                offset: 0.01,
                mass: 3,
                slopeClimbAngle: Math.PI / 4,
                slopeSlideAngle: Math.PI / 4,
                ...controllerOptions
            };

            const colGroup = {
                collisionGroup: ColliderGroupType.Player,
                collisionMask: ColliderGroupType.Default,
                ...collisionGroup
            };

            try {
                const colliderDesc = RAPIER.ColliderDesc.capsule(
                    (bodyOpt.height - ctrlOpt.offset) / 2 - bodyOpt.radius,
                    bodyOpt.radius
                ).setTranslation(
                    bodyOpt.spawnPoint.x,
                    bodyOpt.spawnPoint.y,
                    bodyOpt.spawnPoint.z
                ).setRotation(
                    bodyOpt.rotation
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
        }, [bodyOptions, controllerOptions, collisionGroup]);

        // GLTF 모델 로드
        useEffect(() => {
            const loadModel = async () => {
                try {
                    const gltfScene = await promiseForGLTFLoader(gltfOptions.gltfPath, gltfOptions.isDraco);
                    
                    const bodyOpt = {
                        height: 1.8,
                        radius: 0.5,
                        spawnPoint: new Vector3(0, 1.8, 0),
                        rotation: { x: 0, y: 0, z: 0, w: 1 },
                        scale: new Vector3(1, 1, 1),
                        ...bodyOptions
                    };

                    gltfScene.position.set(bodyOpt.spawnPoint.x, bodyOpt.spawnPoint.y, bodyOpt.spawnPoint.z);
                    gltfScene.rotation.set(bodyOpt.rotation.x, bodyOpt.rotation.y, bodyOpt.rotation.z);
                    gltfScene.scale.set(bodyOpt.scale.x, bodyOpt.scale.y, bodyOpt.scale.z);
                    
                    playerBodyRef.current = gltfScene;
                    scene.add(gltfScene);
                    // setIsInitialized(true);

                    return () => {
                        if (playerBodyRef.current) {
                            scene.remove(playerBodyRef.current);
                        }
                    };
                } catch (error) {
                    console.error('Error loading GLTF model:', error);
                }
            };

            loadModel();
        }, [gltfOptions, bodyOptions, scene]);

        // forwardRef로 외부에서 호출할 수 있는 메서드들 노출
        useImperativeHandle(ref, () => ({
            moveDirection: (direction: THREE.Vector3, delta: number) => {
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
                        if(jumpDuration<1000) {
                            movement.add(new Vector3(0, jumpForce*jumpDecay*jumpDecay, 0));
                        }
                    }

                    movement.add(gravity).multiplyScalar(delta);

                    characterControllerRef.current.computeColliderMovement(
                        colliderRef.current,
                        movement,
                        undefined,
                        colliderGroup(collisionGroupState, collisionMaskState)
                    );

                    const correctedMovement = characterControllerRef.current.computedMovement();
                    const currentPos = colliderRef.current.translation();
                    const newPos = new Vector3(
                        currentPos.x + correctedMovement.x,
                        currentPos.y + correctedMovement.y,
                        currentPos.z + correctedMovement.z
                    );
                    
                    colliderRef.current.setTranslation(newPos);
                    
                    if (playerBodyRef.current) {
                        playerBodyRef.current.position.set(newPos.x, newPos.y, newPos.z);
                    }

                    if(isJumping && characterControllerRef.current.computedGrounded()) {
                        setIsJumping(false);
                    }
                } catch (error) {
                    console.error('Error in moveDirection:', error);
                }
            },
            getPlayerPosition: () => {
                if (colliderRef.current) {
                    return colliderRef.current.translation();
                }
                return new Vector3(0, 0, 0);
            },
            getIsGrounded: () => {
                if (characterControllerRef.current) {
                    return characterControllerRef.current.computedGrounded();
                }
                return false;
            },
            getPlayerBody: () => {
                return playerBodyRef.current || undefined;
            },
            startJump: (force?: number) => {
                if(!isJumped) setIsJumped(true);
                if(!isJumping) setIsJumping(true);
                setJumpStartTime(Date.now());
                setJumpForce((force || 0)*5);
            }
        }), [collisionGroupState, collisionMaskState, isJumping, jumpStartTime, jumpForce, isJumped]);

        // 컴포넌트가 렌더링되지 않도록 null 반환 (forwardRef만 사용)
        return null;
    }
);

ThreeWorldPlayerComponent.displayName = 'ThreeWorldPlayerComponent';

export default ThreeWorldPlayerComponent;

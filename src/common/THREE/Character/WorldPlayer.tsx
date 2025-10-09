import { GLTF } from "three-stdlib";
import { CapsuleCollider } from "@react-three/rapier";
import { IController } from "./controllers";
import useWorldPlayer from "./hooks/useWorldPlayer";
import { Euler, Vector3 } from "three";

export interface CharacterManagerOptions {
    height: number;
    radius: number;
    spawnPoint: Vector3;
    playerJumpForce: number;
    playerSpeed: number;
    rotationSpeed: number;
    scale: Vector3;
    rotation: Euler;
    defaultAnimationClip: string;
}

export interface WorldPlayerControllerRef<T> {
    current: IController<T> | null;
}

export interface WorldPlayerControllerOptions {
    offset: number;
    mass: number;
    slopeClimbAngle: number;
    slopeSlideAngle: number;
}

export interface WorldPlayerCollisionGroupOptions {
    collisionGroup: number;
    collisionMask: number;
}

export interface WorldPlayerProps<T> {
    isLocal: boolean;
    gltf: GLTF;
    controllerRef: WorldPlayerControllerRef<T>;
    characterOptions?: Partial<CharacterManagerOptions>;
    controllerOptions?: Partial<WorldPlayerControllerOptions>;
    collisionGroup?: Partial<WorldPlayerCollisionGroupOptions>;
}

export default function WorldPlayer<T>(props: WorldPlayerProps<T>) {

    const { colliderRef, playerBodyRef, headSocketRef, capsuleColliderProps, headSocketProps, clonedNodes, characterOpt } = useWorldPlayer<T>(props);


    return (
        <CapsuleCollider ref={colliderRef} {...capsuleColliderProps} >
            <primitive ref={playerBodyRef} object={clonedNodes} scale={characterOpt.scale} >
                <group ref={headSocketRef} {...headSocketProps} />
            </primitive>
        </CapsuleCollider>
    )
}
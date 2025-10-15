import { GLTF } from "three-stdlib";
import { CapsuleCollider } from "@react-three/rapier";
import { IController } from "./controllers/IController";
import useWorldPlayer from "./hooks/useWorldPlayer";
import { Euler, Vector3 } from "three";

export type CharacterOptions = CharacterBaseOptions & CharacterInitialPoint;

export interface CharacterBaseOptions {
    height: number;
    radius: number;
    playerJumpForce: number;
    playerSpeed: number;
    rotationSpeed: number;
    scale: Vector3;
    defaultAnimationClip: string;
}

export interface CharacterInitialPoint {
    spawnPoint: Vector3;
    rotation: Euler;
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
    characterInitialPoint: CharacterInitialPoint;
    characterBaseOptions: CharacterBaseOptions;
    controllerOptions?: Partial<WorldPlayerControllerOptions>;
    collisionGroup?: Partial<WorldPlayerCollisionGroupOptions>;
}

export default function WorldPlayer<T>(props: WorldPlayerProps<T>) {

    const { colliderRef, playerBodyRef, headSocketRef, capsuleColliderProps, headSocketProps, clonedNodes } = useWorldPlayer<T>(props);


    return (
        <CapsuleCollider ref={colliderRef} {...capsuleColliderProps}>
            <primitive ref={playerBodyRef} object={clonedNodes} >
                <group ref={headSocketRef} {...headSocketProps} />
            </primitive>
        </CapsuleCollider>
    )
}
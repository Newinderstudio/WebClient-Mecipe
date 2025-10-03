import { forwardRef, useImperativeHandle } from 'react';
import * as THREE from "three";
import { Quaternion, Vector3  } from "@react-three/rapier/node_modules/@dimforge/rapier3d-compat";
import useThreeWorldPlayerComponent from './hooks/useThreeWorldPlayerComponent';
export interface ThreeWorldPlayerRef {
    moveDirection: (direction: THREE.Vector3, rotation: THREE.Euler, delta: number) => void;
    getPlayerPosition: () => Vector3;
    getPlayerRotation: () => THREE.Euler;
    getIsGrounded: () => boolean;
    getPlayerBody: () => THREE.Group | undefined;
    startJump: (force?: number) => void;
    getHeadSocket: () => THREE.Group | undefined;
    updateAnimator: (delta: number) => void;
    playAnimator: (animationClipName: string, isForce?: boolean) => void;
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
    defaultAnimationClip: string;
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
    isLocal: boolean;
    gltfOptions: ThreeWorldPlayerGltfOptions;
    bodyOptions?: Partial<ThreeWorldPlayerBodyOptions>;
    controllerOptions?: Partial<ThreeWorldPlayerControllerOptions>;
    collisionGroup?: Partial<ThreeWorldPlayerCollisionGroupOptions>;
}

const ThreeWorldPlayerComponent = forwardRef<ThreeWorldPlayerRef, ThreeWorldPlayerComponentProps>(
    ({ gltfOptions, bodyOptions, controllerOptions, collisionGroup, isLocal }, ref) => {

        const {
            moveDirection,
            getPlayerPosition,
            getPlayerRotation,
            getIsGrounded,
            getPlayerBody,
            startJump,
            getHeadSocket,
            updateAnimator,
            playAnimator
        } = useThreeWorldPlayerComponent({ gltfOptions, bodyOptions, controllerOptions, collisionGroup, isLocal });

        // forwardRef로 외부에서 호출할 수 있는 메서드들 노출
        useImperativeHandle(ref, () => ({
            moveDirection: moveDirection,
            getPlayerPosition: getPlayerPosition,
            getIsGrounded: getIsGrounded,
            getPlayerBody: getPlayerBody,
            startJump: startJump,
            getHeadSocket: getHeadSocket,
            getPlayerRotation: getPlayerRotation,
            updateAnimator: updateAnimator,
            playAnimator: playAnimator
        }), [moveDirection, getPlayerPosition, getPlayerRotation, getIsGrounded, getPlayerBody, startJump, getHeadSocket, updateAnimator, playAnimator]);

        // 컴포넌트가 렌더링되지 않도록 null 반환 (forwardRef만 사용)
        return null;
    }
);

ThreeWorldPlayerComponent.displayName = 'ThreeWorldPlayerComponent';

export default ThreeWorldPlayerComponent;

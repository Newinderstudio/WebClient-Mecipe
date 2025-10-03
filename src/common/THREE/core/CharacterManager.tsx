import { Euler, Vector3 } from "three";
import useCharacterManager from "./hooks/useCharacterManager";
import ThreeWorldPlayerComponent from "../character/ThreeWorldPlayerComponent";
import TPSCameraController from "../camera/TPSCameraController";

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

export default function CharacterManager({characterOptions}: {characterOptions: CharacterManagerOptions}) {

    const characterGltfPath = "/3d/test_virtual_world/character.glb";
    const characterGltfIsDraco = true;

    const { worldRef, localPlayerRef, characterGltfOptions } = useCharacterManager({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco, characterOptions});

    return (
        <group ref={worldRef}>
            <ThreeWorldPlayerComponent
                isLocal={true}
                ref={localPlayerRef}
                gltfOptions={characterGltfOptions}
                bodyOptions={characterOptions}
            />
            <TPSCameraController
                minDistance={2}
                maxDistance={10}
                curDistance={5}
                sensitivity={0.005}
                wheelSensitivity={0.5}
            />
        </group>
    )
}
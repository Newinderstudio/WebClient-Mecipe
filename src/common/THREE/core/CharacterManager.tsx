import { Euler, Vector3 } from "three";
import useCharacterManager from "./hooks/useCharacterManager";
import ThreeWorldPlayerComponent from "../character/ThreeWorldPlayerComponent";

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

    const { worldRef, localPlayerRef, characterGltfOptions, players, refCallback } = useCharacterManager({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco, characterOptions});

    return (
        <group ref={worldRef}>
            <ThreeWorldPlayerComponent
                isLocal={true}
                ref={localPlayerRef}
                gltfOptions={characterGltfOptions}
                bodyOptions={characterOptions}
            />
            {players.map((player) => (
                <ThreeWorldPlayerComponent
                    key={player}
                    isLocal={false}
                    ref={ref=>refCallback(player, ref)}
                    gltfOptions={characterGltfOptions}
                    bodyOptions={characterOptions}
                />
            ))}
        </group>
    )
}
import { Euler, Vector3 } from "three";
import useCharacterManager from "./hooks/useCharacterManager";
import ThreeWorldPlayerComponent from "../character/ThreeWorldPlayerComponent";

export interface CharacterManagerOptions {
    height: number;
    radius: number;
    spawnPoint: Vector3;
    playerJumpForce: number;
    playerSpeed: number;
    scale: Vector3;
    rotation: Euler;
}

export default function CharacterManager({characterOptions}: {characterOptions: CharacterManagerOptions}) {

    const characterGltfPath = "/3d/test_virtual_world/character.glb";
    const characterGltfIsDraco = true;

    const { worldRef, characterNodes:CharacterNodes, localPlayerRef } = useCharacterManager({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco, characterOptions});

    console.log("Character Map", CharacterNodes);

    return (
        <group ref={worldRef}>
            <ThreeWorldPlayerComponent
                ref={localPlayerRef}
                gltfOptions={{
                    gltfPath: characterGltfPath,
                    isDraco: characterGltfIsDraco
                }}
                bodyOptions={{
                    spawnPoint: characterOptions.spawnPoint,
                    scale: characterOptions.scale,
                    rotation: {
                        x: characterOptions.rotation.x,
                        y: characterOptions.rotation.y,
                        z: characterOptions.rotation.z,
                        w: 1
                    }
                }}
            />
        </group>
    )
}
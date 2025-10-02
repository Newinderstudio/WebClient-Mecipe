import { Euler, Vector3 } from "three";
import CharacterAvatar from "../character/CharacterAvatar";
import useCharacterManager from "./hooks/useCharacterManager";

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

    const { worldRef, localControl: LocalControl, characterNodes:CharacterNodes } = useCharacterManager({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco, characterOptions});

    console.log("Character Map", CharacterNodes);

    return (
        <group ref={worldRef}>
            <LocalControl>
                <CharacterAvatar
                    gltfPath={characterGltfPath}
                    isDraco={characterGltfIsDraco}
                    options={{
                        scale: characterOptions.scale,
                        spawnPoint: characterOptions.spawnPoint,
                        rotation: characterOptions.rotation,
                    }}
                />
            </LocalControl>
            {Object.keys(CharacterNodes).map((id) => <CharacterAvatar key={id} {...CharacterNodes[id]} />)}
        </group>
    )
}
import { Vector3 } from "three";
import CharacterAvatar from "../character/CharacterAvatar";
import useCharacterManager from "./hooks/useCharacterManager";

export interface CharacterManagerOptions {
    height: number;
    radius: number;
    spawnPoint: Vector3;
    playerJumpForce: number;
    playerSpeed: number;
}

export default function CharacterManager({characterOptions}: {characterOptions: CharacterManagerOptions}) {

    const characterGltfPath = "/3d/test_virtual_world/character.glb";
    const characterGltfIsDraco = true;

    const { LocalControl } = useCharacterManager({characterOptions});

    return (
        <group>
            <LocalControl>
                <CharacterAvatar
                    gltfPath={characterGltfPath}
                    isDraco={characterGltfIsDraco}
                    options={{
                        scale: new Vector3(1, 1, 1),
                    }}
                />
            </LocalControl>
        </group>
    )
}
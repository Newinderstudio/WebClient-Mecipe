import useCharacterAvatar from "./hooks/useCharacterAvatar";
import { Euler, Vector3 } from "three";

export interface CharacterAvatarOptions {
    scale: Vector3;
    spawnPoint: Vector3;
    rotation: Euler;
}

export interface CharacterAvatarProps {
    gltfPath: string;
    isDraco?: boolean;
    options: CharacterAvatarOptions;
}

function CharacterAvatar({
    gltfPath,
    isDraco = false,
    options,
}: CharacterAvatarProps) {

    const { gltf } = useCharacterAvatar({ gltfPath, isDraco });

    return (
        <primitive object={gltf.scene} scale={options.scale} position={options.spawnPoint} rotation={options.rotation} />
    )
}

export default CharacterAvatar;
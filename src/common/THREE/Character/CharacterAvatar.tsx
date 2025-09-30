import useCharacterAvatar from "./hooks/useCharacterAvatar";
import { Vector3 } from "three";

export interface CharacterAvatarOptions {
    scale: Vector3;
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
        <primitive object={gltf.scene} scale={options.scale} />
    )
}

export default CharacterAvatar;
import useCharacterAvatar from "./hooks/useCharacterAvatar";

export interface CharacterAvatarProps {
    gltfPath: string;
    isDraco?: boolean;
}

function CharacterAvatar({
    gltfPath,
    isDraco = false,
}: CharacterAvatarProps) {

    const { gltf } = useCharacterAvatar({ gltfPath, isDraco });

    return (
        <primitive object={gltf.scene} />
    )
}

export default CharacterAvatar;
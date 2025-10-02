import { CapsuleColliderProps } from "@react-three/rapier";
import { useMemo } from "react";
import { CharacterManagerOptions } from "../../core/CharacterManager";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import CharacterAvatar from "../CharacterAvatar";

export default function useCharacterWrapper({ options, gltfPath, isDraco }: { options: CharacterManagerOptions, gltfPath: string, isDraco: boolean }) {

    const capsuleColliderProps: CapsuleColliderProps = useMemo(() => ({
        args: [options.height / 2 - options.radius, options.radius],
        collisionGroups: colliderGroup(ColliderGroupType.Player, ColliderGroupType.Default),
    }), [options]);

    const characterAvatar = useMemo(() =>
        (<CharacterAvatar
            gltfPath={gltfPath}
            isDraco={isDraco}
        />), [gltfPath, isDraco]
    );

    return {
        capsuleColliderProps,
        characterAvatar
    }
}
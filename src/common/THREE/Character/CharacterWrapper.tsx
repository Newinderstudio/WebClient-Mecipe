import { CapsuleCollider, RapierCollider } from "@react-three/rapier";
import useCharacterWrapper from "./hooks/useCharacterWrapper";
import { CharacterManagerOptions } from "../core/CharacterManager";
import { Euler, Vector3 } from "three";
import { Capsule } from "@react-three/drei";

export default function CharacterWrapper({ options, colliderRef, position, rotation = new Euler(), scale = new Vector3(), gltfPath, isDraco }: { options: CharacterManagerOptions, colliderRef: React.RefObject<RapierCollider|null>, position: Vector3, rotation?: Euler, scale?: Vector3, gltfPath: string, isDraco: boolean }) {
    const { capsuleColliderProps, characterAvatar } = useCharacterWrapper({ options, gltfPath, isDraco });

    return (
        <CapsuleCollider {...capsuleColliderProps} ref={colliderRef} position={position} rotation={rotation} scale={scale}>
            {characterAvatar}
            <Capsule args={[options.height / 2 - options.radius, options.radius]} />
        </CapsuleCollider>
    )
}
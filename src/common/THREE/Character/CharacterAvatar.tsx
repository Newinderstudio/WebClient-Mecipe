import useCharacterAvatar from "./hooks/useCharacterAvatar";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { IController } from "./controllers/IController";

export interface CharacterAvatarProps {
    gltfPath: string;
    isDraco?: boolean;
    controller?: IController;
}

function CharacterAvatar({ 
    gltfPath,
    isDraco = false,
    controller,
}: CharacterAvatarProps) {

    const { gltf, ref } = useCharacterAvatar({ gltfPath, isDraco, controller });


    return (
        <RigidBody type="dynamic" ref={ref} mass={1} colliders={false} position={[0, 100, 0]} enabledRotations={[false, false, false]}>
            <CapsuleCollider args={[0.75, 0.5]} />
            <primitive object={gltf.scene} />
        </RigidBody>
    )
}

export default CharacterAvatar;
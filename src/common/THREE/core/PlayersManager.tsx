import { Euler, Vector3 } from "three";
import WorldPlayer from "../Character/WorldPlayer";
import usePlayersManagers from "./hooks/usePlayersManagers";

export interface PlayersManagerOptions {
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

export interface ControllerOptions {
    offset: number;
    mass: number;
    slopeClimbAngle: number;
    slopeSlideAngle: number;
}
export default function PlayersManager({characterOptions, controllerOptions}: {characterOptions: PlayersManagerOptions, controllerOptions: ControllerOptions}) {

    const characterGltfPath = "/3d/models/character.glb";
    const characterGltfIsDraco = true;

    const { gltf, keyboardController, players, characterBaseOptions, localInitialPoint } = usePlayersManagers({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco, characterOptions});

    if(!characterOptions) return null;

    return (
        <group>
            <WorldPlayer
                key={"#localPlayer"}
                isLocal={true}
                gltf={gltf}
                controllerRef={keyboardController}
                characterBaseOptions={characterBaseOptions}
                characterInitialPoint={localInitialPoint}
                controllerOptions={controllerOptions}
            />
            {players.map((player) => {
                return (
                    (
                        <WorldPlayer
                            key={player.sessionToken}
                            isLocal={false}
                            gltf={gltf}
                            controllerRef={player.controller}
                            characterBaseOptions={characterBaseOptions}
                            characterInitialPoint={player.characterInitialPoint}
                            controllerOptions={controllerOptions}
                        />
                    )
                )
            })}
        </group>
    )
}
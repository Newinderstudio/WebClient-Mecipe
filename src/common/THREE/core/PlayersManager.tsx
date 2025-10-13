import { Euler, Vector3 } from "three";
import WorldPlayer from "../character/WorldPlayer";
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
export default function PlayersManager({characterOptions, controllerOptions}: {characterOptions: PlayersManagerOptions|undefined, controllerOptions: Partial<ControllerOptions>}) {

    const characterGltfPath = "/3d/test_virtual_world/character.glb";
    const characterGltfIsDraco = true;

    const { gltf, keyboardController, players, testPlayerControllersRef } = usePlayersManagers({gltfPath: characterGltfPath, isDraco: characterGltfIsDraco});

    if(!characterOptions) return null;

    return (
        <group>
            <WorldPlayer
                key={"#localPlayer"}
                isLocal={true}
                gltf={gltf}
                controllerRef={keyboardController}
                characterOptions={characterOptions}
                controllerOptions={controllerOptions}
            />
            {players.map((player) => {
                return (
                    (
                        <WorldPlayer
                            key={player.socketId}
                            isLocal={false}
                            gltf={gltf}
                            controllerRef={testPlayerControllersRef.current.get(player.socketId)!}
                            characterOptions={characterOptions}
                            controllerOptions={controllerOptions}
                        />
                    )
                )
            })}
        </group>
    )
}
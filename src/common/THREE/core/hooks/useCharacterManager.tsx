import { KeyboardController } from "../../character/controllers";
import { PlayerInterface } from "../../character/controllers/IController";
import { useKeyboardControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CharacterManagerOptions } from "../CharacterManager";
import { Euler, Group, Vector3 } from "three";
import { useThreeStore } from "@/store/THREE/store";
import { ThreeWorldPlayerRef } from "../../character/ThreeWorldPlayerComponent";

export default function useCharacterManager({ gltfPath, isDraco, characterOptions }: { gltfPath: string, isDraco: boolean, characterOptions: CharacterManagerOptions }) {

    const [, get] = useKeyboardControls();

    const worldRef = useRef<Group>(null);
    const threeState = useThree();

    const addCharacterNodes = useThreeStore(state => state.addCharacterNodes);

    const keyboardController = useRef<KeyboardController>(null);
    const localPlayerRef = useRef<ThreeWorldPlayerRef>(null);

    const characterGltfOptions = useMemo(() => ({
        gltfPath,
        isDraco
    }), [gltfPath, isDraco]);

    useEffect(() => {
        if (!gltfPath || !isDraco || !characterOptions || !threeState || keyboardController.current) return;
        const ctrl = new KeyboardController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, characterOptions);
    }, [gltfPath, isDraco, characterOptions, threeState])

    const [isReset, setIsReset] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);

    const playerInterface: PlayerInterface = useMemo(() => ({
        getPlayerPosition: () => {
            const pos = localPlayerRef.current?.getPlayerPosition();
            return pos ? new Vector3(pos.x, pos.y, pos.z) : new Vector3(0, 0, 0);
        },
        getIsGrounded: () => localPlayerRef.current?.getIsGrounded() || false,
        startJump: (force?: number) => localPlayerRef.current?.startJump(force),
        getPlayerRotation: () => localPlayerRef.current?.getPlayerRotation() || new Euler(0, 0, 0),
        updateAnimator: (delta: number) => localPlayerRef.current?.updateAnimator(delta),
        playAnimator: (animationClipName: string, isForce?: boolean) => localPlayerRef.current?.playAnimator(animationClipName, isForce)
    }), [localPlayerRef]);

    useFrame((_, delta) => {
        const { reset, special } = get();
        if (reset && !isReset) {
            setIsReset(true);
        } else if (!reset && isReset) {
            setIsReset(false);
        }
        if (special && !isSpecial) {
            setIsSpecial(true);
        } else if (!special && isSpecial) {
            setIsSpecial(false);
        }

        if (localPlayerRef.current && keyboardController.current) {
            try {
                const movementInput = keyboardController.current.getMovementInput(
                    playerInterface,
                    { getKeyboarState: get }
                );

                if (movementInput && movementInput.direction) {
                    localPlayerRef.current.moveDirection(movementInput.direction, movementInput.rotation, delta);
                }
                playerInterface.updateAnimator(delta);
            } catch (error) {
                console.error('Error in character movement:', error);
            }
        }
        

    });

    const refCallback = useCallback((id: string, ref: ThreeWorldPlayerRef|null) => {
        if(ref) addCharacterNodes(id, ref);
    }, [addCharacterNodes]);

    const [players, setPlayers] = useState<string[]>([]);

    const addPlayer = useCallback((id: string) => {
        setPlayers(prev=>[...prev, id]);
    }, []);

    useEffect(() => {
        if (!gltfPath || !isDraco || !characterOptions) return;
        if (isReset) {
            console.log('reset');
            const randomeId = Math.random().toString(36).substring(2, 15);
            addPlayer(randomeId);
        } else if (isSpecial) {
            console.log('special');
            // const randomeId = Math.random().toString(36).substring(2, 15);
            // removePlayer(randomeId);
        }
    }, [isReset, characterOptions, addPlayer, gltfPath, isDraco, isSpecial]);

    return {
        worldRef,
        localPlayerRef,
        characterGltfOptions,
        refCallback,
        players
    }
}
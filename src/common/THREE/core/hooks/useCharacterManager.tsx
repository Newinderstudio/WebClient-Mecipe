import { KeyboardController } from "../../character/controllers";
import { PlayerInterface } from "../../character/controllers/IController";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CharacterManagerOptions } from "../CharacterManager";
import { Group, Vector3 } from "three";
import { useThreeStore } from "@/store/THREE/store";
import { ThreeWorldPlayerRef } from "../../character/ThreeWorldPlayerComponent";

export default function useCharacterManager({ gltfPath, isDraco, characterOptions }: { gltfPath: string, isDraco: boolean, characterOptions: CharacterManagerOptions }) {
    const [, get] = useKeyboardControls();

    const worldRef = useRef<Group>(null);
    const threeState = useThree();

    const characterNodes = useThreeStore(state => state.characterNodes);
    const addCharacterNodes = useThreeStore(state => state.addCharacterNodes);
    const removeCharacterNodes = useThreeStore(state => state.removeCharacterNodes);

    const keyboardController = useRef<KeyboardController>(null);
    const localPlayerRef = useRef<ThreeWorldPlayerRef>(null);
    
    useEffect(()=>{
        if(!gltfPath || !isDraco || !characterOptions || !threeState || keyboardController.current) return;
        const ctrl = new KeyboardController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, characterOptions);
    },[gltfPath, isDraco, characterOptions, threeState])

    const [isReset, setIsReset] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);

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

        if(localPlayerRef.current && keyboardController.current) {
            try {
                const playerInterface: PlayerInterface = {
                    getPlayerPosition: () => {
                        const pos = localPlayerRef.current?.getPlayerPosition();
                        return pos ? new Vector3(pos.x, pos.y, pos.z) : new Vector3(0, 0, 0);
                    },
                    getIsGrounded: () => localPlayerRef.current?.getIsGrounded() || false,
                    startJump: (force?: number) => localPlayerRef.current?.startJump(force)
                };
                
                const movementInput = keyboardController.current.getMovementInput(
                    playerInterface, 
                    {getKeyboarState: get}
                );
                
                if (movementInput && movementInput.direction) {
                    localPlayerRef.current.moveDirection(movementInput.direction, delta);
                    
                    const position = localPlayerRef.current.getPlayerPosition();
                    threeState.camera.position.set(position.x, position.y, position.z);
                }
            } catch (error) {
                console.error('Error in character movement:', error);
            }
        }
    });

    useEffect(() => {
        if(!gltfPath || !isDraco || !characterOptions) return;
        if (isReset) {
            console.log('reset');
            const randomeId = Math.random().toString(36).substring(2, 15);
            addCharacterNodes(randomeId, {
                gltfPath,
                isDraco,
                // options: {...characterOptions, spawnPoint: new Vector3(Math.random() * 10, 10, Math.random() * 10)},
            });
        } else if (isSpecial) {
            console.log('special');
            const randomeId = Math.random().toString(36).substring(2, 15);
            removeCharacterNodes(randomeId);
        }
    }, [isReset, characterOptions, addCharacterNodes, removeCharacterNodes, gltfPath, isDraco, isSpecial]);

    return {
        worldRef,
        characterNodes,
        localPlayerRef,
    }
}
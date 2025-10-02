import useCharacterControllerHelper from "@/hooks/THREE/useCharacterControllerHelper";
import { KeyboardController } from "../../character/controllers";
import { useKeyboardControls } from "@react-three/drei";
import { useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CharacterManagerOptions } from "../CharacterManager";
import { Group, Vector3 } from "three";
import { useThreeStore } from "@/store/THREE/store";

export default function useCharacterManager({ gltfPath, isDraco, characterOptions }: { gltfPath: string, isDraco: boolean, characterOptions: CharacterManagerOptions }) {
    const [, get] = useKeyboardControls();
    const rapier = useRapier();

    const worldRef = useRef<Group>(null);

    const characterNodes = useThreeStore(state => state.characterNodes);
    const addCharacterNodes = useThreeStore(state => state.addCharacterNodes);
    const removeCharacterNodes = useThreeStore(state => state.removeCharacterNodes);
    const keyboardController = new KeyboardController();

    const { renderer: localControl } = useCharacterControllerHelper({
        controller: keyboardController,
        options: characterOptions,
        moveProps: {
            getKeyboarState: get,
            rapier: rapier,
        },
    });

    const [isReset, setIsReset] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);

    useFrame(() => {
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
    });

    useEffect(() => {
        if(!gltfPath || !isDraco || !characterOptions) return;
        if (isReset) {
            console.log('reset');
            const randomeId = Math.random().toString(36).substring(2, 15);
            addCharacterNodes(randomeId, {
                gltfPath,
                isDraco,
                options: {...characterOptions, spawnPoint: new Vector3(Math.random() * 10, 10, Math.random() * 10)},
            });
        } else if (isSpecial) {
            console.log('special');
            const randomeId = Math.random().toString(36).substring(2, 15);
            removeCharacterNodes(randomeId);
        }
    }, [isReset, characterOptions, addCharacterNodes, removeCharacterNodes, gltfPath, isDraco, isSpecial]);

    return {
        worldRef,
        localControl,
        characterNodes,
    }
}
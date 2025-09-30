import useCharacterControllerHelper from "@/hooks/THREE/useCharacterControllerHelper";
import { KeyboardController } from "../../character/controllers";
import { useKeyboardControls } from "@react-three/drei";
import { useRapier } from "@react-three/rapier";
import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CharacterManagerOptions } from "../CharacterManager";

export default function useCharacterManager({characterOptions}: {characterOptions: CharacterManagerOptions}) {
    const [, get] = useKeyboardControls();
    const rapier = useRapier();

    const keyboardController = new KeyboardController();

    const { renderer: LocalControl } = useCharacterControllerHelper({
        controller: keyboardController,
        options: characterOptions,
        moveProps: {
            getKeyboarState: get,
            rapier: rapier,
        },
    });

    const [isReset, setIsReset] = useState(false);

    useFrame(() => {
        const { reset } = get();

        if(reset && !isReset) {
            setIsReset(true);
        } else if(!reset && isReset) {
            setIsReset(false);
        }
    });

    useEffect(() => {
        if(isReset) {
            console.log('reset');
        }
    }, [isReset]);

    return {
        LocalControl
    }
}
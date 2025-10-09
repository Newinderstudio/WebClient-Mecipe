import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useEffect, useRef, useState } from "react";
import { KeyboardLocalController } from "../../character/controllers/KeyboardLocalController";
import { TestPlayerController } from "../../character/controllers/TestPlayerController";

export default function usePlayersManagers({ gltfPath, isDraco }: { gltfPath: string, isDraco: boolean }) {
    const [, get] = useKeyboardControls();
    const threeState = useThree();
    const keyboardController = useRef<KeyboardLocalController>(null);
    const testPlayerControllersRef = useRef<Map<string,RefObject<TestPlayerController>>>(new Map());
    const [players, setPlayers] = useState<string[]>([]);
    const [isTest, setIsTest] = useState(false);

    const gltf = useGLTF(gltfPath, isDraco);

    useEffect(() => {
        if (!gltf || !threeState || keyboardController.current) return;
        const ctrl = new KeyboardLocalController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, { getKeyboarState: get });
    }, [gltf, threeState, get])

    useFrame(() => {
        const { test } = get();
        if (test && !isTest) {
            setIsTest(true);
        } else if (!test && isTest) {
            setIsTest(false);
        }
    });

    useEffect(() => {
        if (isTest) {
            console.log('test');
            const randomeId = Math.random().toString(36).substring(2, 15);
            setPlayers(prev => [...prev, randomeId]);
            const testPlayerController = new TestPlayerController();
            testPlayerController.initialize(threeState, {});
            testPlayerControllersRef.current.set(randomeId, { current: testPlayerController });
        }
    }, [setPlayers, isTest, threeState]);

    return {
        gltf,
        keyboardController,
        players,
        testPlayerControllersRef,
    }

}
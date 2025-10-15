import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardLocalController } from "../../Character/controllers/KeyboardLocalController";
import { RoomUser, useSocketStore } from "@/store/socket/store";
import { ClientMessage, BroadcastDatType } from "@/util/socket/socket-message-types";
import { WebSocketController } from "../../Character/controllers/WebSocketController";
import { CharacterBaseOptions, CharacterInitialPoint, CharacterOptions } from "../../Character/WorldPlayer";
import { Euler, Vector3 } from "three";

export interface PlayerInfo extends RoomUser {
    controller: RefObject<WebSocketController>;
}

export default function usePlayersManagers({ gltfPath, isDraco, characterOptions }: { gltfPath: string, isDraco: boolean, characterOptions: CharacterOptions | undefined }) {

    const [, get] = useKeyboardControls();
    const threeState = useThree();
    const keyboardController = useRef<KeyboardLocalController>(null);
    const dataBufferMapRef = useRef<Map<string, ClientMessage[]>>(new Map());
    // const [players, setPlayers] = useState<PlayerInfo[]>([]);

    const gltf = useGLTF(gltfPath, isDraco);

    // Zustand 올바른 사용법: 단일 값은 직접 반환
    const clientId = useSocketStore((state) => state.clientId);
    const users = useSocketStore((state) => state.users);
    const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
    const subsribeToRoomData = useSocketStore((state) => state.subscribeToRoomData);

    const initializeEnvironment = useSocketStore((state) => state.initializeEnvironment);

    const [players, setPlayers] = useState<PlayerInfo[]>([]);

    // const [characterInitialPointMap, setCharacterInitialPointMap] = useState<Map<string, CharacterInitialPoint>>(new Map());

    useEffect(() => {
        if (!gltf || !threeState || keyboardController.current) return;
        const ctrl = new KeyboardLocalController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, { getKeyboarState: get, broadcastPlayerTransform: broadcastPlayerTransform });
    }, [gltf, threeState, get, broadcastPlayerTransform])

    const getRoomDataCallback = useCallback((data: ClientMessage[]) => {
        data.forEach(item => {
            // 브로드 캐스트 데이터 중, 플레이어 위치 데이터만 처리
            if (item.type === BroadcastDatType.PLAYER_TRANSFORM && item.clientId != clientId) {
                dataBufferMapRef.current.set(item.clientId, [...(dataBufferMapRef.current.get(item.clientId) || []), item]);
            }
        });
    }, [clientId]);

    const characterInitialPoint: CharacterInitialPoint = useMemo(() => ({
        spawnPoint: characterOptions?.spawnPoint || new Vector3(0, 1.8, 0),
        rotation: characterOptions?.rotation || new Euler(0, 0, 0),
    }), [characterOptions]);

    const characterBaseOptions: CharacterBaseOptions = useMemo(() => ({
        height: characterOptions?.height || 1,
        radius: characterOptions?.radius || 0.2,
        playerJumpForce: characterOptions?.playerJumpForce || 10,
        playerSpeed: characterOptions?.playerSpeed || 6,
        rotationSpeed: characterOptions?.rotationSpeed || 0.2,
        scale: characterOptions?.scale || new Vector3(1, 1, 1),
        defaultAnimationClip: characterOptions?.defaultAnimationClip || "Idle",
    }), [characterOptions]);

    useEffect(() => {
        if (!getRoomDataCallback || !subsribeToRoomData) return;
        const disposeSubsribeToRoomData = subsribeToRoomData(getRoomDataCallback);
        return () => {
            disposeSubsribeToRoomData();
        }
    }, [subsribeToRoomData, getRoomDataCallback]);

    useEffect(() => {
        if (!users || !threeState || !clientId) return;

        setPlayers(prev => {

            const newUsers = users.filter(user => user.clientId !== clientId);

            return newUsers.map(user => {
                let playerControllerRef = prev.find(player => player.clientId === user.clientId)?.controller;
                if (!playerControllerRef) {
                    playerControllerRef = {current: new WebSocketController()}
                    playerControllerRef.current.initialize(threeState, { clientId: user.clientId, dataBufferMapRef: dataBufferMapRef});
                }

                const newPlayer = {
                    ...user,
                    controller: playerControllerRef
                }

                return newPlayer;
            })
        });
    }, [users, clientId, threeState, characterInitialPoint]);

    // 플레이어 입장 시, 로컬컬 플레이어 위치 브로드캐스트 전송
    useEffect(() => {
        if (!keyboardController.current || players.length === 0) return;
        const sendedMovementMessage = keyboardController.current?.getSendedMovementMessage();
        if (sendedMovementMessage) {
            broadcastPlayerTransform(sendedMovementMessage);
        }
    }, [players, broadcastPlayerTransform, keyboardController]);

    useEffect(() => {
        if (!initializeEnvironment || !getRoomDataCallback) return;
        const dataList: ClientMessage[] = [];
        initializeEnvironment.forEach(item => {
            if (item.type === BroadcastDatType.PLAYER_TRANSFORM) {
                dataList.push(item);

            }
        });

        getRoomDataCallback(dataList);
    }, [initializeEnvironment, getRoomDataCallback]);

    return {
        gltf,
        keyboardController,
        players,
        characterBaseOptions,
        characterInitialPoint,
    }

}
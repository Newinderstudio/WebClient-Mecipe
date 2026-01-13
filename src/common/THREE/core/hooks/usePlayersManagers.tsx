import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardLocalController } from "../../Character/controllers/KeyboardLocalController";
import { RoomUser, useSocketStore } from "@/store/socket/store";
import { ClientMessage, BroadcastDatType, UserJoinedResponse, UserLeftResponse, ReadRoomMemberResponse, PlayerTransformData } from "@/util/socket/socket-message-types";
import { WebSocketController } from "../../Character/controllers/WebSocketController";
import { CharacterBaseOptions, CharacterInitialPoint, CharacterOptions } from "../../Character/WorldPlayer";
import { Euler, Vector3 } from "three";

export interface PlayerInfo extends RoomUser {
    controller: RefObject<WebSocketController>;
    characterInitialPoint: CharacterInitialPoint;
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
    const subscribeToRoomData = useSocketStore((state) => state.subscribeToRoomData);
    const subscribeInitializeEnvironment = useSocketStore((state) => state.subscribeInitializeEnvironment);

    const addUser = useSocketStore((state) => state.addUser);
    const removeUser = useSocketStore((state) => state.removeUser);

    const [players, setPlayers] = useState<PlayerInfo[]>([]);

    const healthCheck = useSocketStore((state) => state.healthCheck);
    const restoreUsers = useSocketStore((state) => state.restoreUsers);

    
    const characterInitialPoint: CharacterInitialPoint = useMemo(() => ({
        spawnPoint: characterOptions?.spawnPoint || new Vector3(0, 1.8, 0),
        rotation: characterOptions?.rotation || new Euler(0, 0, 0),
    }), [characterOptions]);

    const [localInitialPoint, setLocalInitialPoint] = useState<CharacterInitialPoint>(characterInitialPoint);

    // 30초마다 헬스체크
    useEffect(() => {
        const interval = setInterval(() => {
            healthCheck().then((response) => {
                if (!response.success) {
                    console.error('Health check failed:', response.message);
                }
                else {
                    console.log('Health check passed:', response.message);
                }
            });
        }, 30000);
        return () => clearInterval(interval);
    }, [healthCheck]);



    // const [characterInitialPointMap, setCharacterInitialPointMap] = useState<Map<string, CharacterInitialPoint>>(new Map());
    useEffect(() => {
        if (!gltf || !threeState) return;
        
        // HMR 문제 해결: 기존 인스턴스가 있어도 재생성 (개발 모드에서만)
        if (keyboardController.current) {
            console.log('🔄 Recreating KeyboardLocalController due to HMR');
            // 기존 인스턴스 정리 (필요시)
            if (keyboardController.current.dispose) {
                keyboardController.current.dispose();
            }
        }
        
        const ctrl = new KeyboardLocalController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, { getKeyboarState: get, broadcastPlayerTransform: (transform) => { broadcastPlayerTransform(transform) } });
        console.log('✅ KeyboardLocalController initialized');
    }, [gltf, threeState, get, broadcastPlayerTransform])

    const handleRoomDataCallback = useCallback((data: ClientMessage[]) => {
        data.forEach(item => {
            if (item.clientId != clientId) {
                // 브로드 캐스트 데이터 중, 플레이어 위치 데이터만 처리
                if (item.type === BroadcastDatType.PLAYER_TRANSFORM) {
                    dataBufferMapRef.current.set(item.clientId, [...(dataBufferMapRef.current.get(item.clientId) || []), item]);
                }
                else if (item.type === BroadcastDatType.USER_JOINED) {
                    addUser({
                        clientId: (item.data as UserJoinedResponse)?.socketId as string,
                        sessionToken: (item.data as UserJoinedResponse)?.sessionToken as string,
                        joinedAt: (item.data as UserJoinedResponse)?.timestamp as string,
                    });
                }
                else if (item.type === BroadcastDatType.USER_LEFT) {
                    removeUser({
                        clientId: (item.data as UserLeftResponse)?.socketId as string,
                        sessionToken: (item.data as UserLeftResponse)?.sessionToken as string,
                        joinedAt: (item.data as UserLeftResponse)?.timestamp as string,
                    });
                }
                else if (item.type === BroadcastDatType.READ_ROOM_MEMBER) {
                    restoreUsers((item.data as ReadRoomMemberResponse)?.members as RoomUser[]);
                }
            }

        });
    }, [clientId, addUser, removeUser, restoreUsers]);

    const handleInitializeEnvironmentCallback = useCallback((data: ClientMessage[]) => {
        const newPlayers = players;
        data.forEach(item => {
            if (item.type === BroadcastDatType.PLAYER_TRANSFORM) {
                if (item.clientId === clientId) {
                    const pos = (item.data as PlayerTransformData).position;
                    const rot = (item.data as PlayerTransformData).rotation;
                    setLocalInitialPoint({ spawnPoint: new Vector3(pos.x, pos.y, pos.z), rotation: new Euler(rot.x, rot.y, rot.z) });
                    return;
                }
                const targetIndex = newPlayers.findIndex(player => player.clientId === item.clientId);
                if (targetIndex !== -1) {
                    const pos = (item.data as PlayerTransformData).position;
                    const rot = (item.data as PlayerTransformData).rotation;
                    newPlayers[targetIndex].characterInitialPoint.spawnPoint = new Vector3(pos.x, pos.y, pos.z);
                    newPlayers[targetIndex].characterInitialPoint.rotation = new Euler(rot.x, rot.y, rot.z);
                }
            }
        });
        setPlayers(newPlayers);
    }, [players, clientId]);

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
        if (!handleRoomDataCallback || !subscribeToRoomData) return;
        const disposeSubsribeToRoomData = subscribeToRoomData(handleRoomDataCallback);
        return () => {
            disposeSubsribeToRoomData();
        }
    }, [subscribeToRoomData, handleRoomDataCallback]);

    useEffect(() => {
        if (!subscribeInitializeEnvironment || !handleInitializeEnvironmentCallback) return;
        const disposeSubscribeInitializeEnvironment = subscribeInitializeEnvironment(handleInitializeEnvironmentCallback);
        return () => {
            disposeSubscribeInitializeEnvironment();
        }
    }, [subscribeInitializeEnvironment, handleInitializeEnvironmentCallback]);

    useEffect(() => {
        if (!users || !threeState || !clientId) return;

        setPlayers(prev => {

            const newUsers = users.filter(user => user.clientId !== clientId);

            return newUsers.map(user => {
                let playerControllerRef = prev.find(player => player.clientId === user.clientId)?.controller;
                if (!playerControllerRef) {
                    playerControllerRef = { current: new WebSocketController() }
                    playerControllerRef.current.initialize(threeState, { clientId: user.clientId, dataBufferMapRef: dataBufferMapRef });
                }

                const newPlayer = {
                    ...user,
                    controller: playerControllerRef,
                    characterInitialPoint: characterInitialPoint,
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

    return {
        gltf,
        keyboardController,
        players,
        characterBaseOptions,
        localInitialPoint,
    }

}
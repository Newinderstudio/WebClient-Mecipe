import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { KeyboardLocalController } from "../../character/controllers/KeyboardLocalController";
import { RoomUser, useSocketStore } from "@/store/socket/store";
import { RoomDataItem, RoomDataType } from "@/common/socket/types";
import { WebSocketController } from "../../character/controllers";

export default function usePlayersManagers({ gltfPath, isDraco }: { gltfPath: string, isDraco: boolean }) {
    const [, get] = useKeyboardControls();
    const threeState = useThree();
    const keyboardController = useRef<KeyboardLocalController>(null);
    const playerControllersRef = useRef<Map<string, RefObject<WebSocketController>>>(new Map());
    const dataBufferMapRef = useRef<Map<string, RoomDataItem[]>>(new Map());

    const [players, setPlayers] = useState<RoomUser[]>([]);

    const gltf = useGLTF(gltfPath, isDraco);

    // Zustand 올바른 사용법: 단일 값은 직접 반환
    const clientId = useSocketStore((state) => state.clientId);
    const users = useSocketStore((state) => state.users);
    const getPlayerTransforms = useSocketStore((state) => state.getPlayerTransforms);
    const broadcastPlayerTransform = useSocketStore((state) => state.broadcastPlayerTransform);
    const subsribeToRoomData = useSocketStore((state) => state.subscribeToRoomData);

    useEffect(() => {
        if (!gltf || !threeState || keyboardController.current) return;
        const ctrl = new KeyboardLocalController();
        keyboardController.current = ctrl;
        ctrl.initialize(threeState, { getKeyboarState: get, boradcastPlayerTransform: broadcastPlayerTransform});
    }, [gltf, threeState, get, broadcastPlayerTransform])

    const getRoomDataCallback = useCallback((data: RoomDataItem[]) => {
        data.forEach(item => {
            if (item.type === RoomDataType.PLAYER_TRANSFORM && item.clientId != clientId) {
                dataBufferMapRef.current.set(item.clientId, [...(dataBufferMapRef.current.get(item.clientId) || []), item]);
            }
        });
    }, [clientId]);

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

            const newUsers = users.filter(user => user.socketId !== clientId);

            const newUserList = newUsers.filter(user => !prev.includes(user));
            const leftUserList = prev.filter(user => !newUsers.includes(user));

            newUserList.forEach(user => {
                const playerController = new WebSocketController();
                playerController.initialize(threeState, { clientId: user.socketId, dataBufferMapRef: dataBufferMapRef });
                playerControllersRef.current.set(user.socketId, { current: playerController });
            });
            leftUserList.forEach(user => {
                playerControllersRef.current.delete(user.socketId);
            });

            console.log(newUsers);
            if(newUserList.length === 0 && leftUserList.length === 0) {
                return prev;
            }

            return newUsers;
        });
    }, [users, clientId, threeState, getPlayerTransforms]);


    return {
        gltf,
        keyboardController,
        players,
        testPlayerControllersRef: playerControllersRef,
    }

}
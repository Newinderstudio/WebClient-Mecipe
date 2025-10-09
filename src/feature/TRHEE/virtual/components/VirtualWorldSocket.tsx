import { useVirtualWorldSocket } from "./hooks/useVirtualWorldSocket";

export default function VirtualWorldSocket({ roomId , enabled = true }: { roomId: string, enabled?: boolean }) {

    // Socket 통신 설정
    useVirtualWorldSocket({
        roomId: roomId, // 원하는 roomId로 변경 가능
        enabled: enabled,
    });

    return null;
}
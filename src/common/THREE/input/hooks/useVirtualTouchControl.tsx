import { useVirtualControlsStore } from "@/store/THREE/virtualControlsStore";
import { JoystickState } from "../VirtualJoystick";

export default function useVirtualTouchControl() {
    // ✅ Virtual Controls Store
    const setJoystick = useVirtualControlsStore((state) => state.setJoystick);
    const setJump = useVirtualControlsStore((state) => state.setJump);

    const handleJoystickChange = (state: JoystickState) => {
        setJoystick(state);
    };

    const handleJumpPress = () => {
        setJump(true);
    };

    const handleJumpRelease = () => {
        setJump(false);
    };
    return {
        handleJoystickChange,
        handleJumpPress,
        handleJumpRelease,
    }
}
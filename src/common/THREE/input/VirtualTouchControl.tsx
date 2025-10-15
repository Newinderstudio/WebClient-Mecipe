import VirtualButton from "./VirtualButton";
import VirtualJoystick from "./VirtualJoystick";
import useVirtualTouchControl from "./hooks/useVirtualTouchControl";

export default function VirtualTouchControl() {

    const { handleJoystickChange, handleJumpPress, handleJumpRelease } = useVirtualTouchControl();

    return (
        <>
            <VirtualJoystick onJoystickChange={handleJoystickChange} size={120} />
            <VirtualButton
                label="점프"
                onPress={handleJumpPress}
                onRelease={handleJumpRelease}
                position="right"
                bottom="40px"
                right="40px"
                size={80}
            />
        </>
    )
}
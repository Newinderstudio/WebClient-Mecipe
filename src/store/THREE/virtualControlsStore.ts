import { create } from 'zustand';

export interface VirtualControlsState {
    // 조이스틱 상태
    joystick: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        x: number;
        y: number;
    };
    
    // 버튼 상태
    jump: boolean;
    
    // Actions
    setJoystick: (state: Partial<VirtualControlsState['joystick']>) => void;
    setJump: (pressed: boolean) => void;
    reset: () => void;
}

const initialJoystickState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    x: 0,
    y: 0,
};

export const useVirtualControlsStore = create<VirtualControlsState>((set) => ({
    joystick: initialJoystickState,
    jump: false,

    setJoystick: (newState) =>
        set((state) => ({
            joystick: { ...state.joystick, ...newState },
        })),

    setJump: (pressed) => set({ jump: pressed }),

    reset: () => set({ joystick: initialJoystickState, jump: false }),
}));


"use client"

import { create } from "zustand";
import { Object3D, Vector3 } from "three";

type RenderingState = { [key: string]: boolean }

interface ThreeState {
    headSocket: Object3D | null;
    gravity: Vector3;
    renderingState: RenderingState;
}

interface ThreeActions {
    setHeadSocket: (headSocket: Object3D) => void;
    setGravity: (gravity: Vector3) => void;
    setRenderingState: (renderingState: RenderingState) => void;
}

type ThreeStore = ThreeState & ThreeActions;

export const useThreeStore = create<ThreeStore>((set) => ({
    // Initial state
    headSocket: null,
    gravity: new Vector3(0, -9.81, 0),
    renderingState: {},

    // Actions
    setHeadSocket: (headSocket) => set({ headSocket }),
    
    setGravity: (gravity) => set({ gravity }),
    
    setRenderingState: (newRenderingState) => set((state) => ({
        renderingState: {
            ...state.renderingState,
            ...newRenderingState
        }
    })),
}));
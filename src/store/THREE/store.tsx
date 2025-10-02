"use client"

import { create } from "zustand";
import { Object3D, Vector3 } from "three";
import { CharacterAvatarProps } from "@/common/THREE/character/CharacterAvatar";

type RenderingState = { [key: string]: boolean }

interface ThreeState {
    headSocket: Object3D | null;
    gravity: Vector3;
    renderingState: RenderingState;
    characterNodes: { [key: string]: CharacterAvatarProps };
}

interface ThreeActions {
    setHeadSocket: (headSocket: Object3D) => void;
    setGravity: (gravity: Vector3) => void;
    setRenderingState: (renderingState: RenderingState) => void;
    addCharacterNodes: (id: string, characterNode: CharacterAvatarProps) => void;
    removeCharacterNodes: (id: string) => void;
}

type ThreeStore = ThreeState & ThreeActions;

export const useThreeStore = create<ThreeStore>((set) => ({
    // Initial state
    headSocket: null,
    gravity: new Vector3(0, -9.81, 0),
    renderingState: {},
    characterNodes: {},
    // Actions
    setHeadSocket: (headSocket) => set({ headSocket }),

    setGravity: (gravity) => set({ gravity }),

    setRenderingState: (newRenderingState) => set((state) => ({
        renderingState: {
            ...state.renderingState,
            ...newRenderingState
        }
    })),
    addCharacterNodes: (id: string, characterNode: CharacterAvatarProps) => set((state) => ({
        characterNodes: {
            ...state.characterNodes,
            [id]: characterNode
        }
    })),
    removeCharacterNodes: (id: string) => set((state) => {
        const newCharacterNodes = { ...state.characterNodes };
        delete newCharacterNodes[id];
        return { characterNodes: newCharacterNodes };
    })
}));
"use client"

import { createContext, useReducer, useContext } from "react";
import { Object3D, Vector3 } from "three";

type DispatchAction = {type:"SetGravity", payload: Vector3} | { type: "InitHeadSocket", payload: Object3D };
type StateType = { headSocket: Object3D | null, gravity: Vector3 }

const initialState: StateType = {
    headSocket: null,
    gravity: new Vector3(0, -9.81, 0),
};

// 추후 Provider를 사용하지 않았을 때에는 context의 값이 null이 되어야 하기때문에 null 값을 선언해준다.
const StateContext = createContext<StateType>(initialState)
const DispatchContext = createContext<((action: DispatchAction) => void)>(() => { })

export const useThreeStateContext = () => useContext(StateContext);
export const useThreeDispatchContext = () => useContext(DispatchContext);



const reducer = (state: StateType, action: DispatchAction) => {
    switch (action.type) {
        case "InitHeadSocket":
            return {
                ...state,
                headSocket: action.payload
            };
        case "SetGravity":
            return {
                ...state,
                gravity: action.payload
            };
        default:
            return state;
    }
};

export function ThreeContextProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (

        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>
                {children}
            </StateContext.Provider>
        </DispatchContext.Provider>

    );
}
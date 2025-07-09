import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from 'react-redux'
import type { AppState, AppDispatch } from "."

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
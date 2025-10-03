import { use, useEffect } from "react";
import { WorldRendererResult } from "../WorldRenderer";
import { useThree } from "@react-three/fiber";
import { PCFSoftShadowMap } from "three";

export default function useWorldRenderer({ promiseForRendererOptions }: { promiseForRendererOptions: Promise<WorldRendererResult> }) {

    const { gl } = useThree();

    useEffect(() => {
        gl.shadowMap.enabled = false;
        gl.shadowMap.type = PCFSoftShadowMap;
    }, [gl]);

    const result = use(promiseForRendererOptions);

    return {
        ...result,
    }
}
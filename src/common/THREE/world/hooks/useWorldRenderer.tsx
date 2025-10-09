import { use, useEffect } from "react";
import { WorldRendererResult } from "../WorldRenderer";
import { useThree } from "@react-three/fiber";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";
import { promiseForGLTFLoader } from "@/util/THREE/promiseForGLTFLoader";
// import { PCFSoftShadowMap } from "three";

export default function useWorldRenderer({ rendererProps }: { rendererProps?: WorldRendererProps }) {

    const result = use(new Promise<WorldRendererResult>(async (resolve, reject) => {
        if (typeof window === 'undefined' || !rendererProps) {
            return new Promise<WorldRendererResult>(() => {
                // 서버에서는 아무것도 하지 않음 (Suspense가 fallback 표시)
            });
        }

        try {

            const rendererGLTF = await promiseForGLTFLoader(rendererProps.worldGltfOptions.path, rendererProps.worldGltfOptions.isDraco);
            const rendererColliderGLTF = await promiseForGLTFLoader(rendererProps.colliderGltfOptions.path, rendererProps.colliderGltfOptions.isDraco);

            resolve({
                options: rendererProps,
                rendererScene: rendererGLTF.scene,
                rendererColliderScene: rendererColliderGLTF.scene,
            });
        }
        catch (error) {
            reject(error);
        }
    }));

    const { gl } = useThree();

    useEffect(() => {
        gl.shadowMap.enabled = false;
        // gl.shadowMap.type = PCFSoftShadowMap;
    }, [gl]);

    return {
        ...result,
    }
}
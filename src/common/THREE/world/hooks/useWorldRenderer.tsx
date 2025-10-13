import { use, useEffect, useMemo } from "react";
import { WorldRendererResult } from "../WorldRenderer";
import { useThree } from "@react-three/fiber";
import { WorldRendererProps } from "@/feature/TRHEE/virtual/components/hooks/useVirtualWorld";
import { promiseForGLTFLoader } from "@/util/THREE/promiseForGLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
// import { PCFSoftShadowMap } from "three";

export default function useWorldRenderer({ rendererProps, encrypted }: { rendererProps?: WorldRendererProps, encrypted?: boolean }) {

    // Promise를 캐시하여 매 렌더링마다 새로운 Promise가 생성되지 않도록 함
    const worldPromise = useMemo(() => {
        if (typeof window === 'undefined' || !rendererProps) {
            return new Promise<WorldRendererResult>(() => {
                // 서버에서는 아무것도 하지 않음 (Suspense가 fallback 표시)
            });
        }

        return (async () => {
            try {
                const rendererGLTF = await promiseForGLTFLoader(rendererProps.worldGltfOptions.path, rendererProps.worldGltfOptions.isDraco, {cache: true, encrypted});
                const rendererColliderGLTF = await promiseForGLTFLoader(rendererProps.colliderGltfOptions.path, rendererProps.colliderGltfOptions.isDraco, {cache: true, encrypted});

                // ✅ scene을 clone하여 read-only 문제 해결
                const clonedScene = SkeletonUtils.clone(rendererGLTF.scene);
                const clonedColliderScene = SkeletonUtils.clone(rendererColliderGLTF.scene);
                return {
                    options: rendererProps,
                    rendererScene: clonedScene,
                    rendererColliderScene: clonedColliderScene,
                };
            }
            catch (error) {
                console.error("❌ [useWorldRenderer] Error:", error);
                throw error;
            }
        })();
    }, [
        rendererProps,
        encrypted
    ]);

    const result = use(worldPromise);

    const { gl } = useThree();

    useEffect(() => {
        gl.shadowMap.enabled = false;
        // gl.shadowMap.type = PCFSoftShadowMap;
    }, [gl]);

    return {
        ...result,
    }
}
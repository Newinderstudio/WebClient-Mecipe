import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { WorldGltfOptions } from "@/feature/TRHEE/virtual/components/hooks/useVirtualWorld";
import { promiseForGLTFLoader } from "@/util/THREE/promiseForGLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { LoadedMeshProps } from "../LoadedMesh";
import { LoadedColliderProps } from "../LoadedCollider";

export default function useWorldRenderer({ rendererProps, encrypted }: { rendererProps: WorldGltfOptions, encrypted: boolean }) {

    const promiseForMeshRenderer = useMemo(() => {
        return new Promise<LoadedMeshProps>(async (resolve) => {
            try {
                const rendererGLTF = await promiseForGLTFLoader(rendererProps.worldGltfOptions.path, rendererProps.worldGltfOptions.isDraco, { cache: true, encrypted });

                // ✅ scene을 clone하여 read-only 문제 해결
                const clonedScene = SkeletonUtils.clone(rendererGLTF.scene);
                resolve({
                    scene: clonedScene,
                    isBatching: false,
                    isVisible: true,
                    enableShadows: false,
                    disableReflections: true,
                    enablePerformanceOptimization: false,
                });
            } catch (error) {
                console.error("❌ [useWorldRenderer] Error:", error);
                throw error;
            }
        });
    }, [rendererProps, encrypted]);

    const promiseForColliderRenderer = useMemo(() => {
        return new Promise<LoadedColliderProps>(async (resolve) => {
            try {
                const rendererGLTF = await promiseForGLTFLoader(rendererProps.colliderGltfOptions.path, rendererProps.colliderGltfOptions.isDraco, { cache: true, encrypted });

                // ✅ scene을 clone하여 read-only 문제 해결
                const clonedScene = SkeletonUtils.clone(rendererGLTF.scene);
                resolve({
                    scene: clonedScene,
                    isBatching: true,
                });
            } catch (error) {
                console.error("❌ [useWorldRenderer] Error:", error);
                throw error;
            }
        });
    }, [rendererProps, encrypted]);


    const { gl } = useThree();

    useEffect(() => {
        gl.shadowMap.enabled = false;
        // gl.shadowMap.type = PCFSoftShadowMap;
    }, [gl]);

    return {
        promiseForMeshRenderer,
        promiseForColliderRenderer,
    }
}
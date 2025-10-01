import { WorldRendererProps } from "@/feature/TRHEE/virtual/hooks/useVirtualWorldScreen";
import { promiseForGLTFLoader } from "@/util/THREE/three-js-function";
import { use, useMemo } from "react";
import { Group } from "three";

export default function useWorldRenderer({ rendererOptions }: { rendererOptions?: WorldRendererProps }) {

    const promiseForOption = useMemo(() => {
        return new Promise<WorldRendererProps>((resolve, reject) => {
            if (!rendererOptions) reject("rendererOptions is not defined");
            resolve(rendererOptions as WorldRendererProps);
        });
    }, [rendererOptions]);

    const option = use<WorldRendererProps>(promiseForOption);

    const rendererScene = use<Group>(promiseForGLTFLoader(option.worldGltfOptions.path, option.worldGltfOptions.isDraco));

    const rendererColliderScene = use<Group>(promiseForGLTFLoader(option.colliderGltfOptions.path, option.colliderGltfOptions.isDraco));

    return {
        option,
        rendererScene,
        rendererColliderScene,
    }
    // return { rendererOptions };
}
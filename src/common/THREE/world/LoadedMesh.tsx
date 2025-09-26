import { getBatchedScene, setDisableReflections, setEnableReflections } from "@/util/THREE/three-js-function";
import { useCallback } from "react";
import { Group, Material, Mesh } from "three";


const LoadedMesh = ({ scene, isBatching, isVisible, enableShadows, disableReflections }: {
    scene: Group;
    isBatching: boolean;
    isVisible: boolean;
    enableShadows: boolean;
    disableReflections: boolean;
}) => {

    const RenderScene = useCallback(()=>{
        const targetScene = isBatching ? getBatchedScene(scene) : scene;
        const meaterials = new Set<Material>();
        targetScene.children.forEach((node) => {
            node.receiveShadow = node.castShadow = enableShadows;
            node.visible = isVisible;
            if (node instanceof Mesh && node.material) meaterials.add(node.material);
        })
        if (disableReflections) setDisableReflections(Array.from(meaterials));
        else setEnableReflections(Array.from(meaterials));

        return targetScene;
    }, [scene, enableShadows, isVisible, disableReflections, isBatching])

    return <primitive object={RenderScene()} />;
};

export default LoadedMesh;
import { getBatchedScene, setDisableReflections, setEnableReflections } from "@/util/THREE/three-js-function";
import { useMemo } from "react";
import { Group, Material, Mesh } from "three";


function LoadedMesh({ scene, isBatching, isVisible, enableShadows, disableReflections }: {
    scene: Group;
    isBatching: boolean;
    isVisible: boolean;
    enableShadows: boolean;
    disableReflections: boolean;
}) {

    const renderScene = useMemo(() => {
        const targetScene = isBatching ? getBatchedScene(scene) : scene;
        const meaterials = new Set<Material>();
        targetScene.children.forEach((node) => {
            node.receiveShadow = node.castShadow = enableShadows;
            if (node instanceof Mesh && node.material) meaterials.add(node.material);
        });

        if (disableReflections) setDisableReflections(Array.from(meaterials));
        else setEnableReflections(Array.from(meaterials));

        console.log('[LoadedMesh] renderScene children length:', targetScene.children.length);

        return targetScene;
    }, [scene, enableShadows, disableReflections, isBatching])

    // return <primitive object={renderScene} />;
    return <group visible={isVisible}>
        <primitive object={renderScene} />
    </group>
}

export default LoadedMesh;
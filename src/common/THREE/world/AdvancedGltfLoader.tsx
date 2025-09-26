import { getBatchedScene, setDisableReflections, setEnableReflections } from "@/util/THREE/three-js-function";
import { useGLTF } from "@react-three/drei";
import { useCallback } from "react";
import { Vector3, Euler, Mesh, Group, Material } from "three";

export interface AdvancedGltfLoaderOptions {
    position: Vector3
    rotation: Euler;
    scale: Vector3;

    isBatching: boolean;
    isDraco: boolean;
    isVisible: boolean;

    disableReflections: boolean;
    enableShadows: boolean;
}

export interface AdvancedGltfLoaderProps {
    gltfPath: string;
    options?: Partial<AdvancedGltfLoaderOptions>;
}
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

const AdvancedGltfLoader = ({ gltfPath, options }: AdvancedGltfLoaderProps) => {
    const gltf = useGLTF(gltfPath, options?.isDraco);
    return (
        <group
            position={options?.position ?? new Vector3()}
            rotation={options?.rotation ?? new Euler()}
            scale={options?.scale ?? new Vector3(1, 1, 1)}
        >
            {gltf.scene && (
                <LoadedMesh
                    scene={gltf.scene}
                    isBatching={options?.isBatching ?? false}
                    isVisible={options?.isVisible === undefined ? true : options?.isVisible}
                    enableShadows={options?.enableShadows ?? true}
                    disableReflections={options?.disableReflections ?? false}
                />
            )}
        </group>
    );
};

export default AdvancedGltfLoader;
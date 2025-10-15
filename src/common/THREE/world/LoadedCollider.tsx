import { getSimpleBatchedSceneGroupByMaterial } from "@/util/THREE/three-js-function";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { TrimeshArgs, TrimeshCollider, TrimeshColliderProps } from "@react-three/rapier";
import { useMemo } from "react";
import { BufferGeometry, Mesh, Object3D } from "three";

export interface LoadedColliderProps {
    scene: Object3D;
    isBatching: boolean;
}

type TrimeshArgsWithName = [...TrimeshArgs, string];

function LoadedCollider({ scene, isBatching }: LoadedColliderProps) {

    const triArgs = useMemo(() => {
        if (!scene || isBatching === undefined) return;

        console.log('Computing trimesh colliders...');
        
        const targetScene = isBatching ? getSimpleBatchedSceneGroupByMaterial(scene, ['OuterCollider']) : scene;

        const meshes: Mesh[] = [];
        targetScene.traverse((node) => {
            if (node instanceof Mesh && node.geometry instanceof BufferGeometry) {
                meshes.push(node);
            }
        });

        const args: TrimeshArgsWithName[] = meshes.map((node) => {

            const nodeName = node.name;
            // 중요: geometry를 clone해서 원본을 변형하지 않음!
            const geometry = node.geometry.clone();
            geometry.applyMatrix4(node.matrixWorld);
            
            const position = geometry.attributes.position;
            const index = geometry.getIndex();
            const vertices = new Float32Array(position.array);
            const indices = index ? new Uint32Array(index.array) : new Uint32Array(0);
            
            // 메모리 정리
            geometry.dispose();
            
            return [vertices, indices, nodeName];
        });

        return args;
    }, [scene, isBatching]);

    const colliders = useMemo(() => {
        return triArgs?.map((triArg, index) => {
            const [vertices, indices, nodeName] = triArg;

            const collisionGroups = nodeName == 'OuterCollider' ? 
            colliderGroup(ColliderGroupType.Barrier, ColliderGroupType.Player)
            : colliderGroup(ColliderGroupType.Default, ColliderGroupType.Player);

            const props: TrimeshColliderProps = {
                args: [vertices, indices],
                collisionGroups: collisionGroups
            };
            return <TrimeshCollider key={index} {...props} />
        });
    }, [triArgs]);

    return (
        <group>
            {colliders}
        </group>
    );
}

export default LoadedCollider;
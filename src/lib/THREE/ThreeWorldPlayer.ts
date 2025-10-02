import { promiseForGLTFLoader } from "@/util/THREE/three-js-function";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import RAPIER, { Collider, KinematicCharacterController, Quaternion, Vector3, World } from "@dimforge/rapier3d-compat";
import THREE, { Group } from "three";

export default class ThreeWorldPlayer {
    private world: World;
    private characterController: KinematicCharacterController;
    private collider: Collider;
    private collisionGroup: ColliderGroupType;
    private collisionMask: ColliderGroupType;
    private playerBody?: Group;

    constructor(
        world: World,
        gltfOptions: ThreeWorldPlayerGltfOptions,
        bodyOptions?: Partial<ThreeWorldPlayerBodyOptions>,
        controllerOptions?: Partial<ThreeWorldPlayerControllerOptions>,
        collistionGroup?: Partial<ThreeWorldPlayerCollisionGroupOptions>
    ) {

        const ctrlOpt = {
            offset: 0.01,
            mass: 3,
            slopeClimbAngle: Math.PI / 4,
            slopeSlideAngle: Math.PI / 4,
            ...controllerOptions
        };

        const bodyOpt = {
            height: 1.8,
            radius: 0.5,
            spawnPoint: new Vector3(0, 1.8, 0),
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: new Vector3(1, 1, 1),
            ...bodyOptions
        };

        const colCroup = {
            collisionGroup: ColliderGroupType.Player,
            collisionMask: ColliderGroupType.Default,
            ...collistionGroup
        };

        this.world = world;
        this.characterController = this.createCharacterController(world,ctrlOpt);

        this.collisionGroup = colCroup.collisionGroup;
        this.collisionMask = colCroup.collisionMask;
        this.collider = this.crateCollider(world, bodyOpt, ctrlOpt, colCroup);

        this.initBody(world, gltfOptions, bodyOpt);
    }

    public moveDirection(direction: THREE.Vector3, delta: number) {
        const gravity = this.world.gravity;
        // 중력 및 델타 타임 적용
        const movement = direction.clone().add(gravity).multiplyScalar(delta);

        // CharacterController로 충돌 계산
        this.characterController.computeColliderMovement(
            this.collider,
            movement,
            undefined, // filterFlags
            colliderGroup(this.collisionGroup, this.collisionMask) // filterGroups
        );

        this.world.step();

        // 보정된 이동량 가져오기
        const correctedMovement = this.characterController.computedMovement();

        // 실제 collider 위치 업데이트
        const currentPos = this.collider.translation();
        const newPos = new Vector3(
            currentPos.x + correctedMovement.x,
            currentPos.y + correctedMovement.y,
            currentPos.z + correctedMovement.z
        );
        this.collider.setTranslation(newPos);
        if (this.playerBody) {
            this.playerBody.position.set(newPos.x, newPos.y, newPos.z);
        }
    }

    private async initBody(world: World, gltfOptions: ThreeWorldPlayerGltfOptions, bodyOpt: ThreeWorldPlayerBodyOptions) {
        const gltfScene = await promiseForGLTFLoader(gltfOptions.gltfPath, gltfOptions.isDraco);

        this.playerBody = gltfScene;
        this.playerBody.position.set(bodyOpt.spawnPoint.x, bodyOpt.spawnPoint.y, bodyOpt.spawnPoint.z);
        this.playerBody.rotation.set(bodyOpt.rotation.x, bodyOpt.rotation.y, bodyOpt.rotation.z);
        this.playerBody.scale.set(bodyOpt.scale.x, bodyOpt.scale.y, bodyOpt.scale.z);
    }

    private createCharacterController(world: World, ctrlOpt: ThreeWorldPlayerControllerOptions) {
        const characterController = world.createCharacterController(ctrlOpt.offset);
        characterController.setCharacterMass(ctrlOpt.mass);
        characterController.setMaxSlopeClimbAngle(ctrlOpt.slopeClimbAngle);
        characterController.setMinSlopeSlideAngle(ctrlOpt.slopeSlideAngle);
        return characterController;
    }

    private crateCollider(world: World, bodyOpt: ThreeWorldPlayerBodyOptions, ctrlOpt: ThreeWorldPlayerControllerOptions, collistionGroup: ThreeWorldPlayerCollisionGroupOptions) {
        const colliderDesc = RAPIER.ColliderDesc.capsule(
            (bodyOpt.height - ctrlOpt.offset) / 2 - bodyOpt.radius,
            bodyOpt.radius
        ).setTranslation(
            bodyOpt.spawnPoint.x,
            bodyOpt.spawnPoint.y,
            bodyOpt.spawnPoint.z
        ).setRotation(
            bodyOpt.rotation
        ).setCollisionGroups(colliderGroup(collistionGroup.collisionGroup, collistionGroup.collisionMask))
        .setSolverGroups(colliderGroup(collistionGroup.collisionGroup, collistionGroup.collisionMask));

        return world.createCollider(colliderDesc);
    }

    public getPlayerBody() {
        return this.playerBody;
    }

    public getIsGrounded() {
        return this.characterController.computedGrounded();
    }

    public dispose() {
        this.characterController.free();
    }

    public getPlayerPosition() {
        return this.collider.translation();
    }
}

export interface ThreeWorldPlayerGltfOptions {
    gltfPath: string;
    isDraco: boolean;
}

export interface ThreeWorldPlayerBodyOptions {
    height: number;
    radius: number;
    spawnPoint: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

export interface ThreeWorldPlayerControllerOptions {
    offset: number;
    mass: number;
    slopeClimbAngle: number;
    slopeSlideAngle: number;
}

export interface ThreeWorldPlayerCollisionGroupOptions {
    collisionGroup: number;
    collisionMask: number;
}
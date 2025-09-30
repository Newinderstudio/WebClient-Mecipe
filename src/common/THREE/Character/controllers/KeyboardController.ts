import { Vector3 } from "three";
import { IController, MovementInput } from "./IController";
import { RootState } from "@react-three/fiber";
import { CharacterManagerOptions } from "@/common/THREE/core/CharacterManager";
import { RapierContext, RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import * as RAPIER from "@dimforge/rapier3d-compat"
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export interface KeyboardControllerProps {
  rapier: RapierContext
  getKeyboarState: () => KeyboardControlsState<string>
}

export class KeyboardController implements IController<KeyboardControllerProps> {
  private enabled: boolean = true;
  private keys: Set<string> = new Set();
  private direction = new Vector3()
  private frontVector = new Vector3()
  private sideVector = new Vector3()
  private rotation = new Vector3()

  private movementInput: MovementInput = {
    direction: new Vector3(),
  };

  private rootState?: RootState;
  private options?: CharacterManagerOptions;

  initialize(rootState: RootState, options: CharacterManagerOptions): void {
    this.rootState = rootState;
    this.options = options;
  }

  dispose(): void {

  }

  getMovementInput(ref: RefObject<RapierRigidBody | null>, {getKeyboarState, rapier}: KeyboardControllerProps): MovementInput {

    if(!this.rootState || !this.options || !ref.current) return this.movementInput;

    const { forward:forwardTrigger, backward:backwardTrigger, left:leftTrigger, right:rightTrigger, jump:jumpTrigger } = getKeyboarState();

    const forward = forwardTrigger ? 1 : 0;
    const backward = backwardTrigger ? 1 : 0;
    const left = leftTrigger ? 1 : 0;
    const right = rightTrigger ? 1 : 0;

    const direction = new Vector3();

    this.frontVector.set(0, 0, backward - forward)
    this.sideVector.set(left - right, 0, 0)
    direction.subVectors(this.frontVector, this.sideVector).normalize().multiplyScalar(this.options.playerSpeed).applyEuler(this.rootState.camera.rotation)

    direction.y = ref.current.linvel().y;

    // jumping
    const world = rapier.world;
    const translation = ref.current.translation();
    const ray = world.castRayAndGetNormal(new RAPIER.Ray(translation, { x: 0, y: -1, z: 0 }), this.options.height, true, undefined, colliderGroup(ColliderGroupType.Default, ColliderGroupType.Default));
    const grounded = ray && ray.collider && ray.timeOfImpact <= this.options.height/2+0.01;

    if(jumpTrigger && grounded) {
      direction.add(new Vector3(0, this.options.playerJumpForce, 0));
    }

    this.movementInput.direction = direction;

    return this.movementInput;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.movementInput = {
        direction: new Vector3(),
      };
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

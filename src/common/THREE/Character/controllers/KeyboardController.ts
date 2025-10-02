import { Vector3 } from "three";
import { IController, MovementInput, PlayerInterface } from "./IController";
import { RootState } from "@react-three/fiber";
import { CharacterManagerOptions } from "@/common/THREE/core/CharacterManager";

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export interface KeyboardControllerProps {
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

  getMovementInput(player: PlayerInterface, {getKeyboarState}: KeyboardControllerProps): MovementInput {

    if(!this.rootState || !this.options) return this.movementInput;

    const { forward:forwardTrigger, backward:backwardTrigger, left:leftTrigger, right:rightTrigger, jump:jumpTrigger } = getKeyboarState();

    const forward = forwardTrigger ? 1 : 0;
    const backward = backwardTrigger ? 1 : 0;
    const left = leftTrigger ? 1 : 0;
    const right = rightTrigger ? 1 : 0;

    const direction = new Vector3();

    this.frontVector.set(0, 0, backward - forward)
    this.sideVector.set(left - right, 0, 0)
    direction.subVectors(this.frontVector, this.sideVector).normalize().multiplyScalar(this.options.playerSpeed).applyEuler(this.rootState.camera.rotation)

    // jumping - 별도 처리
    if(jumpTrigger && player.getIsGrounded() && player.startJump) {
      console.log('Starting jump with force:', this.options.playerJumpForce);
      player.startJump(this.options.playerJumpForce);
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

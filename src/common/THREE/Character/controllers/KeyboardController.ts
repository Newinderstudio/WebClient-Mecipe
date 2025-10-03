import { Euler, Vector3 } from "three";
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
    rotation: new Euler(),
  };

  private rootState?: RootState;
  private options?: CharacterManagerOptions;

  initialize(rootState: RootState, options: CharacterManagerOptions): void {
    this.rootState = rootState;
    this.options = options;
  }

  dispose(): void {

  }

  getMovementInput(player: PlayerInterface, { getKeyboarState }: KeyboardControllerProps): MovementInput {

    if (!this.rootState || !this.options) return this.movementInput;

    const { forward: forwardTrigger, backward: backwardTrigger, left: leftTrigger, right: rightTrigger, jump: jumpTrigger } = getKeyboarState();

    // 키 입력 별 방향
    const forward = forwardTrigger ? 1 : 0;
    const backward = backwardTrigger ? 1 : 0;
    const left = leftTrigger ? 1 : 0;
    const right = rightTrigger ? 1 : 0;

    const direction = new Vector3();

    this.frontVector.set(0, 0, backward - forward)
    this.sideVector.set(left - right, 0, 0)
    direction.subVectors(this.frontVector, this.sideVector).normalize().multiplyScalar(this.options.playerSpeed).applyEuler(this.rootState.camera.rotation)

    // jumping - 별도 처리
    if (jumpTrigger && player.getIsGrounded() && player.startJump) {
      player.startJump(this.options.playerJumpForce);
    }
    this.movementInput.direction = direction;

    // 플레이어 회전 처리 (이동 방향에 맞게)
    if (direction.length() > 0.01) {
      // 이동 방향으로부터 Y축 회전 각도 계산
      const targetRotationY = Math.atan2(direction.x, direction.z);

      // 부드러운 회전을 위해 현재 회전에서 목표 회전으로 보간
      const currentRotationY = player.getPlayerRotation().y;

      // 각도 차이를 최소화 (0~2π 범위에서)
      let angleDiff = targetRotationY - currentRotationY;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      // 설정 가능한 회전 속도로 부드러운 회전 적용
      const rotationSpeed = this.options.rotationSpeed || 0.15;
      const newRotationY = currentRotationY + angleDiff * rotationSpeed;

      this.movementInput.rotation = new Euler(0, newRotationY, 0);
    }

    return this.movementInput;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.movementInput = {
        direction: new Vector3(),
        rotation: new Euler(),
      };
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

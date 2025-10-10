import { Euler, Vector3 } from "three";
import { IController, MovementInput, PlayerControlInterface } from "./IController";
import { RootState } from "@react-three/fiber";
import { PlayerTransformData } from "@/common/socket/types";

type KeyboardControlsState<T extends string = string> = {
  [K in T]: boolean;
};

export interface KeyboardControllerProps {
  getKeyboarState: () => KeyboardControlsState<string>
  boradcastPlayerTransform: (transform: { position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } }) => void
}

export class KeyboardLocalController implements IController<KeyboardControllerProps> {
  private enabled: boolean = true;
  private keys: Set<string> = new Set();
  private frontVector = new Vector3()
  private sideVector = new Vector3()

  private movementInput: MovementInput = {
    direction: new Vector3(),
    rotation: new Euler(),
    jump: false,
    speed: 0,
  };

  private sendedMovementMessage: PlayerTransformData = {
    speed: 0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  private jumpTrigger = false;

  private rootState?: RootState;
  private options?: KeyboardControllerProps;

  initialize(rootState: RootState, options: KeyboardControllerProps): void {
    this.rootState = rootState;
    this.options = options;
  }

  dispose(): void {

  }

  getMovementInput(curPosition: Vector3, curRotation: Euler): MovementInput {

    if (!this.rootState || !this.options) return this.movementInput;

    const { forward: forwardTrigger, backward: backwardTrigger, left: leftTrigger, right: rightTrigger, jump: jumpTrigger } = this.options.getKeyboarState();

    // 키 입력 별 방향
    const forward = forwardTrigger ? 1 : 0;
    const backward = backwardTrigger ? 1 : 0;
    const left = leftTrigger ? 1 : 0;
    const right = rightTrigger ? 1 : 0;

    const direction = new Vector3();

    this.frontVector.set(0, 0, backward - forward)
    this.sideVector.set(left - right, 0, 0)
    direction.subVectors(this.frontVector, this.sideVector).normalize().applyEuler(this.rootState.camera.rotation)

    // jumping - 별도 처리
    if (jumpTrigger) {
      if (!this.jumpTrigger) {
        this.movementInput.jump = true;
        this.jumpTrigger = true;
      } else {
        this.movementInput.jump = false;
      }
    } else {
      this.jumpTrigger = false;
      this.movementInput.jump = false;
    }

    direction.y = 0;

    this.movementInput.direction = direction;

    let newRotationY = curRotation.y;
    if (direction.length() > 0.01) {
      // 이동 방향으로부터 Y축 회전 각도 계산
      const targetRotationY = Math.atan2(direction.x, direction.z);

      // 부드러운 회전을 위해 현재 회전에서 목표 회전으로 보간
      const currentRotationY = curRotation.y;

      // 각도 차이를 최소화 (0~2π 범위에서)
      let angleDiff = targetRotationY - currentRotationY;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      // 설정 가능한 회전 속도로 부드러운 회전 적용
      const rotationSpeed = 0.15;
      newRotationY = currentRotationY + angleDiff * rotationSpeed;
    }

    this.movementInput.rotation = new Euler(0, newRotationY, 0);
    this.movementInput.speed = this.movementInput.direction.length();

    return this.movementInput;
  }

  postMovementProcess(playerControl: PlayerControlInterface): void {

    if (!this.options || !playerControl) return;
    const curPosition = playerControl.getPosition();
    const curRotation = playerControl.getRotation();

    if (this.sendedMovementMessage.position.x !== curPosition.x 
      || this.sendedMovementMessage.position.y !== curPosition.y 
      || this.sendedMovementMessage.position.z !== curPosition.z 
      || this.sendedMovementMessage.rotation.x !== curRotation.x 
      || this.sendedMovementMessage.rotation.y !== curRotation.y 
      || this.sendedMovementMessage.rotation.z !== curRotation.z
      || this.sendedMovementMessage.speed !== this.movementInput.speed
    ) {
      this.sendedMovementMessage = {
        speed: this.movementInput.direction.length(),
        position: { x: curPosition.x, y: curPosition.y, z: curPosition.z },
        rotation: { x: curRotation.x, y: curRotation.y, z: curRotation.z },
      };
    }
    else {
      return;
    }

    this.options.boradcastPlayerTransform(this.sendedMovementMessage);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.movementInput = {
        direction: new Vector3(),
        rotation: new Euler(),
        jump: false,
        speed: 0,
      };
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getSendedMovementMessage(): PlayerTransformData {
    return this.sendedMovementMessage;
  }
}

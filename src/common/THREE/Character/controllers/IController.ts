
import { RootState } from "@react-three/fiber";
import { Euler, Vector3 } from "three";

export interface PlayerInterface {
  getPlayerPosition: () => Vector3;
  getIsGrounded: () => boolean;
  getPlayerRotation: () => Euler;
  startJump: (force?: number) => void;
  updateAnimator: (delta: number) => void;
  playAnimator: (animationClipName: string, isForce?: boolean) => void;
}

export interface MovementInput {
  direction: Vector3;
  rotation: Euler;
  jump: boolean;
  speed: number;
}

export interface PlayerControlInterface {
  setPosition: (position: Vector3) => void;
  setRotation: (rotation: Euler) => void;

  getPosition: () => Vector3;
  getRotation: () => Euler;
}

export interface IController<T> {
  /**
   * 컨트롤러 초기화
   */
  initialize(rootState: RootState, options: T): void;
  
  /**
   * 컨트롤러 정리
   */
  dispose(): void;
  
  /**
   * 현재 프레임의 입력 상태를 반환
   */
  getMovementInput(curPosition: Vector3, curRotation: Euler): MovementInput;

  postMovementProcess(playerControl: PlayerControlInterface): void;
  
  /**
   * 컨트롤러 활성화/비활성화
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * 컨트롤러 활성화 상태 확인
   */
  isEnabled(): boolean;
}

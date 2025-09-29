import { Vector3 } from "three";

export interface MovementInput {
  direction: Vector3;
  jump: boolean;
  run: boolean;
}

export interface IController {
  /**
   * 컨트롤러 초기화
   */
  initialize(): void;
  
  /**
   * 컨트롤러 정리
   */
  dispose(): void;
  
  /**
   * 현재 프레임의 입력 상태를 반환
   */
  getMovementInput(): MovementInput;
  
  /**
   * 컨트롤러 활성화/비활성화
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * 컨트롤러 활성화 상태 확인
   */
  isEnabled(): boolean;
}


import { RootState } from "@react-three/fiber";
import { RefObject } from "react";
import { RapierCollider } from "@react-three/rapier";
import { Vector3 } from "three";
import { CharacterManagerOptions } from "../../core/CharacterManager";

export interface MovementInput {
  direction: Vector3;
}

export interface IController<T> {
  /**
   * 컨트롤러 초기화
   */
  initialize(rootState: RootState, options: CharacterManagerOptions): void;
  
  /**
   * 컨트롤러 정리
   */
  dispose(): void;
  
  /**
   * 현재 프레임의 입력 상태를 반환
   */
  getMovementInput(ref: RefObject<RapierCollider | null>, props: T): MovementInput;
  
  /**
   * 컨트롤러 활성화/비활성화
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * 컨트롤러 활성화 상태 확인
   */
  isEnabled(): boolean;
}

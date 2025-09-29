import { Vector3 } from "three";
import { IController, MovementInput } from "./IController";

export class KeyboardController implements IController {
  private enabled: boolean = true;
  private keys: Set<string> = new Set();
  private movementInput: MovementInput = {
    direction: new Vector3(),
    jump: false,
    run: false,
  };

  initialize(): void {
    this.addEventListeners();
  }

  dispose(): void {
    this.removeEventListeners();
  }

  private addEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;
    
    this.keys.add(event.code);
    this.updateMovementInput();
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.enabled) return;
    
    this.keys.delete(event.code);
    this.updateMovementInput();
  };

  private updateMovementInput(): void {
    const direction = new Vector3();
    
    // WASD 또는 화살표 키로 이동
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
      direction.z -= 1;
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      direction.z += 1;
    }
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
      direction.x -= 1;
    }
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
      direction.x += 1;
    }

    // 정규화
    if (direction.length() > 0) {
      direction.normalize();
    }

    this.movementInput = {
      direction,
      jump: this.keys.has('Space'),
      run: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
    };
  }

  getMovementInput(): MovementInput {
    return this.movementInput;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.movementInput = {
        direction: new Vector3(),
        jump: false,
        run: false,
      };
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

import { RootState } from "@react-three/fiber";
import { Vector3, Euler } from "three";
import { IController, MovementInput, PlayerControlInterface } from "./IController";
import { PlayerTransformData, ClientMessage, BroadcastDatType } from "@/util/socket/socket-message-types";
import { RefObject } from "react";

export interface WebSocketControllerProps {
  clientId: string;
  dataBufferMapRef: RefObject<Map<string, ClientMessage[]>>;
}


export class WebSocketController implements IController<WebSocketControllerProps> {
    private options?: WebSocketControllerProps;
    private enabled: boolean = true;
    private recievedMovementMessage: PlayerTransformData = {
      speed: 0,
      position: {x: 0, y: 0, z: 0},
      rotation: {x: 0, y: 0, z: 0},
    };

    initialize(rootState: RootState, options: WebSocketControllerProps): void {
        this.options = options;
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    getMovementInput(curPosition: Vector3): MovementInput {
      if (!this.options) return {
        direction: new Vector3(),
        rotation: new Euler(),
        jump: false,
        speed: 0,
      };
      const playerTransform = this.getRemoteTransformData();
      if (!playerTransform) return {
        direction: new Vector3(),
        rotation: new Euler(),
        jump: false,
        speed: 0,
      };

      return {
        direction: new Vector3(playerTransform.position.x, playerTransform.position.y, playerTransform.position.z).sub(curPosition), //.normalize().multiplyScalar(playerTransform.speed),
        rotation: new Euler(playerTransform.rotation.x, playerTransform.rotation.y, playerTransform.rotation.z),
        jump: false,
        speed: playerTransform.speed,
      };
    }
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
    isEnabled(): boolean {
        return this.enabled;
    }

    private getRemoteTransformData(): PlayerTransformData|null {
      if(!this.options) return null;
      const myBuffers = this.options.dataBufferMapRef.current.get(this.options.clientId)?.filter(item => item.type === BroadcastDatType.PLAYER_TRANSFORM);
      if(!myBuffers) return this.recievedMovementMessage;
      this.options.dataBufferMapRef.current.delete(this.options.clientId);
      this.recievedMovementMessage = myBuffers.length > 0 ? myBuffers[myBuffers.length - 1].data as PlayerTransformData : this.recievedMovementMessage;
      return this.recievedMovementMessage;
    }
    postMovementProcess(playerControl: PlayerControlInterface): void {
      if (!this.options || !playerControl) return;

      const curPosition = playerControl.getPosition();
      const recievedPosition = new Vector3(this.recievedMovementMessage.position.x, this.recievedMovementMessage.position.y, this.recievedMovementMessage.position.z);
      const recievedRotationForCompare = new Vector3(this.recievedMovementMessage.rotation.x, this.recievedMovementMessage.rotation.y, this.recievedMovementMessage.rotation.z);

      if(recievedPosition.distanceTo(curPosition) > 3) {
        playerControl.setPosition(recievedPosition);
      }
      if(recievedRotationForCompare.distanceTo(new Vector3(curPosition.x, curPosition.y, curPosition.z)) > 0.1) {
        playerControl.setRotation(new Euler(this.recievedMovementMessage.rotation.x, this.recievedMovementMessage.rotation.y, this.recievedMovementMessage.rotation.z));
      }

    }
}
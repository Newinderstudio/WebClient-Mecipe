import { Vector3 } from "three";
import { IController, MovementInput } from "./IController";

export interface WebSocketMovementMessage {
  type: 'movement';
  direction: {
    x: number;
    y: number;
    z: number;
  };
}

export class WebSocketController implements IController<WebSocketMovementMessage> {
  private enabled: boolean = true;
  private websocket: WebSocket | null = null;
  private movementInput: MovementInput = {
    direction: new Vector3(),
  };

  constructor(websocketUrl?: string) {
    if (websocketUrl) {
      this.connect(websocketUrl);
    }
  }

  initialize(): void {
    // WebSocket 연결이 이미 있다면 초기화 완료
  }

  dispose(): void {
    this.disconnect();
  }

  connect(url: string): void {
    this.disconnect();
    
    this.websocket = new WebSocket(url);
    
    this.websocket.onopen = () => {
      console.log('WebSocket connected for character control');
    };
    
    this.websocket.onmessage = (event) => {
      if (!this.enabled) return;
      
      try {
        const message = JSON.parse(event.data);
        this.handleMovementMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private handleMovementMessage(message: WebSocketMovementMessage): void {
    if (message.type === 'movement') {
      this.movementInput = {
        direction: new Vector3(
          message.direction.x,
          message.direction.y,
          message.direction.z
        ),
      };
    }
  }

  getMovementInput(): MovementInput {
    return this.movementInput;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.movementInput = {
        direction: new Vector3(),
      };
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }
}

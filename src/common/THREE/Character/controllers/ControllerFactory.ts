import { IController } from "./IController";
import { KeyboardController } from "./KeyboardController";
import { WebSocketController } from "./WebSocketController";

export type ControllerType = 'keyboard' | 'websocket';

export interface ControllerConfig {
  type: ControllerType;
  websocketUrl?: string;
}

export class ControllerFactory {
  static createController(config: ControllerConfig): IController<unknown> {
    switch (config.type) {
      case 'keyboard':
        return new KeyboardController();
      
      case 'websocket':
        if (!config.websocketUrl) {
          throw new Error('WebSocket URL is required for WebSocket controller');
        }
        return new WebSocketController(config.websocketUrl);
      
      default:
        throw new Error(`Unknown controller type: ${config.type}`);
    }
  }
}

import { RootState } from "@react-three/fiber";
import { Vector3, Euler } from "three";
import { IController, MovementInput, PlayerControlInterface } from "./IController";

export type TestPlayerControllerProps = unknown;


export class TestPlayerController implements IController<TestPlayerControllerProps> {
    private props: TestPlayerControllerProps;
    private enabled: boolean = true;

    initialize(rootState: RootState, options: TestPlayerControllerProps): void {
        this.props = options;
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    getMovementInput(): MovementInput {

        const randomDirection = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
        const randomRotation = new Euler(0, Math.random() * 2 * Math.PI, 0);

        return {
            direction: randomDirection,
            rotation: randomRotation,
            jump: false,
            speed: 1,
        };
    }
    postMovementProcess(playerControl: PlayerControlInterface): void {
        console.log("postMovementProcess", playerControl);
    }
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
    isEnabled(): boolean {
        return this.enabled;
    }
}



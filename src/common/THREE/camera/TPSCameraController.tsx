import useTPSCameraController from "./hooks/useTPSCameraController";

export interface TPSCameraControllerProps {
    minDistance: number;
    maxDistance: number;
    curDistance: number;
    sensitivity: number;
    wheelSensitivity: number;
}

export default function TPSCameraController({ minDistance = 2, maxDistance = 10, curDistance = 5, sensitivity = 1, wheelSensitivity = 0.5 }: Partial<TPSCameraControllerProps>) {

    useTPSCameraController({ minDistance, maxDistance, curDistance, sensitivity, wheelSensitivity });

    return null;
}
import { useThreeStore } from "@/store/THREE/store";
import { PerspectiveCamera, Vector3, Spherical, MathUtils } from "three";
import { Camera, useFrame } from "@react-three/fiber";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { TPSCameraControllerProps } from "../TPSCameraController";
import { useRapier } from "@react-three/rapier";
import { ColliderGroupType, colliderGroup } from "@/util/THREE/three-types";
import { Ray } from "@dimforge/rapier3d-compat";

export default function useTPSCameraController({ minDistance, maxDistance, curDistance, sensitivity, wheelSensitivity }: TPSCameraControllerProps) {
    const headSocket = useThreeStore(state => state.headSocket);

    const cameraRef = useRef<PerspectiveCamera>(null);
    const sphericalRef = useRef<Spherical>(new Spherical());
    const rapierWorld = useRapier();

    // 마우스 입력 상태
    const [isPointerLocked, setIsPointerLocked] = useState(false);
    const [currentDistance, setCurrentDistance] = useState(curDistance);
    const flexableMaxDistanceRef = useRef(maxDistance);
    const lastMousePositionRef = useRef({ x: 0, y: 0 });
    const isFirstMouseMoveRef = useRef(true);
    const mouseDeltaRef = useRef({ x: 0, y: 0 });
    
    // 터치 입력 상태
    const [isTouching, setIsTouching] = useState(false);
    const lastTouchPositionRef = useRef({ x: 0, y: 0 });
    const touchDeltaRef = useRef({ x: 0, y: 0 });

    // 카메라 설정
    const targetOffset = useMemo(() => new Vector3(0, 0.5, 0), []); // 카메라가 바라볼 지점 (플레이어 중심에서 약간 위)

    // 초기 카메라 각도 설정
    useEffect(() => {
        sphericalRef.current.radius = currentDistance;

    }, [currentDistance]);

    useEffect(()=>{
        if(headSocket) {
            sphericalRef.current.phi = Math.PI / 3;
            sphericalRef.current.theta = Math.PI + headSocket.rotation.y;
        }
    },[headSocket])
    
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!isPointerLocked) return;
        
        
        // 더 간단한 접근: movementX/Y가 있으면 사용, 없으면 clientX/Y 기반 계산
        let deltaX = event.movementX;
        let deltaY = event.movementY;
        
        // movementX/Y가 없거나 0인 경우 clientX/Y 기반으로 계산
        if (!deltaX && !deltaY) {
            if (isFirstMouseMoveRef.current) {
                lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
                isFirstMouseMoveRef.current = false;
                return;
            }
            deltaX = event.clientX - lastMousePositionRef.current.x;
            deltaY = event.clientY - lastMousePositionRef.current.y;
            lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
        }

        // 0이 아닌 값만 적용
        if (deltaX !== 0 || deltaY !== 0) {
            const newDelta = {
                x: deltaX * sensitivity * 0.1,
                y: deltaY * sensitivity * 0.1
            };
            mouseDeltaRef.current = newDelta;
        }
    }, [isPointerLocked, sensitivity]);

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();

        const deltaDistance = event.deltaY > 0 ? wheelSensitivity : -wheelSensitivity;

        setCurrentDistance(prevDistance => {
            const newDistance = Math.max(minDistance, Math.min(flexableMaxDistanceRef.current, prevDistance + deltaDistance));
            return newDistance;
        });
    }, [minDistance, wheelSensitivity, flexableMaxDistanceRef]);

    const handlePointerLockChange = useCallback(() => {
        const isLocked = document.pointerLockElement !== null;
        setIsPointerLocked(isLocked);
        
        if (isLocked) {
            // pointer lock이 활성화되면 마우스 위치 초기화
            isFirstMouseMoveRef.current = true;
        }
    }, []);

    // 터치 이벤트 핸들러
    const handleTouchStart = useCallback((event: TouchEvent) => {
        // 단일 터치만 처리 (카메라 회전용)
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            // 조이스틱이나 버튼 영역이 아닌 경우에만 처리
            const target = touch.target as HTMLElement;
            if (!target.closest('[data-virtual-control]')) {
                lastTouchPositionRef.current = { x: touch.clientX, y: touch.clientY };
                setIsTouching(true);
            }
        }
    }, []);

    const handleTouchMove = useCallback((event: TouchEvent) => {
        if (!isTouching || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const target = touch.target as HTMLElement;
        
        // 조이스틱이나 버튼 영역이 아닌 경우에만 처리
        if (!target.closest('[data-virtual-control]')) {
            const deltaX = touch.clientX - lastTouchPositionRef.current.x;
            const deltaY = touch.clientY - lastTouchPositionRef.current.y;

            touchDeltaRef.current = {
                x: deltaX * sensitivity * 0.15,
                y: deltaY * sensitivity * 0.15
            };

            lastTouchPositionRef.current = { x: touch.clientX, y: touch.clientY };
        }
    }, [isTouching, sensitivity]);

    const handleTouchEnd = useCallback(() => {
        setIsTouching(false);
        touchDeltaRef.current = { x: 0, y: 0 };
    }, []);

    // 마우스 및 터치 입력 처리
    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        // 캔버스 클릭 시 pointer lock 요청
        const handleCanvasClick = () => {
            if (!isPointerLocked) {
                canvas.requestPointerLock();
            }
        };

        canvas.addEventListener('click', handleCanvasClick);
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        
        // 터치 이벤트 리스너 추가
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            
            // 터치 이벤트 리스너 제거
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMouseMove, handleWheel, handlePointerLockChange, handleTouchStart, handleTouchMove, handleTouchEnd, isPointerLocked]);


    const rayCastCamera = useCallback((origin: Vector3, direction: Vector3) => {
        if (!headSocket || !rapierWorld) return;

        direction.normalize();

        const ray = new Ray(origin, direction);
        // 방법 2: Default 그룹과 충돌하도록 설정 (membership과 filter 모두 Default)
        const intersections = rapierWorld.world.castRayAndGetNormal(ray, maxDistance, true, undefined, colliderGroup(ColliderGroupType.Player, ColliderGroupType.Default));

        if (intersections) {
            // 히트 포인트 계산: ray origin + direction * timeOfImpact
            const hitPoint = origin.clone().add(direction.clone().multiplyScalar(intersections.timeOfImpact));
            flexableMaxDistanceRef.current = hitPoint.distanceTo(origin);
        } else {
            flexableMaxDistanceRef.current = maxDistance;
        }

    }, [headSocket, maxDistance, rapierWorld]);

    const updateCameraPosition = useCallback((camera: Camera) => {
        if (!headSocket) {
            // headSocket이 없을 때 기본 카메라 위치 설정
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            return;
        }

        // 플레이어 위치 가져오기
        const playerPosition = headSocket.getWorldPosition(new Vector3());
        const targetPosition = playerPosition.clone().add(targetOffset);

        // 구면 좌표를 카테시안 좌표로 변환
        let cameraPosition = new Vector3();
        cameraPosition.setFromSpherical(sphericalRef.current);
        cameraPosition.add(targetPosition);

        rayCastCamera(targetPosition, cameraPosition.clone().sub(targetPosition));

        const actualDistance = Math.max(minDistance, Math.min(flexableMaxDistanceRef.current, currentDistance));

        if (actualDistance < sphericalRef.current.radius) {
            sphericalRef.current.radius = actualDistance;
        } else {
            sphericalRef.current.radius = MathUtils.lerp(sphericalRef.current.radius, actualDistance, 0.1);
        }

        // 마우스 입력으로 카메라 각도 업데이트
        if (isPointerLocked && (mouseDeltaRef.current.x !== 0 || mouseDeltaRef.current.y !== 0)) {
            sphericalRef.current.theta -= mouseDeltaRef.current.x;
            sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - mouseDeltaRef.current.y));
            
            // 마우스 델타 리셋
            mouseDeltaRef.current = { x: 0, y: 0 };
        }
        
        // 터치 입력으로 카메라 각도 업데이트
        if (isTouching && (touchDeltaRef.current.x !== 0 || touchDeltaRef.current.y !== 0)) {
            sphericalRef.current.theta -= touchDeltaRef.current.x;
            sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - touchDeltaRef.current.y));
            
            // 터치 델타 리셋
            touchDeltaRef.current = { x: 0, y: 0 };
        }

        cameraPosition = new Vector3();
        cameraPosition.setFromSpherical(sphericalRef.current);
        cameraPosition.add(targetPosition);

        // 카메라 위치와 회전 설정
        camera.position.copy(cameraPosition);
        camera.lookAt(targetPosition);
    }, [headSocket, isPointerLocked, isTouching, targetOffset, currentDistance, minDistance, rayCastCamera]);

    useFrame((state) => {
        updateCameraPosition(state.camera);
    });

    return {
        cameraRef,
        isPointerLocked,
        setIsPointerLocked,
        currentDistance
    }
}
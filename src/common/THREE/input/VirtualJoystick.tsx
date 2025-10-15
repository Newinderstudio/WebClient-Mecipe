"use client"

import { useEffect, useRef, useState } from 'react';

export interface JoystickState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    x: number; // -1 ~ 1
    y: number; // -1 ~ 1
}

interface VirtualJoystickProps {
    onJoystickChange: (state: JoystickState) => void;
    size?: number;
}

export default function VirtualJoystick({ onJoystickChange, size = 120 }: VirtualJoystickProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const maxDistance = size / 2;

        const handleStart = () => {
            setIsActive(true);
        };

        const handleMove = (clientX: number, clientY: number) => {
            if (!isActive && !container.contains(document.elementFromPoint(clientX, clientY))) return;
            
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let deltaX = clientX - centerX;
            let deltaY = clientY - centerY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                deltaX = Math.cos(angle) * maxDistance;
                deltaY = Math.sin(angle) * maxDistance;
            }

            setPosition({ x: deltaX, y: deltaY });

            // 정규화된 값 (-1 ~ 1)
            const normalizedX = deltaX / maxDistance;
            const normalizedY = -deltaY / maxDistance; // Y축 반전

            // 임계값 적용
            const threshold = 0.2;
            const state: JoystickState = {
                forward: normalizedY > threshold,
                backward: normalizedY < -threshold,
                left: normalizedX < -threshold,
                right: normalizedX > threshold,
                x: Math.abs(normalizedX) > threshold ? normalizedX : 0,
                y: Math.abs(normalizedY) > threshold ? normalizedY : 0,
            };

            onJoystickChange(state);
        };

        const handleEnd = () => {
            setIsActive(false);
            setPosition({ x: 0, y: 0 });
            onJoystickChange({
                forward: false,
                backward: false,
                left: false,
                right: false,
                x: 0,
                y: 0,
            });
        };

        // Touch events
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            // const touch = e.touches[0];
            // handleStart(touch.clientX, touch.clientY);
            handleStart();
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            handleEnd();
        };

        // Mouse events
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            // handleStart(e.clientX, e.clientY);
            handleStart();
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isActive) {
                handleMove(e.clientX, e.clientY);
            }
        };

        const handleMouseUp = () => {
            handleEnd();
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isActive, onJoystickChange, size]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                bottom: '40px',
                left: '40px',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                touchAction: 'none',
                userSelect: 'none',
                zIndex: 1000,
            }}
        >
            {/* 조이스틱 핸들 */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${size / 3}px`,
                    height: `${size / 3}px`,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    transition: isActive ? 'none' : 'transform 0.2s ease-out',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}


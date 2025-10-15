"use client"

import { useEffect, useRef, useState } from 'react';

interface VirtualButtonProps {
    label: string;
    onPress: () => void;
    onRelease: () => void;
    position?: 'left' | 'right';
    bottom?: string;
    right?: string;
    size?: number;
}

export default function VirtualButton({
    label,
    onPress,
    onRelease,
    position = 'right',
    bottom = '40px',
    right = '40px',
    size = 80,
}: VirtualButtonProps) {
    const [isPressed, setIsPressed] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleStart = (e: Event) => {
            e.preventDefault();
            setIsPressed(true);
            onPress();
        };

        const handleEnd = (e: Event) => {
            e.preventDefault();
            setIsPressed(false);
            onRelease();
        };

        // Touch events
        button.addEventListener('touchstart', handleStart, { passive: false });
        button.addEventListener('touchend', handleEnd, { passive: false });
        button.addEventListener('touchcancel', handleEnd, { passive: false });

        // Mouse events
        button.addEventListener('mousedown', handleStart);
        button.addEventListener('mouseup', handleEnd);
        button.addEventListener('mouseleave', handleEnd);

        return () => {
            button.removeEventListener('touchstart', handleStart);
            button.removeEventListener('touchend', handleEnd);
            button.removeEventListener('touchcancel', handleEnd);
            button.removeEventListener('mousedown', handleStart);
            button.removeEventListener('mouseup', handleEnd);
            button.removeEventListener('mouseleave', handleEnd);
        };
    }, [onPress, onRelease]);

    return (
        <button
            ref={buttonRef}
            style={{
                position: 'fixed',
                bottom,
                right: position === 'right' ? right : 'auto',
                left: position === 'left' ? right : 'auto',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: isPressed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                color: isPressed ? 'black' : 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                touchAction: 'none',
                userSelect: 'none',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s ease',
                transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            }}
        >
            {label}
        </button>
    );
}


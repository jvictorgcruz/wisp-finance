import { useState, useEffect, useRef } from 'react';

// Use cubic easing out for smooth deceleration
const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
};

export function useStepProgress(isActive: boolean, durationMs: number = 1000) {
    const [progress, setProgress] = useState(0);
    const frameRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isActive) {
            setProgress(0);
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            startRef.current = null;
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setProgress(1);
            return;
        }

        const animate = (timestamp: number) => {
            if (startRef.current === null) {
                startRef.current = timestamp;
            }
            
            const elapsed = timestamp - startRef.current;
            const rawProgress = Math.min(elapsed / durationMs, 1);
            const easedProgress = easeOutCubic(rawProgress);
            
            setProgress(easedProgress);

            if (rawProgress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [isActive, durationMs]);

    return progress;
}

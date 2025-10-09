import { useCallback, useEffect, useRef } from "react";
import { AnimationAction, AnimationClip, AnimationMixer, Object3D } from "three";

export default function useWorldPlayerAnimation({animations, scene, defaultAnimationClipName}:{animations:AnimationClip[], scene:Object3D, defaultAnimationClipName:string}) {


    const animationClips = useRef<AnimationClip[]>([]);
    const animatorMixer = useRef<AnimationMixer|null>(null);
    const curAction = useRef<AnimationAction|null>(null);

    const animationState = useRef<string>("");

    const playAnimator = useCallback((animationClipName:string, isForce:boolean = false) => {
        if(animationState.current === animationClipName && !isForce) return;
        animationState.current = animationClipName;
       
        if(animatorMixer.current) {
            const targetClip = animationClips.current.find((animation) => animation.name === animationClipName);
            if(targetClip) {
                if(curAction.current) {
                    curAction.current.fadeOut(0.5);
                }
                curAction.current = animatorMixer.current.clipAction(targetClip);
                curAction.current.reset().fadeIn(0.5).play();
            }
        }
    }, []);

    useEffect(() => {
        animatorMixer.current = new AnimationMixer(scene);
        animationClips.current = animations.map((animation) => {
            return animation
        });
        if(defaultAnimationClipName) {
            playAnimator(defaultAnimationClipName, true);
        }
    }, [playAnimator, defaultAnimationClipName, animations, scene]);

    const updateAnimator = useCallback((delta: number) => {
        if(animatorMixer.current) {
            animatorMixer.current.update(delta);
        }
    }, []);

    return {
        playAnimator,
        updateAnimator
    }

}
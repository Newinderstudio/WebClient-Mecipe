import { useCallback, useRef } from "react";
import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function useThreeWorldPlayerAnimator() {
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

    const initAnimator = useCallback((gltf: GLTF, animationClipName?:string) => {
        animatorMixer.current = new AnimationMixer(gltf.scene);
        animationClips.current = gltf.animations.map((animation) => {
            return animation
        });
        if(animationClipName) {
            playAnimator(animationClipName, true);
        }
    }, [playAnimator]);

    const updateAnimator = useCallback((delta: number) => {
        if(animatorMixer.current) {
            animatorMixer.current.update(delta);
        }
    }, []);

    return {
        initAnimator,
        updateAnimator,
        playAnimator,
    };
}
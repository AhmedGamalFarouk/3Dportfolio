import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

export function CameraRig() {
  const { camera, size } = useThree();
  const controlsRef = useRef<any>(null);

  const {
    currentState,
    setCurrentState,
    setHUDText,
    focusedModule,
  } = useStore();

  const isTransitioningRef = useRef(false);

  // Transition handler
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (currentState === 'INTRO') {
      isTransitioningRef.current = true;
      controls.enabled = false;

      // Dolly camera forward
      gsap.to(camera.position, {
        x: 0,
        y: 14,
        z: 22,
        duration: 5.5,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          isTransitioningRef.current = false;
          controls.enabled = true;
          controls.saveState();
          setCurrentState('CORE_INACTIVE');
          setHUDText(
            'CORE_INACTIVE',
            'Interact with Central CPU Core to initialize energy routing.'
          );
        },
      });

      // Dolly controls target
      gsap.to(controls.target, {
        x: 0,
        y: 0.5,
        z: 0,
        duration: 5.5,
        ease: 'power2.out',
      });
    }

    if (currentState === 'MODULE_FOCUSED' && focusedModule) {
      isTransitioningRef.current = true;
      controls.enabled = false;

      const modPos = new THREE.Vector3(...focusedModule.position);
      const targetCamPos = modPos.clone().add(new THREE.Vector3(0, 3, 5));

      // Camera position close up
      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
      });

      // Target position focus
      gsap.to(controls.target, {
        x: modPos.x,
        y: modPos.y + 0.5,
        z: modPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onComplete: () => {
          isTransitioningRef.current = false;
          controls.enabled = true;
          controls.minDistance = 2;
          controls.maxDistance = 10;
        },
      });
    }
  }, [currentState, focusedModule, camera, setCurrentState, setHUDText]);

  // Handle returning from focused module to Overview
  const handleResetCamera = () => {
    const controls = controlsRef.current;
    if (!controls) return;

    isTransitioningRef.current = true;
    controls.enabled = false;
    controls.minDistance = 3;
    controls.maxDistance = 45;

    // Reset controls target to center
    gsap.to(controls.target, {
      x: 0,
      y: 0.5,
      z: 0,
      duration: 1.5,
      ease: 'power3.inOut',
    });

    // Reset camera position to overview
    gsap.to(camera.position, {
      x: 0,
      y: 12,
      z: 18,
      duration: 1.5,
      ease: 'power3.inOut',
      onComplete: () => {
        isTransitioningRef.current = false;
        controls.enabled = true;
        setCurrentState('CORE_ACTIVE');
        setHUDText(
          'CORE_ACTIVE',
          'Neural pathways primed. Select a capability module for deep inspection.'
        );
      },
    });
  };

  // Bind the reset function to custom window event so HUD can trigger it easily
  useEffect(() => {
    window.addEventListener('reset-camera', handleResetCamera);
    return () => window.removeEventListener('reset-camera', handleResetCamera);
  }, [camera]);

  useFrame(() => {
    // If not transitioning, update controls
    const controls = controlsRef.current;
    if (controls && controls.enabled && !isTransitioningRef.current) {
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={3}
      maxDistance={45}
      target={[0, 0, 0]}
    />
  );
}

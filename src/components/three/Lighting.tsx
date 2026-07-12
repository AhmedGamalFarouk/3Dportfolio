import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export function Lighting() {
  const dirLight1Ref = useRef<THREE.DirectionalLight>(null);
  const cpuSpotLightRef = useRef<THREE.SpotLight>(null);
  const { cpuActive } = useStore();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate directional key light slightly for dynamic metallic sheen
    if (dirLight1Ref.current) {
      dirLight1Ref.current.position.x = 12 + Math.cos(time * 0.1) * 3;
      dirLight1Ref.current.position.z = 12 + Math.sin(time * 0.1) * 3;
    }

    // Subtle hum/pulse on CPU spot intensity
    if (cpuSpotLightRef.current) {
      const base = cpuActive ? 1.8 : 0.5;
      const pulse = Math.sin(time * 5.0) * 0.05;
      cpuSpotLightRef.current.intensity = Math.max(0.1, base + pulse);
    }
  });

  return (
    <>
      {/* Ambient fill light (dark futuristic blue-navy tone) */}
      <ambientLight color={0x060814} intensity={0.6} />

      {/* Directional key light with shadows */}
      <directionalLight
        ref={dirLight1Ref}
        color={0x00f3ff}
        intensity={0.8}
        position={[10, 15, 10]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />

      {/* Rim filler light (violet tint) */}
      <directionalLight
        color={0xbd00ff}
        intensity={0.4}
        position={[-10, 8, -10]}
      />

      {/* CPU Volumetric Spotlight */}
      <spotLight
        ref={cpuSpotLightRef}
        color={0x00ffd5}
        intensity={0.5}
        distance={30}
        angle={Math.PI / 6}
        penumbra={0.5}
        decay={1.2}
        position={[0, 15, 0]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </>
  );
}

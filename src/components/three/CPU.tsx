import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import { useAudio } from '@/hooks/useAudio';

export function CPU() {
  const leftCoverRef = useRef<THREE.Group>(null);
  const rightCoverRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const indicatorRef = useRef<THREE.Group>(null);

  const { cpuActive, setCpuActive, setEnergyFlowing, setHUDText, energyFlowing } = useStore();
  const { playPowerSurge } = useAudio();

  // Create canvas texture for CPU label
  const coverMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, 512, 512);

      // Gold microtraces border
      ctx.strokeStyle = '#00ffd5';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, 452, 452);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 412, 412);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('AHMED GAMAL FAROUK', 256, 180);

      ctx.fillStyle = '#00f3ff';
      ctx.font = '22px Share Tech Mono';
      ctx.fillText('// CORE SYSTEM //', 256, 240);

      ctx.fillStyle = '#8b9bb4';
      ctx.font = '18px Share Tech Mono';
      if (cpuActive) {
        ctx.fillStyle = '#00ffd5';
        ctx.font = 'bold 18px Share Tech Mono';
        ctx.fillText('INTEL STATE: ACTIVE', 256, 320);
        ctx.fillText('DYNAMIC ROUTING ENGAGED', 256, 370);
      } else {
        ctx.fillText('INTEL STATE: INACTIVE', 256, 320);
        ctx.fillText('CLICK TO BOOT', 256, 370);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 0.85,
    });
  }, [cpuActive]);

  // Handle CPU Core activation animation
  useEffect(() => {
    if (cpuActive && leftCoverRef.current && rightCoverRef.current && coreRef.current) {
      // 1. Slide covers open
      gsap.to(leftCoverRef.current.position, {
        x: -1.3,
        duration: 1.2,
        ease: 'power3.out',
      });
      gsap.to(rightCoverRef.current.position, {
        x: 1.3,
        duration: 1.2,
        ease: 'power3.out',
      });

      // 2. Flare up Core emissive intensity & position
      gsap.to((coreRef.current.material as THREE.MeshStandardMaterial), {
        emissiveIntensity: 6.0,
        duration: 0.8,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          if (coreRef.current) {
            (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 3.5;
          }
        },
      });

      gsap.to(coreRef.current.position, {
        y: 0.45,
        duration: 1.0,
        ease: 'power2.out',
      });
    }
  }, [cpuActive]);

  const handleCpuClick = () => {
    if (cpuActive || energyFlowing) return;
    playPowerSurge();
    setEnergyFlowing(true);
    setHUDText('CORE_SURGE', 'Drawing power surge from core system… sparks detected.');
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (!cpuActive) {
      // Faint slow core pulse
      if (coreRef.current) {
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 2.0) * 0.3;
      }

      // Rotate & pulse the CTA indicator
      if (indicatorRef.current) {
        indicatorRef.current.rotation.y = time * 0.8;
        const scale = 1.0 + Math.sin(time * 3.5) * 0.12;
        indicatorRef.current.scale.set(scale, scale, scale);
        indicatorRef.current.position.y = 0.95 + Math.sin(time * 2.0) * 0.08;

        indicatorRef.current.children.forEach((child) => {
          const mat = (child as THREE.Mesh).material as THREE.Material;
          if (mat) {
            mat.opacity = 0.5 + Math.sin(time * 3.5) * 0.35;
          }
        });
      }
    } else {
      // Hide active indicator
      if (indicatorRef.current && indicatorRef.current.visible) {
        indicatorRef.current.visible = false;
      }
      // Energetic active neon flicker
      if (coreRef.current) {
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
          3.0 + Math.sin(time * 12.0) * 0.5 + (Math.random() - 0.5) * 0.2;
      }
    }
  });

  return (
    <group>
      {/* 1. Motherboard substrate (Large base board) */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[22, 0.15, 22]} />
        <meshStandardMaterial
          color={0x0d111f}
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>

      {/* Neon border around the motherboard edge */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[22.1, 0.16, 22.1]} />
        <meshStandardMaterial
          color={0x05060b}
          roughness={0.1}
          metalness={0.9}
          emissive={0x00f3ff}
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Boundary grid trace lines */}
      <gridHelper args={[21.9, 2, 0xffd700, 0xffd700]} position={[0, 0.086, 0]}>
        <meshBasicMaterial
          attach="material"
          transparent
          opacity={0.45}
          color={0xffd700}
        />
      </gridHelper>

      {/* Detail copper-like grid lines */}
      <gridHelper args={[20, 40, 0x00f3ff, 0x111630]} position={[0, 0.085, 0]}>
        <meshBasicMaterial
          attach="material"
          transparent
          opacity={0.35}
          color={0x00f3ff}
        />
      </gridHelper>

      {/* CPU Substrate */}
      <mesh receiveShadow castShadow position={[0, 0.125, 0]}>
        <boxGeometry args={[4.2, 0.25, 4.2]} />
        <meshStandardMaterial color={0x0b101d} roughness={0.7} metalness={0.4} />
      </mesh>

      {/* CPU Core Glowing Center */}
      <mesh ref={coreRef} position={[0, 0.3, 0]} onClick={handleCpuClick}>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
        <meshStandardMaterial
          color={0x030303}
          emissive={0x00ffd5}
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Heat shield sliding covers */}
      <group ref={leftCoverRef} position={[-0.9, 0.4, 0]} onClick={handleCpuClick}>
        <mesh castShadow material={coverMaterial}>
          <boxGeometry args={[1.8, 0.3, 3.6]} />
        </mesh>
      </group>

      <group ref={rightCoverRef} position={[0.9, 0.4, 0]} onClick={handleCpuClick}>
        <mesh castShadow material={coverMaterial}>
          <boxGeometry args={[1.8, 0.3, 3.6]} />
        </mesh>
      </group>

      {/* Socket Clip Pins */}
      {[-1.8, 0, 1.8].map((z) => (
        <group key={z}>
          <mesh castShadow position={[-2.15, 0.25, z]}>
            <boxGeometry args={[0.15, 0.3, 0.5]} />
            <meshStandardMaterial color={0xffd700} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[2.15, 0.25, z]}>
            <boxGeometry args={[0.15, 0.3, 0.5]} />
            <meshStandardMaterial color={0xffd700} roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Interactive CTA holographic pointer */}
      {!cpuActive && (
        <group ref={indicatorRef} position={[0, 0.9, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.85, 0.95, 32]} />
            <meshBasicMaterial
              color={0x00f3ff}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.12, 0.28, 4]} />
            <meshBasicMaterial
              color={0x00f3ff}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

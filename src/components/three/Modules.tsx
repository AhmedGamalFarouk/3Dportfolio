import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import { moduleDefinitions } from '@/data/portfolioData';
import type { ModuleData } from '@/types';

// ─── 1. Tech Module Mesh ─────────────────────────────────────────────────────

function TechModuleMesh({ color }: { color: string }) {
  const crystalRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.getElapsedTime() * 1.5;
      crystalRef.current.rotation.x = state.clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.15, 1.6]} />
        <meshStandardMaterial color={0x0a101d} roughness={0.6} metalness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.1, 0.12, 1.1]} />
        <meshStandardMaterial color={0xc0c0c0} roughness={0.2} metalness={0.95} />
      </mesh>
      <mesh ref={crystalRef} position={[0, 0.45, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color={0x020202}
          emissive={color}
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// ─── 2. Human Module Mesh ────────────────────────────────────────────────────

function HumanModuleMesh({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.6;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.15, 8]} />
        <meshStandardMaterial color={0x080c14} roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={0x010101}
          emissive={color}
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <group ref={groupRef} position={[0, 0.3, 0]}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.55, 0.035, 8, 32]} />
          <meshStandardMaterial color={0x6a6e85} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <torusGeometry args={[0.55, 0.035, 8, 32]} />
          <meshStandardMaterial color={0x6a6e85} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ─── 3. Certs Module Mesh ────────────────────────────────────────────────────

function CertsModuleMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.15, 1.5]} />
        <meshStandardMaterial color={0x090d16} roughness={0.6} metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.9, 0.45, 0.9]} />
        <meshStandardMaterial color={0x111622} roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
        <meshStandardMaterial color={0xffd700} roughness={0.1} metalness={0.95} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color={0x020202} emissive={color} emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

// ─── 4. Projects Module Mesh ──────────────────────────────────────────────────

function ProjectsModuleMesh({ color }: { color: string }) {
  const ledRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ledRef.current) {
      const active = Math.sin(state.clock.getElapsedTime() * 15.0) > 0;
      (ledRef.current.material as THREE.MeshBasicMaterial).color.setHex(active ? 0x00ffd5 : 0x011a14);
    }
  });

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.1, 2.4]} />
        <meshStandardMaterial color={0x080f1e} roughness={0.8} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.45, 0.1, 0]}>
        <boxGeometry args={[0.55, 0.15, 1.8]} />
        <meshStandardMaterial color={0x0b162a} roughness={0.7} metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0.45, 0.1, 0]}>
        <boxGeometry args={[0.55, 0.15, 1.8]} />
        <meshStandardMaterial color={0x0b162a} roughness={0.7} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 1.15]}>
        <boxGeometry args={[1.6, 0.05, 0.15]} />
        <meshStandardMaterial color={0xffd700} metalness={0.9} />
      </mesh>
      <mesh ref={ledRef} position={[-0.6, 0.22, -0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// ─── 5. Contact Module Mesh ───────────────────────────────────────────────────

function ContactModuleMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.15, 6]} />
        <meshStandardMaterial color={0x0e111d} roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.4, 0.15, 0.45, 8]} />
        <meshStandardMaterial color={0x141829} roughness={0.3} metalness={0.95} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={0x050505} emissive={color} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

// ─── Module Item Container (Handles hover logic) ─────────────────────────────

interface ModuleItemProps {
  data: ModuleData;
  onFocus: (data: ModuleData) => void;
}

function ModuleItem({ data, onFocus }: ModuleItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const { cpuActive } = useStore();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    // Interstellar floating on hover or slow wave if not focused
    const group = groupRef.current;
    if (!group) return;

    const targetY = hovered && cpuActive ? 0.45 : 0.1;
    group.position.y += (targetY - group.position.y) * 0.1;

    // Synchronize pointlight wash
    if (lightRef.current) {
      const targetIntensity = cpuActive ? (hovered ? 6.0 : 2.5) : 0;
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * 0.08;
      // Micro flicker
      if (lightRef.current.intensity > 0.5) {
        lightRef.current.intensity += (Math.random() - 0.5) * 0.08;
      }
    }
  });

  const handleClick = () => {
    if (!cpuActive) return;
    onFocus(data);
  };

  return (
    <group
      ref={groupRef}
      position={[data.position[0], 0.1, data.position[2]]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Dynamic Module Component Switch */}
      {data.id === 'tech' && <TechModuleMesh color={data.color} />}
      {data.id === 'human' && <HumanModuleMesh color={data.color} />}
      {data.id === 'certs' && <CertsModuleMesh color={data.color} />}
      {data.id === 'projects' && <ProjectsModuleMesh color={data.color} />}
      {data.id === 'contact' && <ContactModuleMesh color={data.color} />}

      {/* Point underlight glow */}
      <pointLight
        ref={lightRef}
        color={data.color}
        intensity={0}
        distance={8}
        decay={1.8}
        position={[0, 0.2, 0]}
      />
    </group>
  );
}

// ─── Exported Modules Component ──────────────────────────────────────────────

interface ModulesProps {
  onFocus: (data: ModuleData) => void;
}

export function Modules({ onFocus }: ModulesProps) {
  return (
    <>
      {moduleDefinitions.map((data) => (
        <ModuleItem key={data.id} data={data} onFocus={onFocus} />
      ))}
    </>
  );
}

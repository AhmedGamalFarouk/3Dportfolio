import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

const CIRCUITS_DATA = [
  {
    id: 'tech',
    color: '#00f3ff',
    hexColor: 0x00f3ff,
    points: [
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(-2.2, 0.18, -1.2),
      new THREE.Vector3(-2.2, 0.18, -5.0),
      new THREE.Vector3(-6, 0.18, -5),
    ],
  },
  {
    id: 'human',
    color: '#bd00ff',
    hexColor: 0xbd00ff,
    points: [
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(-3.2, 0.18, 1.2),
      new THREE.Vector3(-3.2, 0.18, 4.0),
      new THREE.Vector3(-7, 0.18, 4),
    ],
  },
  {
    id: 'certs',
    color: '#ffd700',
    hexColor: 0xffd700,
    points: [
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(3.2, 0.18, 1.2),
      new THREE.Vector3(3.2, 0.18, 4.0),
      new THREE.Vector3(7, 0.18, 4),
    ],
  },
  {
    id: 'projects',
    color: '#00ffd5',
    hexColor: 0x00ffd5,
    points: [
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(2.2, 0.18, -1.2),
      new THREE.Vector3(2.2, 0.18, -5.0),
      new THREE.Vector3(6, 0.18, -5),
    ],
  },
  {
    id: 'contact',
    color: '#ffffff',
    hexColor: 0xffffff,
    points: [
      new THREE.Vector3(0, 0.18, 0),
      new THREE.Vector3(0.0, 0.18, 3.5),
      new THREE.Vector3(0, 0.18, 7.5),
    ],
  },
];

interface CircuitLineProps {
  circuit: typeof CIRCUITS_DATA[number];
}

function CircuitLine({ circuit }: CircuitLineProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { energyFlowing } = useStore();
  const progressRef = useRef({ value: 0 });

  useEffect(() => {
    if (energyFlowing) {
      gsap.to(progressRef.current, {
        value: 1.0,
        duration: 2.2,
        ease: 'power1.inOut',
      });
    } else {
      gsap.killTweensOf(progressRef.current);
      progressRef.current.value = 0;
    }
  }, [energyFlowing]);

  const { fullGeometry, curve } = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(circuit.points, false, 'centripetal', 0.25);
    const geo = new THREE.TubeGeometry(c, 80, 0.06, 8, false);
    return { fullGeometry: geo, curve: c };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Every frame: clip the tube geometry to only show up to the current progress
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const progress = progressRef.current.value;

    // Show/hide the whole mesh based on progress 
    mesh.visible = progress > 0.01;

    if (!mesh.visible) return;

    // Set the draw range to clip the tube to current progress.
    // TubeGeometry has radialSegments*2*3 indices per segment, and 80 path segments.
    const totalCount = fullGeometry.index
      ? fullGeometry.index.count
      : fullGeometry.attributes.position.count;
    const clipped = Math.floor(totalCount * progress);
    fullGeometry.setDrawRange(0, Math.max(clipped, 0));

    // Also update emissive intensity for glow effect
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 1.5;
    mat.emissiveIntensity = pulse;
  });

  return (
    <mesh ref={meshRef} geometry={fullGeometry} visible={false}>
      <meshStandardMaterial
        color={circuit.hexColor}
        emissive={circuit.hexColor}
        emissiveIntensity={2.0}
        roughness={0}
        metalness={0}
        transparent={false}
      />
    </mesh>
  );
}

export function EnergySystem() {
  const { energyFlowing, setCpuActive, setCurrentState, setHUDText } = useStore();

  useEffect(() => {
    if (energyFlowing) {
      setCpuActive(true);

      const timer = setTimeout(() => {
        setCurrentState('CORE_ACTIVE');
        setHUDText(
          'CORE_ACTIVE',
          'Neural pathways primed. Select a capability module for deep inspection.'
        );
      }, 2400);

      return () => clearTimeout(timer);
    }
  }, [energyFlowing, setCpuActive, setCurrentState, setHUDText]);

  return (
    <>
      {CIRCUITS_DATA.map((circuit) => (
        <CircuitLine key={circuit.id} circuit={circuit} />
      ))}
    </>
  );
}

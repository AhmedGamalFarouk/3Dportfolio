import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import { energyTrailVertexShader, energyTrailFragmentShader } from '@/shaders/energyTrail';

const CIRCUITS_DATA = [
  {
    id: 'tech',
    color: 0x00f3ff,
    points: [
      [0, 0.18, 0],
      [-2.2, 0.18, -1.2],
      [-2.2, 0.18, -5.0],
      [-6, 0.18, -5],
    ],
  },
  {
    id: 'human',
    color: 0xbd00ff,
    points: [
      [0, 0.18, 0],
      [-3.2, 0.18, 1.2],
      [-3.2, 0.18, 4.0],
      [-7, 0.18, 4],
    ],
  },
  {
    id: 'certs',
    color: 0xffd700,
    points: [
      [0, 0.18, 0],
      [3.2, 0.18, 1.2],
      [3.2, 0.18, 4.0],
      [7, 0.18, 4],
    ],
  },
  {
    id: 'projects',
    color: 0x00ffd5,
    points: [
      [0, 0.18, 0],
      [2.2, 0.18, -1.2],
      [2.2, 0.18, -5.0],
      [6, 0.18, -5],
    ],
  },
  {
    id: 'contact',
    color: 0xffffff,
    points: [
      [0, 0.18, 0],
      [0.0, 0.18, 3.5],
      [0, 0.18, 7.5],
    ],
  },
];

interface CircuitLineProps {
  circuit: typeof CIRCUITS_DATA[number];
}

function CircuitLine({ circuit }: CircuitLineProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { energyFlowing } = useStore();
  const progressRef = useRef({ value: 0 });

  useEffect(() => {
    if (energyFlowing) {
      console.log(`[EnergySystem] Flow starting for circuit: ${circuit.id}`);
      gsap.to(progressRef.current, {
        value: 1.0,
        duration: 2.2,
        ease: 'power1.inOut',
      });
    } else {
      progressRef.current.value = 0;
    }
  }, [energyFlowing, circuit.id]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uProgress.value = progressRef.current.value;
    }
  });

  const curve = useMemo(() => {
    const pathPoints = circuit.points.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal', 0.25);
  }, [circuit.points]);

  return (
    <mesh>
      {/* Declarative geometry instantiation via R3F JSX */}
      <tubeGeometry args={[curve, 64, 0.08, 8, false]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={energyTrailVertexShader}
        fragmentShader={energyTrailFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColor: { value: new THREE.Color(circuit.color) },
        }}
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
      }, 2200);

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

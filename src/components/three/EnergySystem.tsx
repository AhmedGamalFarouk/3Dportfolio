import { useRef, useEffect } from 'react';
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
      [0, 0.1, 0],
      [-2.2, 0.1, -1.2],
      [-2.2, 0.1, -5.0],
      [-6, 0.1, -5],
    ],
  },
  {
    id: 'human',
    color: 0xbd00ff,
    points: [
      [0, 0.1, 0],
      [-3.2, 0.1, 1.2],
      [-3.2, 0.1, 4.0],
      [-7, 0.1, 4],
    ],
  },
  {
    id: 'certs',
    color: 0xffd700,
    points: [
      [0, 0.1, 0],
      [3.2, 0.1, 1.2],
      [3.2, 0.1, 4.0],
      [7, 0.1, 4],
    ],
  },
  {
    id: 'projects',
    color: 0x00ffd5,
    points: [
      [0, 0.1, 0],
      [2.2, 0.1, -1.2],
      [2.2, 0.1, -5.0],
      [6, 0.1, -5],
    ],
  },
  {
    id: 'contact',
    color: 0xffffff,
    points: [
      [0, 0.1, 0],
      [0.0, 0.1, 3.5],
      [0, 0.1, 7.5],
    ],
  },
];

export function EnergySystem() {
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const { energyFlowing, setCpuActive, setCurrentState, setHUDText } = useStore();
  const progressRef = useRef({ value: 0 });

  // Run energy flow outwards from CPU to modules
  useEffect(() => {
    if (energyFlowing) {
      // Slide CPU covers and start camera shake
      setCpuActive(true);

      // Animate progress of energy flow tubes from 0 to 1
      gsap.to(progressRef.current, {
        value: 1.0,
        duration: 2.2,
        ease: 'power1.inOut',
        onUpdate: () => {
          materialsRef.current.forEach((mat) => {
            if (mat) mat.uniforms.uProgress.value = progressRef.current.value;
          });
        },
        onComplete: () => {
          setCurrentState('CORE_ACTIVE');
          setHUDText(
            'CORE_ACTIVE',
            'Neural pathways primed. Select a capability module for deep inspection.'
          );
        },
      });
    }
  }, [energyFlowing, setCpuActive, setCurrentState, setHUDText]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    materialsRef.current.forEach((mat) => {
      if (mat) mat.uniforms.uTime.value = time;
    });
  });

  return (
    <>
      {CIRCUITS_DATA.map((circuit, idx) => {
        const pathPoints = circuit.points.map((p) => new THREE.Vector3(...p));
        const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal', 0.25);
        const geometry = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);

        return (
          <mesh key={circuit.id} geometry={geometry}>
            <shaderMaterial
              ref={(el) => { if (el) materialsRef.current[idx] = el; }}
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
      })}
    </>
  );
}

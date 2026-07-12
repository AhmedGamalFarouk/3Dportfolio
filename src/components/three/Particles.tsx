import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

interface Spark {
  posX: number;
  posY: number;
  posZ: number;
  velX: number;
  velY: number;
  velZ: number;
  life: number;
  decay: number;
  color: THREE.Color;
}

const MAX_SPARKS = 150;

export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const sparksRef = useRef<Spark[]>([]);
  const { energyFlowing } = useStore();

  // Trigger spark explosion
  const triggerExplosion = () => {
    const list: Spark[] = [];
    for (let i = 0; i < MAX_SPARKS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 2.0;
      const vY = Math.random() * 4.5 + 1.5;

      list.push({
        posX: 0,
        posY: 0.4,
        posZ: 0,
        velX: Math.cos(angle) * speed,
        velY: vY,
        velZ: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.012,
        color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 1.0, 0.7),
      });
    }
    sparksRef.current = list;
  };

  // Watch for CPU activation / energy flow start
  useEffect(() => {
    if (energyFlowing) {
      triggerExplosion();
    }
  }, [energyFlowing]);

  useFrame(() => {
    const geo = geoRef.current;
    if (!geo || sparksRef.current.length === 0) return;

    const positions = geo.attributes.position.array as Float32Array;
    const colors = geo.attributes.color.array as Float32Array;
    const dt = 0.016;

    for (let i = 0; i < MAX_SPARKS; i++) {
      if (i < sparksRef.current.length) {
        const spark = sparksRef.current[i];

        spark.posX += spark.velX * dt;
        spark.posY += spark.velY * dt;
        spark.posZ += spark.velZ * dt;

        spark.velY -= 9.8 * dt;
        spark.velX *= 0.96;
        spark.velY *= 0.98;
        spark.velZ *= 0.96;

        spark.life -= spark.decay;

        if (spark.life > 0) {
          positions[i * 3] = spark.posX;
          positions[i * 3 + 1] = spark.posY;
          positions[i * 3 + 2] = spark.posZ;

          colors[i * 3] = spark.color.r * spark.life;
          colors[i * 3 + 1] = spark.color.g * spark.life;
          colors[i * 3 + 2] = spark.color.b * spark.life;
        } else {
          positions[i * 3] = 999;
          positions[i * 3 + 1] = 999;
          positions[i * 3 + 2] = 999;
        }
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    if (sparksRef.current.every((s) => s.life <= 0)) {
      sparksRef.current = [];
    }
  });

  // Init position & colors with dummy out-of-screen values
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(MAX_SPARKS * 3);
    const col = new Float32Array(MAX_SPARKS * 3);
    for (let i = 0; i < MAX_SPARKS; i++) {
      pos[i * 3] = 999; pos[i * 3 + 1] = 999; pos[i * 3 + 2] = 999;
      col[i * 3] = 1.0; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 0.3;
    }
    return [pos, col];
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

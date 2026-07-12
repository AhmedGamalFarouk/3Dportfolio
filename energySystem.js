import * as THREE from 'three';
import gsap from 'gsap';
import { triggerCpuActivationAnimation } from './cpu.js';
import { activateModuleLight } from './lighting.js';

let circuits = [];
let energyProgress = { value: 0 };
let active = false;

// Custom Shader for flowing circuit energy
const CircuitShader = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color(0x00f3ff) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      // Flow animation along U coordinate
      float flow = sin(vUv.x * 35.0 - uTime * 14.0) * 0.5 + 0.5;
      
      // Progress gate: energy only flows up to uProgress
      float gate = step(vUv.x, uProgress);
      
      // Bright wave front at progress head
      float head = smoothstep(uProgress - 0.08, uProgress, vUv.x) * (1.0 - step(uProgress, vUv.x));
      
      // Combine base glow, animated flow wave, and hot leading edge
      vec3 glowColor = mix(uColor * 0.4, uColor * 2.8, flow * 0.6 + head * 2.2);
      
      // Fade out tube edges
      float alpha = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
      
      gl_FragColor = vec4(glowColor, alpha * gate * 0.85);
    }
  `
};

export function initEnergySystem(scene) {
  // Define 5 module coordinates
  const moduleCoords = [
    { x: -6, y: 0.1, z: -5, color: 0x00f3ff }, // Tech (Electric Blue)
    { x: -7, y: 0.1, z: 4, color: 0xbd00ff },  // Non-Tech (Violet)
    { x: 7, y: 0.1, z: 4, color: 0xffd700 },   // Certs (Gold)
    { x: 6, y: 0.1, z: -5, color: 0x00ffd5 },  // Projects (Cyan)
    { x: 0, y: 0.1, z: 7.5, color: 0xffffff }  // Contact (White)
  ];

  moduleCoords.forEach((coord, index) => {
    // Generate organic 90-degree circuits curves
    let points = [];
    points.push(new THREE.Vector3(0, 0.1, 0)); // Start at CPU center

    if (index === 0) { // Tech
      points.push(new THREE.Vector3(-2.2, 0.1, -1.2));
      points.push(new THREE.Vector3(-2.2, 0.1, -5.0));
    } else if (index === 1) { // Non-Tech
      points.push(new THREE.Vector3(-3.2, 0.1, 1.2));
      points.push(new THREE.Vector3(-3.2, 0.1, 4.0));
    } else if (index === 2) { // Certs
      points.push(new THREE.Vector3(3.2, 0.1, 1.2));
      points.push(new THREE.Vector3(3.2, 0.1, 4.0));
    } else if (index === 3) { // Projects
      points.push(new THREE.Vector3(2.2, 0.1, -1.2));
      points.push(new THREE.Vector3(2.2, 0.1, -5.0));
    } else if (index === 4) { // Contact
      points.push(new THREE.Vector3(0.0, 0.1, 3.5));
    }

    points.push(new THREE.Vector3(coord.x, coord.y, coord.z)); // End at Module

    // CatmullRomCurve3 to smoothen path
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.25);
    
    // Create elevated tubes for sci-fi wiring look
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);
    
    // Custom Shader material instance
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color(coord.color) }
      },
      vertexShader: CircuitShader.vertexShader,
      fragmentShader: CircuitShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, mat);
    scene.add(tubeMesh);

    // Track circuits
    circuits.push({
      mesh: tubeMesh,
      curve: curve,
      color: coord.color,
      index: index
    });
  });
}

// Flow energy outwards from CPU to modules
export function triggerEnergyFlow(onCompleteCallback) {
  if (active) return;
  active = true;

  // 1. Fire CPU cover cracking and core light burst
  triggerCpuActivationAnimation();

  // 2. Animate progress of energy flow tubes from 0.0 to 1.0
  gsap.to(energyProgress, {
    value: 1.0,
    duration: 2.2,
    ease: 'power1.inOut',
    onUpdate: () => {
      circuits.forEach(c => {
        c.mesh.material.uniforms.uProgress.value = energyProgress.value;
      });
    },
    onComplete: () => {
      // Light up modules and trigger underlights
      circuits.forEach(c => {
        activateModuleLight(c.index, 3.0);
      });
      if (onCompleteCallback) onCompleteCallback();
    }
  });
}

// Update uniforms in animation frame
export function updateEnergySystem(time) {
  circuits.forEach(c => {
    c.mesh.material.uniforms.uTime.value = time;
  });
}

// Get the curves for particle tracing
export function getCircuitCurves() {
  return circuits;
}

export function getEnergyProgress() {
  return energyProgress.value;
}

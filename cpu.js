import * as THREE from 'three';
import gsap from 'gsap';
import { setCpuSpotIntensity } from './lighting.js';

let cpuGroup, cpuCoreMesh, leftCover, rightCover, boardMesh;
let active = false;

export function initCPU(scene) {
  cpuGroup = new THREE.Group();
  cpuGroup.position.set(0, 0, 0);

  // 1. Motherboard substrate (Large base board)
  const boardGeo = new THREE.BoxGeometry(22, 0.15, 22);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x0d111f, // Richer blue-grey tone
    roughness: 0.4,   // Lower roughness to catch metallic reflections
    metalness: 0.85,  // Higher metalness for sci-fi look
  });
  boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.receiveShadow = true;
  scene.add(boardMesh);

  // Add a glowing neon electric-blue frame around the motherboard edge
  const borderGeo = new THREE.BoxGeometry(22.1, 0.16, 22.1);
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x05060b,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x00f3ff,
    emissiveIntensity: 0.55 // Glowing cyber borders
  });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.y = -0.01;
  scene.add(borderMesh);

  // Add a gold boundary grid trace line
  const goldGrid = new THREE.GridHelper(21.9, 2, 0xffd700, 0xffd700);
  goldGrid.position.y = 0.086;
  goldGrid.material.opacity = 0.45;
  goldGrid.material.transparent = true;
  scene.add(goldGrid);

  // Motherboard micro details (copper-like metallic paths printed on board)
  const detailGrid = new THREE.GridHelper(20, 40, 0x00f3ff, 0x111630);
  detailGrid.position.y = 0.085;
  detailGrid.material.opacity = 0.35; // Increased trace sharpness
  detailGrid.material.transparent = true;
  scene.add(detailGrid);

  // 2. CPU Substrate (Base socket layer)
  const substrateGeo = new THREE.BoxGeometry(4.2, 0.25, 4.2);
  const substrateMat = new THREE.MeshStandardMaterial({
    color: 0x0b101d,
    roughness: 0.7,
    metalness: 0.4
  });
  const substrate = new THREE.Mesh(substrateGeo, substrateMat);
  substrate.position.y = 0.125;
  substrate.receiveShadow = true;
  substrate.castShadow = true;
  cpuGroup.add(substrate);

  // 3. CPU Core Glowing Center (Internal reactor)
  const coreGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
  // Emissive material for bloom
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x030303,
    emissive: 0x00ffd5,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.9
  });
  cpuCoreMesh = new THREE.Mesh(coreGeo, coreMat);
  cpuCoreMesh.position.y = 0.3;
  cpuGroup.add(cpuCoreMesh);

  // 4. Dynamic Text Label Texture printed on CPU cover
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Design details
  ctx.fillStyle = '#060a16';
  ctx.fillRect(0, 0, 512, 512);
  
  // Gold microtraces border
  ctx.strokeStyle = '#00ffd5';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, 452, 452);
  
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 412, 412);
  
  // Labels text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText('AHMED GAMAL FAROUK', 256, 180);
  
  ctx.fillStyle = '#00f3ff';
  ctx.font = '22px Share Tech Mono';
  ctx.fillText('// CORE SYSTEM //', 256, 240);
  
  ctx.fillStyle = '#8b9bb4';
  ctx.font = '18px Share Tech Mono';
  ctx.fillText('INTEL STATE: INACTIVE', 256, 320);
  ctx.fillText('CLICK TO BOOT', 256, 370);

  const labelTexture = new THREE.CanvasTexture(canvas);
  
  // Cover metal material
  const coverMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.25,
    metalness: 0.85
  });

  // 5. Heat shield divided covers (which will crack/slide open on click)
  leftCover = new THREE.Group();
  rightCover = new THREE.Group();

  // Create Left Half cover geometry and mesh
  const leftCoverGeo = new THREE.BoxGeometry(1.8, 0.3, 3.6);
  // Map texture coordinates to left half of texture
  const leftMesh = new THREE.Mesh(leftCoverGeo, coverMat);
  leftMesh.castShadow = true;
  leftCover.add(leftMesh);
  leftCover.position.set(-0.9, 0.4, 0);

  // Create Right Half cover geometry and mesh
  const rightCoverGeo = new THREE.BoxGeometry(1.8, 0.3, 3.6);
  const rightMesh = new THREE.Mesh(rightCoverGeo, coverMat);
  rightMesh.castShadow = true;
  rightCover.add(rightMesh);
  rightCover.position.set(0.9, 0.4, 0);

  cpuGroup.add(leftCover);
  cpuGroup.add(rightCover);

  // Gold outer clip pins around the CPU socket
  const pinGeo = new THREE.BoxGeometry(0.15, 0.3, 0.5);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.9 });
  
  for (let z = -1.8; z <= 1.8; z += 1.8) {
    const leftPin = new THREE.Mesh(pinGeo, pinMat);
    leftPin.position.set(-2.15, 0.25, z);
    cpuGroup.add(leftPin);
    
    const rightPin = new THREE.Mesh(pinGeo, pinMat);
    rightPin.position.set(2.15, 0.25, z);
    cpuGroup.add(rightPin);
  }

  scene.add(cpuGroup);
}

// Raycast intersection test
export function checkCpuClick(raycaster) {
  if (active) return false;
  // Test intersection against covers or substrate
  const intersects = raycaster.intersectObjects(cpuGroup.children, true);
  return intersects.length > 0;
}

// Open CPU mechanism and pulse core brightness on activation
export function triggerCpuActivationAnimation() {
  active = true;

  // 1. Redraw CPU label texture dynamically to show ACTIVE state
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#060a16';
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = '#00ffd5';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, 452, 452);
  
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 412, 412);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText('AHMED GAMAL FAROUK', 256, 180);
  
  ctx.fillStyle = '#00f3ff';
  ctx.font = '22px Share Tech Mono';
  ctx.fillText('// CORE SYSTEM //', 256, 240);
  
  ctx.fillStyle = '#00ffd5';
  ctx.font = 'bold 18px Share Tech Mono';
  ctx.fillText('INTEL STATE: ACTIVE', 256, 320);
  ctx.fillText('DYNAMIC ROUTING ENGAGED', 256, 370);

  const newTexture = new THREE.CanvasTexture(canvas);
  leftCover.children[0].material.map = newTexture;
  leftCover.children[0].material.needsUpdate = true;

  // 2. Slide covers open
  gsap.to(leftCover.position, {
    x: -1.3,
    duration: 1.2,
    ease: 'power3.out'
  });

  gsap.to(rightCover.position, {
    x: 1.3,
    duration: 1.2,
    ease: 'power3.out'
  });

  // 3. Flare up the Core emissive intensity and spotlight
  gsap.to(cpuCoreMesh.material, {
    emissiveIntensity: 6.0,
    duration: 0.8,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      // Set to stable high intensity
      cpuCoreMesh.material.emissiveIntensity = 3.5;
    }
  });

  gsap.to(cpuCoreMesh.position, {
    y: 0.45,
    duration: 1.0,
    ease: 'power2.out'
  });

  setCpuSpotIntensity(1.8);
}

export function pulseCpuCore(time) {
  if (!cpuCoreMesh) return;
  
  if (!active) {
    // Faint slow glow pulsing
    cpuCoreMesh.material.emissiveIntensity = 0.5 + Math.sin(time * 2.0) * 0.3;
  } else {
    // Energetic active neon flickering
    cpuCoreMesh.material.emissiveIntensity = 3.0 + Math.sin(time * 12.0) * 0.5 + (Math.random() - 0.5) * 0.2;
  }
}

export function isCpuActive() {
  return active;
}

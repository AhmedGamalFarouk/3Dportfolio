import * as THREE from 'three';
import gsap from 'gsap';
import { createModuleUnderlight, activateModuleLight } from './lighting.js';
import { isCpuActive } from './cpu.js';

let modules = [];
let hoverTweens = new Map();

export function initModules(scene) {
  // Define data for the 5 Modules
  const moduleData = [
    {
      id: 'tech',
      name: 'Technical Intel',
      color: 0x00f3ff,
      position: new THREE.Vector3(-6, 0.1, -5),
      builder: createTechModule
    },
    {
      id: 'human',
      name: 'Human Factor',
      color: 0xbd00ff,
      position: new THREE.Vector3(-7, 0.1, 4),
      builder: createHumanModule
    },
    {
      id: 'certs',
      name: 'Validation Layer',
      color: 0xffd700,
      position: new THREE.Vector3(7, 0.1, 4),
      builder: createCertsModule
    },
    {
      id: 'projects',
      name: 'Innovation Core',
      color: 0x00ffd5,
      position: new THREE.Vector3(6, 0.1, -5),
      builder: createProjectsModule
    },
    {
      id: 'contact',
      name: 'Network Uplink',
      color: 0xffffff,
      position: new THREE.Vector3(0, 0.1, 7.5),
      builder: createContactModule
    }
  ];

  moduleData.forEach((data, index) => {
    const group = new THREE.Group();
    group.position.copy(data.position);
    
    // Call custom structural meshes builder
    data.builder(group, data.color);
    
    scene.add(group);
    
    // Attach point underlight glow
    const underlight = createModuleUnderlight(scene, data.position, data.color);

    // Save module metadata
    modules.push({
      id: data.id,
      name: data.name,
      color: `#${data.color.toString(16).padStart(6, '0')}`,
      mesh: group,
      underlight: underlight,
      originalY: group.position.y,
      index: index
    });
  });
}

// 1. Tech Module: Advanced geometric microprocessor chip
function createTechModule(group, color) {
  const baseGeo = new THREE.BoxGeometry(1.6, 0.15, 1.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.6, metalness: 0.6 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const metalGeo = new THREE.BoxGeometry(1.1, 0.12, 1.1);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.95 });
  const metal = new THREE.Mesh(metalGeo, metalMat);
  metal.position.y = 0.12;
  metal.castShadow = true;
  group.add(metal);

  // Floating core center
  const crystalGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x020202,
    emissive: color,
    emissiveIntensity: 1.5,
    roughness: 0.1
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 0.45;
  crystal.name = 'spinning_element';
  group.add(crystal);
}

// 2. Human Module: Circular network cluster with slow spinning rings
function createHumanModule(group, color) {
  const padGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.15, 8);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x080c14, roughness: 0.5, metalness: 0.8 });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.castShadow = true;
  pad.receiveShadow = true;
  group.add(pad);

  // Central orb
  const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x010101,
    emissive: color,
    emissiveIntensity: 1.0,
    roughness: 0.1
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 0.3;
  group.add(orb);

  // Orbital rings
  const ringGroup = new THREE.Group();
  ringGroup.position.y = 0.3;
  ringGroup.name = 'rotating_cluster';

  const ringGeo1 = new THREE.TorusGeometry(0.55, 0.035, 8, 32);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x6a6e85, metalness: 0.9, roughness: 0.2 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat);
  ring1.rotation.x = Math.PI / 4;
  ringGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo1, ringMat);
  ring2.rotation.y = Math.PI / 4;
  ringGroup.add(ring2);

  group.add(ringGroup);
}

// 3. Certifications Module: Secure locking data chip
function createCertsModule(group, color) {
  const baseGeo = new THREE.BoxGeometry(1.5, 0.15, 1.5);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6, metalness: 0.7 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  group.add(base);

  const vaultGeo = new THREE.BoxGeometry(0.9, 0.45, 0.9);
  const vaultMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.3, metalness: 0.9 });
  const vault = new THREE.Mesh(vaultGeo, vaultMat);
  vault.position.y = 0.25;
  vault.castShadow = true;
  group.add(vault);

  // Golden lock trace loop
  const lockGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI);
  const lockMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.95 });
  const lock = new THREE.Mesh(lockGeo, lockMat);
  lock.position.set(0, 0.48, 0);
  lock.rotation.z = Math.PI / 2;
  group.add(lock);

  // Status band
  const bandGeo = new THREE.BoxGeometry(0.92, 0.08, 0.92);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0x020202,
    emissive: color,
    emissiveIntensity: 1.2
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.y = 0.25;
  group.add(band);
}

// 4. Projects Module: High-capacity multi-layered RAM/SSD storage cards
function createProjectsModule(group, color) {
  const cardBaseGeo = new THREE.BoxGeometry(1.8, 0.1, 2.4);
  const cardBaseMat = new THREE.MeshStandardMaterial({ color: 0x080f1e, roughness: 0.8, metalness: 0.5 });
  const cardBase = new THREE.Mesh(cardBaseGeo, cardBaseMat);
  cardBase.castShadow = true;
  group.add(cardBase);

  // Two NVMe cards
  const ssdGeo = new THREE.BoxGeometry(0.55, 0.15, 1.8);
  const ssdMat = new THREE.MeshStandardMaterial({ color: 0x0b162a, roughness: 0.7, metalness: 0.7 });
  
  const ssd1 = new THREE.Mesh(ssdGeo, ssdMat);
  ssd1.position.set(-0.45, 0.1, 0);
  ssd1.castShadow = true;
  group.add(ssd1);

  const ssd2 = new THREE.Mesh(ssdGeo, ssdMat);
  ssd2.position.set(0.45, 0.1, 0);
  ssd2.castShadow = true;
  group.add(ssd2);

  // Gold connector tracks at front edge
  const connectorGeo = new THREE.BoxGeometry(1.6, 0.05, 0.15);
  const connMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
  const connector = new THREE.Mesh(connectorGeo, connMat);
  connector.position.set(0, 0.06, 1.15);
  group.add(connector);

  // Activity blinking LED
  const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({ color: color });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(-0.6, 0.22, -0.7);
  led.name = 'blinking_led';
  group.add(led);
}

// 5. Contact Module: Uplink beam transmitter
function createContactModule(group, color) {
  const towerBaseGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.15, 6);
  const towerBaseMat = new THREE.MeshStandardMaterial({ color: 0x0e111d, roughness: 0.5, metalness: 0.8 });
  const towerBase = new THREE.Mesh(towerBaseGeo, towerBaseMat);
  towerBase.castShadow = true;
  group.add(towerBase);

  // Uplink dish cylinder
  const dishGeo = new THREE.CylinderGeometry(0.4, 0.15, 0.45, 8);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0x141829, roughness: 0.3, metalness: 0.95 });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.y = 0.25;
  dish.castShadow = true;
  group.add(dish);

  // Emissive signal tip
  const tipGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    emissive: 0x00f3ff,
    emissiveIntensity: 1.5
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = 0.55;
  group.add(tip);

  // Vertical light transmission beam
  const beamGeo = new THREE.CylinderGeometry(0.18, 0.18, 12, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 6.4;
  beam.name = 'contact_beam';
  group.add(beam);
}

// Raycasting module detection
let currentHoveredModule = null;

export function checkModuleInteraction(raycaster) {
  if (!isCpuActive()) return null;

  let intersectedModule = null;

  for (let mod of modules) {
    // Intersect objects in current module group
    const intersects = raycaster.intersectObjects(mod.mesh.children, true);
    if (intersects.length > 0) {
      intersectedModule = mod;
      break;
    }
  }

  // Hover animations management
  if (intersectedModule !== currentHoveredModule) {
    if (currentHoveredModule) {
      triggerHoverState(currentHoveredModule, false);
    }
    currentHoveredModule = intersectedModule;
    if (intersectedModule) {
      triggerHoverState(intersectedModule, true);
    }
  }

  return intersectedModule;
}

function triggerHoverState(moduleObj, isHovered) {
  const mesh = moduleObj.mesh;
  const underlight = moduleObj.underlight;
  
  // Clean up any active tween for this module
  if (hoverTweens.has(moduleObj.id)) {
    hoverTweens.get(moduleObj.id).kill();
  }

  const targetY = isHovered ? moduleObj.originalY + 0.35 : moduleObj.originalY;
  const targetLightIntensity = isHovered ? 6.0 : 3.0;

  // Create GSAP transition for hover float
  const tween = gsap.to(mesh.position, {
    y: targetY,
    duration: 0.4,
    ease: 'power2.out',
    onUpdate: () => {
      // Keep pointlight synced with mesh position
      underlight.position.y = mesh.position.y + 0.2;
    }
  });

  // Intensify underlight glow
  gsap.to(underlight, {
    intensity: targetLightIntensity,
    duration: 0.4
  });

  hoverTweens.set(moduleObj.id, tween);
}

// Reset glow when closing modules view
export function resetModuleGlows() {
  modules.forEach(mod => {
    triggerHoverState(mod, false);
  });
}

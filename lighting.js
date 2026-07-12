import * as THREE from 'three';

let ambientLight, dirLight1, dirLight2, cpuSpotLight;
let moduleLights = [];

export function initLighting(scene) {
  // Ambient fill light (dark futuristic blue-navy tone)
  ambientLight = new THREE.AmbientLight(0x060814, 0.6);
  scene.add(ambientLight);

  // Directional key light with shadows
  dirLight1 = new THREE.DirectionalLight(0x00f3ff, 0.8);
  dirLight1.position.set(10, 15, 10);
  dirLight1.castShadow = true;
  dirLight1.shadow.mapSize.width = 1024;
  dirLight1.shadow.mapSize.height = 1024;
  dirLight1.shadow.camera.near = 0.5;
  dirLight1.shadow.camera.far = 40;
  
  const d = 15;
  dirLight1.shadow.camera.left = -d;
  dirLight1.shadow.camera.right = d;
  dirLight1.shadow.camera.top = d;
  dirLight1.shadow.camera.bottom = -d;
  dirLight1.shadow.bias = -0.0005;
  scene.add(dirLight1);

  // Rim filler light (violet tint)
  dirLight2 = new THREE.DirectionalLight(0xbd00ff, 0.4);
  dirLight2.position.set(-10, 8, -10);
  scene.add(dirLight2);

  // CPU Volumetric Spotlight
  cpuSpotLight = new THREE.SpotLight(0x00ffd5, 0.5, 30, Math.PI / 6, 0.5, 1.2);
  cpuSpotLight.position.set(0, 15, 0);
  cpuSpotLight.target.position.set(0, 0, 0);
  cpuSpotLight.castShadow = true;
  cpuSpotLight.shadow.mapSize.width = 512;
  cpuSpotLight.shadow.mapSize.height = 512;
  scene.add(cpuSpotLight);
  scene.add(cpuSpotLight.target);
}

// Set up underlight glows for modules
export function createModuleUnderlight(scene, position, color) {
  const light = new THREE.PointLight(color, 0, 8, 1.8);
  light.position.copy(position);
  // Elevate point light slightly above module to wash over it
  light.position.y += 0.2;
  scene.add(light);
  moduleLights.push({ light, targetIntensity: 0, color });
  return light;
}

// Fade in point lights when module/energy system triggers
export function activateModuleLight(index, intensity = 4.0) {
  if (moduleLights[index]) {
    moduleLights[index].targetIntensity = intensity;
  }
}

export function activateAllModuleLights(intensity = 2.0) {
  moduleLights.forEach(item => {
    item.targetIntensity = intensity;
  });
}

export function setCpuSpotIntensity(intensity) {
  if (cpuSpotLight) {
    cpuSpotLight.intensity = intensity;
  }
}

// Animate subtle lighting oscillations for cybernetic lab feeling
export function updateLighting(time) {
  if (cpuSpotLight) {
    // Subtle hum/pulse on CPU spot intensity
    const base = cpuSpotLight.intensity;
    const pulse = Math.sin(time * 5.0) * 0.05;
    cpuSpotLight.intensity = Math.max(0.1, base + pulse);
  }

  // Smoothly interpolate point underlights
  moduleLights.forEach(item => {
    item.light.intensity += (item.targetIntensity - item.light.intensity) * 0.08;
    // Add micro flicker to active module light
    if (item.light.intensity > 0.5) {
      item.light.intensity += (Math.random() - 0.5) * 0.08;
    }
  });

  // Rotate key light slightly for dynamic metallic sheen
  if (dirLight1) {
    dirLight1.position.x = 12 + Math.cos(time * 0.1) * 3;
    dirLight1.position.z = 12 + Math.sin(time * 0.1) * 3;
  }
}

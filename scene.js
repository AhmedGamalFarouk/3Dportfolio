import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

import { initLighting, updateLighting } from './lighting.js';
import { initCPU, checkCpuClick, pulseCpuCore, isCpuActive } from './cpu.js';
import { initEnergySystem, triggerEnergyFlow, updateEnergySystem } from './energySystem.js';
import { initModules, checkModuleInteraction, resetModuleGlows } from './modules.js';
import { initParticles, triggerCpuExplosion, updateParticles } from './particles.js';
import { updateHologramPositions } from './hologramUI.js';
import { STATES, currentState, transitionTo, updateSystemStatus } from './main.js';

export let scene, camera, renderer, composer, controls;
let raycaster, mouse;
let isTransitioningCamera = false;
let focusedModule = null;

export function initScene() {
  const canvas = document.getElementById('webgl-canvas');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010103);
  
  // Fog for deep atmosphere
  scene.fog = new THREE.FogExp2(0x010103, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  // Start far back in darkness
  camera.position.set(0, 30, 50);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Postprocessing Composer for cinematic bloom
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.4, // strength
    0.35, // radius
    0.15 // threshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't allow camera to go underground
  controls.minDistance = 3;
  controls.maxDistance = 45;
  controls.target.set(0, 0, 0);
  controls.enabled = false; // Disable during intro sequence

  // Interactions setup
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Initialize Subcomponents
  initLighting(scene);
  initCPU(scene);
  initModules(scene);
  initEnergySystem(scene);
  initParticles(scene);

  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click', onCanvasClick);

  // Run Cinematic Intro Animation
  runCinematicIntro();
}

function runCinematicIntro() {
  // Slow dolly forward using GSAP
  gsap.to(camera.position, {
    x: 0,
    y: 14,
    z: 22,
    duration: 5.5,
    ease: 'power2.out',
    onUpdate: () => {
      camera.lookAt(0, 0, 0);
    },
    onComplete: () => {
      controls.enabled = true;
      controls.saveState(); // Save standard overview camera
      
      // Flash text to indicate system is ready
      transitionTo(STATES.CORE_INACTIVE);
    }
  });

  // Slow pan and rotation of status
  gsap.to(controls.target, {
    x: 0,
    y: 0.5,
    z: 0,
    duration: 5.5,
    ease: 'power2.out'
  });
}

function onMouseMove(event) {
  // Normalise mouse coords (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isTransitioningCamera) return;

  // Perform Raycasting for hover effects
  raycaster.setFromCamera(mouse, camera);
  
  if (currentState === STATES.CORE_INACTIVE) {
    const isCpuHovered = checkCpuClick(raycaster);
    document.body.style.cursor = isCpuHovered ? 'pointer' : 'default';
  } else if (currentState === STATES.CORE_ACTIVE) {
    const hoveredModule = checkModuleInteraction(raycaster);
    document.body.style.cursor = hoveredModule ? 'pointer' : 'default';
  }
}

function onCanvasClick() {
  if (isTransitioningCamera) return;

  raycaster.setFromCamera(mouse, camera);

  if (currentState === STATES.CORE_INACTIVE) {
    const isCpuClicked = checkCpuClick(raycaster);
    if (isCpuClicked) {
      triggerCoreActivation();
    }
  } else if (currentState === STATES.CORE_ACTIVE) {
    const clickedModule = checkModuleInteraction(raycaster);
    if (clickedModule) {
      focusOnModule(clickedModule);
    }
  }
}

function triggerCoreActivation() {
  isTransitioningCamera = true;
  document.body.style.cursor = 'default';
  updateSystemStatus('CORE_SURGE', 'Drawing power surge from core system… sparks detected.');

  // Camera Shake & Cinematic flash
  cameraShake(1.5);
  triggerCpuExplosion();
  
  // Power sound and energy lines flow from core to modules
  setTimeout(() => {
    triggerEnergyFlow(() => {
      // Once energy flows to all modules, core is fully active
      isTransitioningCamera = false;
      transitionTo(STATES.CORE_ACTIVE);
    });
  }, 500);
}

function cameraShake(duration) {
  const shakeData = { intensity: 0.15 };
  const origPos = camera.position.clone();
  
  gsap.to(shakeData, {
    intensity: 0.001,
    duration: duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.position.x = origPos.x + (Math.random() - 0.5) * shakeData.intensity;
      camera.position.y = origPos.y + (Math.random() - 0.5) * shakeData.intensity;
      camera.position.z = origPos.z + (Math.random() - 0.5) * shakeData.intensity;
    },
    onComplete: () => {
      camera.position.copy(origPos);
    }
  });
}

export function focusOnModule(moduleData) {
  isTransitioningCamera = true;
  focusedModule = moduleData;

  // Disable orbit controls temporarily
  controls.enabled = false;

  // Calculate target camera offset position relative to module's position
  const targetPos = new THREE.Vector3()
    .copy(moduleData.mesh.position)
    .add(new THREE.Vector3(0, 3, 5)); // Look from slightly above and in front

  // Animate Camera position
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 1.8,
    ease: 'power3.inOut'
  });

  // Animate orbit controls target to focus directly on module center
  gsap.to(controls.target, {
    x: moduleData.mesh.position.x,
    y: moduleData.mesh.position.y + 0.5,
    z: moduleData.mesh.position.z,
    duration: 1.8,
    ease: 'power3.inOut',
    onComplete: () => {
      isTransitioningCamera = false;
      controls.enabled = true; // Allow small orbit rotation in module view
      
      // Limit zoom and pan in module focus to maintain visuals
      controls.minDistance = 2;
      controls.maxDistance = 10;
      
      transitionTo(STATES.MODULE_FOCUSED, moduleData);
    }
  });
}

export function resetCameraToCore() {
  isTransitioningCamera = true;
  focusedModule = null;
  controls.enabled = false;

  // Reset controls limits
  controls.minDistance = 3;
  controls.maxDistance = 45;

  // Animate target back to center
  gsap.to(controls.target, {
    x: 0,
    y: 0.5,
    z: 0,
    duration: 1.5,
    ease: 'power3.inOut'
  });

  // Animate camera back to standard overview
  gsap.to(camera.position, {
    x: 0,
    y: 12,
    z: 18,
    duration: 1.5,
    ease: 'power3.inOut',
    onComplete: () => {
      isTransitioningCamera = false;
      controls.enabled = true;
      resetModuleGlows();
      transitionTo(STATES.CORE_ACTIVE);
    }
  });
}

export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// Render loop
export function animateScene() {
  requestAnimationFrame(animateScene);

  // Update controls
  if (controls.enabled) {
    controls.update();
  }

  const time = performance.now() * 0.001;

  // Pulsing effects
  pulseCpuCore(time);
  
  // Animation Updates
  updateLighting(time);
  updateEnergySystem(time);
  updateParticles(time);
  
  // Project HTML Holograms over module locations
  if (currentState === STATES.MODULE_FOCUSED && focusedModule) {
    updateHologramPositions(focusedModule.mesh.position, camera);
  }

  // Render
  composer.render();
}

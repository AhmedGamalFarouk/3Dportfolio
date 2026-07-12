import { initScene, animateScene, focusOnModule, resetCameraToCore } from './scene.js';
import { initHolograms, showHologram, hideAllHolograms } from './hologramUI.js';
import { initSpiralAnimation } from './spiralAnimation.js';

// Application States
export const STATES = {
  WELCOME: 'WELCOME',
  INTRO: 'INTRO',
  CORE_INACTIVE: 'CORE_INACTIVE',
  CORE_ACTIVE: 'CORE_ACTIVE',
  MODULE_FOCUSED: 'MODULE_FOCUSED'
};

export let currentState = STATES.WELCOME;

// Web Audio API Synthesizer for high-tech sci-fi sounds
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.modulator = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  playClick() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playPowerSurge() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    // Sub-bass rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(25, now);
    subOsc.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    // High sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(100, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(1800, now + 1.0);
    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 1.0);

    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(this.ctx.destination);

    // White noise (sparks)
    const bufferSize = this.ctx.sampleRate * 0.6;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(6000, now + 0.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    subOsc.start();
    subOsc.stop(now + 1.5);

    sweepOsc.start();
    sweepOsc.stop(now + 1.2);

    whiteNoise.start();
    whiteNoise.stop(now + 0.6);
  }

  startAmbient() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ambientOsc) return;

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();
    this.modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 55; // 55Hz C1 low hum

    this.modulator.frequency.value = 3.5; // Flutter speed
    modGain.gain.value = 1.5; // Flutter depth

    this.modulator.connect(modGain);
    modGain.connect(this.ambientOsc.frequency);

    this.ambientGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.modulator.start();
    this.ambientOsc.start();
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        const osc = this.ambientOsc;
        const mod = this.modulator;
        setTimeout(() => {
          try {
            osc.stop();
            mod.stop();
          } catch(e) {}
        }, 500);
      } catch(e) {}
      this.ambientOsc = null;
      this.ambientGain = null;
      this.modulator = null;
    }
  }

  playChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (A Major)

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;

      const delay = idx * 0.08;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  }
}

export const synth = new AudioSynth();

// DOM References
const welcomeOverlay = document.getElementById('welcome-overlay');
const enterBtn = document.getElementById('enter-btn');
const hudOverlay = document.getElementById('hud-overlay');
const systemStatusText = document.getElementById('system-status-text');
const instructionText = document.getElementById('instruction-text');
const backBtn = document.getElementById('back-btn');

// Start the whole application
window.addEventListener('DOMContentLoaded', () => {
  // Setup click listener for Enter button
  enterBtn.addEventListener('click', handleWelcomeEnter);
  
  // Back to Motherboard button click
  backBtn.addEventListener('click', handleBackToCore);
});

// Transition from Welcome Overlay to Cinematic Intro
function handleWelcomeEnter() {
  synth.playClick();
  
  // Brief wait to play click, then fade welcome overlay
  welcomeOverlay.style.opacity = '0';
  
  setTimeout(() => {
    welcomeOverlay.remove();
    initialize3DExperience();
  }, 1500);
}

// Set up and start 3D Environment
function initialize3DExperience() {
  currentState = STATES.INTRO;
  
  // Start the background mechanical ambient sound
  synth.startAmbient();
  
  // Show base HUD
  hudOverlay.classList.remove('hidden');
  updateSystemStatus('INITIALIZING INTERFACE…', 'Booting neural motherboard diagnostics…');

  // Initialize Spiral Animation Background
  initSpiralAnimation();

  // Initialize Three.js scene
  initScene();
  
  // Initialize floating UI systems
  initHolograms();
  
  // Start the render loop
  animateScene();
}

// Function to trigger state change
export function transitionTo(newState, data = null) {
  currentState = newState;
  
  switch(currentState) {
    case STATES.CORE_INACTIVE:
      updateSystemStatus('CORE_INACTIVE', 'Interact with Central CPU Core to initialize energy routing.');
      backBtn.classList.add('hidden');
      hideAllHolograms();
      break;
      
    case STATES.CORE_ACTIVE:
      updateSystemStatus('CORE_ACTIVE', 'Neural pathways primed. Select a capability module for deep inspection.');
      backBtn.classList.add('hidden');
      hideAllHolograms();
      break;
      
    case STATES.MODULE_FOCUSED:
      const moduleName = data ? data.name : 'MODULE';
      const color = data ? data.color : '#00f3ff';
      
      updateSystemStatus(`INSPECTING: ${moduleName.toUpperCase()}`, `Neural terminal focused on ${moduleName} node. Click BACK to return.`);
      
      // Play high-tech module click sound
      synth.playChime();
      
      // Render relevant UI panel
      showHologram(data);
      
      // Show back button
      backBtn.classList.remove('hidden');
      break;
  }
}

// UI Helper to update status bar and guidelines
export function updateSystemStatus(status, instructions) {
  systemStatusText.innerText = `SYSTEM: ${status}`;
  instructionText.innerText = instructions;
  
  // Briefly flicker the status text for sci-fi look
  systemStatusText.style.animation = 'none';
  // Trigger reflow
  void systemStatusText.offsetWidth;
  systemStatusText.style.animation = 'pulse 0.5s ease 1';
}

function handleBackToCore() {
  synth.playClick();
  resetCameraToCore();
}

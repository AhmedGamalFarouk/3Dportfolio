import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore } from '@/store/useStore';
import { Lighting } from './Lighting';
import { CPU } from './CPU';
import { Modules } from './Modules';
import { EnergySystem } from './EnergySystem';
import { Particles } from './Particles';
import { CameraRig } from './CameraRig';
import { HologramPanel } from '../ui/HologramPanel';
import type { ModuleData } from '@/types';

export function MotherboardScene() {
  const { currentState, setFocusedModule, setCurrentState, focusedModule } = useStore();

  const handleModuleFocus = (module: ModuleData) => {
    setFocusedModule(module);
    setCurrentState('MODULE_FOCUSED');
  };

  const handlePanelClose = () => {
    // Dispatch window event for CameraRig reset transition
    window.dispatchEvent(new CustomEvent('reset-camera'));
    setFocusedModule(null);
  };

  // Do not render Three.js scene during welcome screen to save performance
  if (currentState === 'WELCOME') return null;

  return (
    <div className="webgl-canvas-container">
      <Canvas
        id="webgl-canvas"
        shadows
        camera={{ position: [0, 30, 50], fov: 55, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        {/* Dynamic Fog */}
        <fogExp2 attach="fog" color={0x000000} density={0.035} />

        {/* Dynamic Lighting System */}
        <Lighting />

        {/* Central CPU Reactor */}
        <CPU />

        {/* Dynamic Modular Sub-circuits */}
        <Modules onFocus={handleModuleFocus} />

        {/* High-voltage electrical energy flow paths */}
        <EnergySystem />

        {/* Dynamic spark explosion system */}
        <Particles />

        {/* Cinematically active camera manager */}
        <CameraRig />

        {/* Floating HTML Hologram overlay */}
        {currentState === 'MODULE_FOCUSED' && (
          <HologramPanel onClose={handlePanelClose} />
        )}

        {/* Post-processing bloom filter for neon glowing details */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

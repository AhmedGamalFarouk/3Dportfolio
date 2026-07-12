import { useStore } from '@/store/useStore';
import { useAudio } from '@/hooks/useAudio';
import { SpiralAnimation } from '@/components/ui/SpiralAnimation';
import { WelcomeOverlay } from '@/components/ui/WelcomeOverlay';
import { HUD } from '@/components/ui/HUD';
import { MotherboardScene } from '@/components/three/MotherboardScene';
import '@/styles/index.css';

export default function App() {
  const { currentState, setCurrentState, setHUDText } = useStore();
  const { startAmbient } = useAudio();

  const handleWelcomeEnter = () => {
    setCurrentState('INTRO');
    startAmbient();
  };

  const handleBackToCore = () => {
    window.dispatchEvent(new CustomEvent('reset-camera'));
  };

  return (
    <main className="app-root">
      {/* CRT Scanline Retro overlay filter */}
      <div className="crt-overlay" />

      {/* 2D Canvas Starfield (visible after welcome screen) */}
      {currentState !== 'WELCOME' && <SpiralAnimation />}

      {/* R3F Motherboard 3D Canvas */}
      <MotherboardScene />

      {/* HUD status navigation bar */}
      <HUD onBack={handleBackToCore} />

      {/* Welcome Screen Overlay */}
      {currentState === 'WELCOME' && (
        <WelcomeOverlay onEnter={handleWelcomeEnter} />
      )}
    </main>
  );
}

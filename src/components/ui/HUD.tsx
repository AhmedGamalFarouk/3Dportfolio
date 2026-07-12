import { useStore } from '@/store/useStore';
import { useAudio } from '@/hooks/useAudio';

interface HUDProps {
  onBack: () => void;
}

export function HUD({ onBack }: HUDProps) {
  const { currentState, statusText, instructionText } = useStore();
  const { playClick } = useAudio();

  const showBack = currentState === 'MODULE_FOCUSED';
  const isVisible = currentState !== 'WELCOME' && currentState !== 'INTRO';

  if (!isVisible) return null;

  const handleBack = () => {
    playClick();
    onBack();
  };

  return (
    <>
      <div className="hud-overlay" role="status" aria-live="polite">
        <div className="hud-header">
          <div className="hud-status">
            <span className="status-pulse" aria-hidden="true" />
            <span className="system-status-text">{statusText}</span>
          </div>
          <div className="hud-title">CORE_INTEL_v1.0.3</div>
        </div>
        <div className="instructions">
          <p className="instruction-text">{instructionText}</p>
        </div>
      </div>

      <button
        className={`hud-back-btn${showBack ? '' : ' hidden'}`}
        onClick={handleBack}
        aria-label="Return to motherboard overview"
        aria-hidden={!showBack}
        tabIndex={showBack ? 0 : -1}
      >
        &lt; BACK TO CORE
      </button>
    </>
  );
}

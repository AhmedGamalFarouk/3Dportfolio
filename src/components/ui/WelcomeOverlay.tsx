import { useRef } from 'react';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import { useAudio } from '@/hooks/useAudio';

interface WelcomeOverlayProps {
  onEnter: () => void;
}

export function WelcomeOverlay({ onEnter }: WelcomeOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { playClick } = useAudio();

  const handleEnter = () => {
    playClick();
    const el = overlayRef.current;
    if (!el) { onEnter(); return; }

    gsap.to(el, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: onEnter,
    });
  };

  return (
    <div ref={overlayRef} className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Portfolio welcome screen">
      <div className="welcome-content">
        <h1 className="welcome-title">
          WELCOME TO AHMED GAMAL FAROUK'S PORTFOLIO
        </h1>
        <button
          id="enter-btn"
          className="glow-button"
          onClick={handleEnter}
          aria-label="Enter the portfolio experience"
        >
          [ ENTER ]
        </button>
      </div>
    </div>
  );
}

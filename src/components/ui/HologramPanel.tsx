import { useEffect, useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import { portfolioData } from '@/data/portfolioData';

interface HologramPanelProps {
  onClose: () => void;
}

export function HologramPanel({ onClose }: HologramPanelProps) {
  const { focusedModule } = useStore();
  const [codeLogs, setCodeLogs] = useState<string[]>([]);
  const tiltCardRefs = useRef<HTMLAnchorElement[]>([]);

  // Tech console simulation logs
  useEffect(() => {
    if (focusedModule?.id !== 'tech') return;
    const lines = [
      'import { system } from "core-ai";',
      'const module = NeuralNet.load("ahmed");',
      '>> Flutter state: OK',
      '>> SQLite storage active: yes',
      '>> React Native channels: linked',
      '>> Angular state: STANDBY',
      'connecting client port: 5080...',
      'fetching certificates validation...',
      'auth token resolved: SECURE',
      'syncing local databases SQLite...',
      'system memory load: 38.2%',
    ];
    const interval = setInterval(() => {
      const line = lines[Math.floor(Math.random() * lines.length)];
      setCodeLogs((prev) => {
        const next = [...prev, line];
        return next.slice(-12); // Keep last 12 lines
      });
    }, 900);
    return () => clearInterval(interval);
  }, [focusedModule]);

  if (!focusedModule) return null;

  const handleTiltMouseMove = (e: React.MouseEvent<HTMLAnchorElement>, idx: number) => {
    const card = tiltCardRefs.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    card.style.boxShadow = `0 10px 20px rgba(0, 255, 213, 0.2), inset 0 0 10px rgba(0, 255, 213, 0.1)`;
  };

  const handleTiltMouseLeave = (idx: number) => {
    const card = tiltCardRefs.current[idx];
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    card.style.boxShadow = `none`;
  };

  const panelStyles = {
    '--panel-color': focusedModule.color,
    '--panel-color-rgb': focusedModule.id === 'tech' ? '0, 243, 255' :
                         focusedModule.id === 'human' ? '189, 0, 255' :
                         focusedModule.id === 'certs' ? '255, 215, 0' :
                         focusedModule.id === 'projects' ? '0, 255, 213' : '255, 255, 255',
  } as React.CSSProperties;

  return (
    <Html
      position={[focusedModule.position[0], focusedModule.position[1] + 1.6, focusedModule.position[2]]}
      center
      distanceFactor={8}
      zIndexRange={[10, 50]}
    >
      <div className="hologram-panel" style={panelStyles} role="dialog" aria-label={focusedModule.name}>
        <button className="hologram-close" onClick={onClose} aria-label="Close panel">
          [ X ]
        </button>
        <h2>{focusedModule.name.toUpperCase()}</h2>

        {/* ─── Tech Panel ─── */}
        {focusedModule.id === 'tech' && (
          <div className="holo-content">
            <div className="code-stream-bg" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(0, 243, 255, 0.45)', height: '80px', overflow: 'hidden', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,243,255,0.1)' }}>
              {codeLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
            <h3>// CORE CAPABILITIES</h3>
            <div className="skill-tags">
              {portfolioData.skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Human Panel ─── */}
        {focusedModule.id === 'human' && (
          <div className="holo-content">
            <h3>// SOFT SKILLS</h3>
            <div className="soft-skill-list">
              {portfolioData.softSkills.map((skill) => (
                <span key={skill} className="soft-skill-orb">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Certs Panel ─── */}
        {focusedModule.id === 'certs' && (
          <div className="holo-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <h3>// VALIDATION LAYER</h3>
            <ul className="cert-list">
              {portfolioData.certifications.map((cert) => (
                <li key={cert.name}>
                  <span className="cert-name">{cert.name}</span>
                  <span className="cert-issuer">{cert.issuer} ({cert.year})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ─── Projects Panel ─── */}
        {focusedModule.id === 'projects' && (
          <div className="holo-content" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <h3>// ACTIVE REPOS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {portfolioData.projects.map((project, idx) => (
                <a
                  key={project.title}
                  href={project.link || 'https://github.com/AhmedGamalFarouk'}
                  target="_blank"
                  rel="noopener noreferrer"
                  ref={(el) => { if (el) tiltCardRefs.current[idx] = el; }}
                  className="project-card"
                  onMouseMove={(e) => handleTiltMouseMove(e, idx)}
                  onMouseLeave={() => handleTiltMouseLeave(idx)}
                  style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.1s ease' }}
                >
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ─── Contact Panel ─── */}
        {focusedModule.id === 'contact' && (
          <div className="holo-content">
            <h3>// TRANSMISSION CODES</h3>
            <ul className="contact-list">
              <li>
                <a href={`mailto:${portfolioData.contact.email}`}>
                  📧 EMAIL: {portfolioData.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${portfolioData.contact.phone.replace(/\s+/g, '')}`}>
                  📞 PHONE: {portfolioData.contact.phone}
                </a>
              </li>
              <li>
                <a href={`https://${portfolioData.contact.linkedin}`} target="_blank" rel="noopener noreferrer">
                  🔗 LINKEDIN: ahmedgamalfarouk
                </a>
              </li>
              <li>
                <a href={`https://${portfolioData.contact.github}`} target="_blank" rel="noopener noreferrer">
                  🐙 GITHUB: AhmedGamalFarouk
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Html>
  );
}

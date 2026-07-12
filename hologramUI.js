import * as THREE from 'three';
import { resetCameraToCore } from './scene.js';

let container;
let activePanel = null;
const tempV = new THREE.Vector3();

// Define data structures using Ahmed Gamal Farouk's actual resume contents
const dataContent = {
  tech: {
    title: 'TECHNICAL INTEL',
    color: '#00f3ff',
    rgb: '0, 243, 255',
    html: `
      <div class="code-stream-bg" id="code-bg"></div>
      <div class="holo-section-title">// PROGRAMMING LANGUAGES</div>
      <div class="tech-skill-group">
        <div class="tech-skill-tags">
          <span class="tech-tag">Dart</span>
          <span class="tech-tag">JavaScript</span>
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Java</span>
          <span class="tech-tag">SQL</span>
          <span class="tech-tag">HTML</span>
          <span class="tech-tag">CSS</span>
        </div>
      </div>
      
      <div class="holo-section-title">// FRAMEWORKS & LIBRARIES</div>
      <div class="tech-skill-group">
        <div class="tech-skill-tags">
          <span class="tech-tag" style="border-color: #02a9ff; color: #02a9ff;">Flutter</span>
          <span class="tech-tag" style="border-color: #61dafb; color: #61dafb;">React</span>
          <span class="tech-tag" style="border-color: #61dafb; color: #61dafb;">React Native</span>
          <span class="tech-tag" style="border-color: #dd0031; color: #dd0031;">Angular</span>
        </div>
      </div>

      <div class="holo-section-title">// BACKEND & DATABASES</div>
      <div class="tech-skill-group">
        <div class="tech-skill-tags">
          <span class="tech-tag">Firebase</span>
          <span class="tech-tag">SQLite</span>
          <span class="tech-tag">REST APIs</span>
        </div>
      </div>

      <div class="holo-section-title">// TOOLS & METHODS</div>
      <div class="tech-skill-group">
        <div class="tech-skill-tags">
          <span class="tech-tag">Git</span>
          <span class="tech-tag">GitHub</span>
          <span class="tech-tag">VS Code</span>
          <span class="tech-tag">Cursor</span>
          <span class="tech-tag">Android Studio</span>
          <span class="tech-tag">Figma</span>
          <span class="tech-tag">CI/CD</span>
        </div>
      </div>
    `
  },
  human: {
    title: 'HUMAN FACTOR',
    color: '#bd00ff',
    rgb: '189, 0, 255',
    html: `
      <div class="holo-section-title">// INTERPERSONAL SYSTEM</div>
      <div class="soft-skill-list">
        <div class="soft-skill-item">
          <div class="soft-skill-dot"></div>
          <div class="soft-skill-text">Team Collaboration & Agile/Scrum</div>
        </div>
        <div class="soft-skill-item">
          <div class="soft-skill-dot"></div>
          <div class="soft-skill-text">Problem-Solving & Critical Thinking</div>
        </div>
        <div class="soft-skill-item">
          <div class="soft-skill-dot"></div>
          <div class="soft-skill-text">Creative Technical Direction</div>
        </div>
        <div class="soft-skill-item">
          <div class="soft-skill-dot"></div>
          <div class="soft-skill-text">System Architecting</div>
        </div>
        <div class="soft-skill-item">
          <div class="soft-skill-dot"></div>
          <div class="soft-skill-text">Effective Communication</div>
        </div>
      </div>
    `
  },
  certs: {
    title: 'VALIDATION LAYER',
    color: '#ffd700',
    rgb: '255, 215, 0',
    html: `
      <div class="holo-section-title">// VERIFIED CREDENTIALS</div>
      <div class="cert-slider">
        <div class="cert-card">
          <div class="cert-name">Front End & Crossplatform Mobile Development</div>
          <div class="cert-org">Information Technology Institute (ITI)</div>
        </div>
        <div class="cert-card">
          <div class="cert-name">Flutter Development</div>
          <div class="cert-org">Orange Digital Center</div>
        </div>
        <div class="cert-card">
          <div class="cert-name">Information Technology Specialist - Network Security</div>
          <div class="cert-org">Microsoft</div>
        </div>
        <div class="cert-card">
          <div class="cert-name">UX Design Certification</div>
          <div class="cert-org">Udacity</div>
        </div>
        <div class="cert-card">
          <div class="cert-name">Java Development</div>
          <div class="cert-org">ITI (Maharatech)</div>
        </div>
        <div class="cert-card">
          <div class="cert-name">Software Development Fundamentals</div>
          <div class="cert-org">Microsoft</div>
        </div>
      </div>
    `
  },
  projects: {
    title: 'INNOVATION CORE',
    color: '#00ffd5',
    rgb: '0, 255, 213',
    html: `
      <div class="holo-section-title">// REALIZED ARCHITECTURES</div>
      <div class="project-card-container">
        <div class="project-card tilt-card" onclick="window.open('https://github.com/ahmedgamalfarouk', '_blank')">
          <div class="project-title">Eshtry Menny</div>
          <div class="project-desc">A full e-commerce shopping client built with Flutter, SQLite local persistence, and BLoC state architecture.</div>
        </div>
        
        <div class="project-card tilt-card" onclick="window.open('https://github.com/ahmedgamalfarouk', '_blank')">
          <div class="project-title">Cinema Flux</div>
          <div class="project-desc">A futuristic, sleek, cinematic movies platform developed using React, Redux Toolkit, and Vite compilation.</div>
        </div>
        
        <div class="project-card tilt-card" onclick="window.open('https://github.com/ahmedgamalfarouk', '_blank')">
          <div class="project-title">Circle & Circle-Mobile</div>
          <div class="project-desc">A dual event planning ecosystem (React web + React Native mobile app) integrated with Firebase realtime Firestore.</div>
        </div>

        <div class="project-card tilt-card" onclick="window.open('https://github.com/ahmedgamalfarouk', '_blank')">
          <div class="project-title">Social Media App</div>
          <div class="project-desc">Full social networking system leveraging Flutter, Firebase Auth, Firestore, and cloud storage.</div>
        </div>
      </div>
    `
  },
  contact: {
    title: 'NETWORK UPLINK',
    color: '#ffffff',
    rgb: '255, 255, 255',
    html: `
      <div class="holo-section-title">// TRANSMISSION CODES</div>
      <div class="contact-list">
        <a href="mailto:ahmedgamalfarouk0@gmail.com" class="contact-item">
          <span class="contact-icon">📧</span>
          <div>
            <div class="contact-label">EMAIL</div>
            <div class="contact-value">ahmedgamalfarouk0@gmail.com</div>
          </div>
        </a>
        
        <a href="tel:+201023510831" class="contact-item">
          <span class="contact-icon">📞</span>
          <div>
            <div class="contact-label">PHONE</div>
            <div class="contact-value">+20 102 351 0831</div>
          </div>
        </a>

        <a href="https://linkedin.com" target="_blank" class="contact-item">
          <span class="contact-icon">🔗</span>
          <div>
            <div class="contact-label">LINKEDIN</div>
            <div class="contact-value">ahmedgamalfarouk</div>
          </div>
        </a>

        <a href="https://github.com/ahmedgamalfarouk" target="_blank" class="contact-item">
          <span class="contact-icon">🐙</span>
          <div>
            <div class="contact-label">GITHUB</div>
            <div class="contact-value">github.com/ahmedgamalfarouk</div>
          </div>
        </a>
      </div>
    `
  }
};

export function initHolograms() {
  container = document.getElementById('hologram-container');
}

export function showHologram(moduleData) {
  const content = dataContent[moduleData.id];
  if (!content) return;

  hideAllHolograms();

  // Create panel DOM element
  const panel = document.createElement('div');
  panel.className = 'holo-panel';
  panel.style.setProperty('--panel-color', content.color);
  panel.style.setProperty('--panel-color-rgb', content.rgb);
  
  panel.innerHTML = `
    <div class="holo-header">
      <span>${content.title}</span>
      <button class="holo-close-btn">[ X ]</button>
    </div>
    <div class="holo-content">
      ${content.html}
    </div>
  `;

  // Attach Close listener
  panel.querySelector('.holo-close-btn').addEventListener('click', () => {
    resetCameraToCore();
  });

  container.appendChild(panel);
  container.classList.remove('hidden');
  activePanel = panel;

  // Trigger tech background code simulation
  if (moduleData.id === 'tech') {
    startCodeSimulation();
  }

  // Set up 3D card tilt triggers for projects
  if (moduleData.id === 'projects') {
    setupCardTilting();
  }
}

export function hideAllHolograms() {
  container.classList.add('hidden');
  container.innerHTML = '';
  activePanel = null;
}

// 3D Screen coordinate projection calculation
export function updateHologramPositions(modulePos, camera) {
  if (!activePanel) return;

  // Projects module coordinates relative to camera view
  tempV.copy(modulePos);
  tempV.project(camera);

  // Behind the camera frustum check
  if (tempV.z > 1) {
    activePanel.style.display = 'none';
    return;
  }

  // Convert NDCs (-1 to +1) to screen-space pixel coordinates
  const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;

  activePanel.style.display = 'block';
  activePanel.style.left = `${x}px`;
  
  // Position panel above module (with offset, e.g. Y - 130px)
  activePanel.style.top = `${y - 130}px`;
}

// Tech module background console logs simulation
function startCodeSimulation() {
  const codeBg = document.getElementById('code-bg');
  if (!codeBg) return;

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
    'system memory load: 38.2%'
  ];

  let logHtml = '';
  setInterval(() => {
    if (!document.getElementById('code-bg')) return;
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    logHtml += `<div>${randomLine}</div>`;
    
    // Keep max 15 lines
    const currentLines = logHtml.split('</div>');
    if (currentLines.length > 15) {
      logHtml = currentLines.slice(currentLines.length - 15).join('</div>');
    }
    
    codeBg.innerHTML = logHtml;
  }, 900);
}

// 3D Card tilt effect on hover for projects
function setupCardTilting() {
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Compute relative tilt angles (-12 to 12 degrees)
      const rotateX = -((y - height / 2) / (height / 2)) * 12;
      const rotateY = ((x - width / 2) / (width / 2)) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      card.style.boxShadow = `0 10px 20px rgba(0, 255, 213, 0.2), inset 0 0 10px rgba(0, 255, 213, 0.1)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      card.style.boxShadow = `none`;
    });
  });
}

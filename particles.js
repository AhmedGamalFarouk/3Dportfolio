import * as THREE from 'three';

let ambientParticles, ambientGeo;
let sparkPoints, sparkGeo;
let activeSparks = [];
const MAX_SPARKS = 150;

// Setup Particle Systems
export function initParticles(scene) {
  // CPU Sparks Explosion Particle System
  sparkGeo = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(MAX_SPARKS * 3);
  const sparkColors = new Float32Array(MAX_SPARKS * 3);
  
  // Fill buffers with dummy offscreen values
  for (let i = 0; i < MAX_SPARKS; i++) {
    sparkPositions[i * 3] = 999;
    sparkPositions[i * 3 + 1] = 999;
    sparkPositions[i * 3 + 2] = 999;

    sparkColors[i * 3] = 1.0;
    sparkColors[i * 3 + 1] = 0.85; // gold-yellowish spark
    sparkColors[i * 3 + 2] = 0.3;
  }

  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

  const sparkMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparkPoints);
}

// Spawn spark explosion when CPU is clicked
export function triggerCpuExplosion() {
  activeSparks = []; // Clear old sparks
  
  const positions = sparkGeo.attributes.position.array;
  
  for (let i = 0; i < MAX_SPARKS; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.5 + 2.0;
    const vY = Math.random() * 4.5 + 1.5;

    activeSparks.push({
      posX: 0,
      posY: 0.4,
      posZ: 0,
      velX: Math.cos(angle) * speed,
      velY: vY,
      velZ: Math.sin(angle) * speed,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.012,
      color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 1.0, 0.7) // Cyan-electric tones
    });
  }
}

// Update coordinates in animation loop
export function updateParticles(time) {
  // Constant delta time (approx 16ms)
  const dt = 0.016;

  // 2. Animate sparks physics
  if (sparkPoints && activeSparks.length > 0) {
    const positions = sparkGeo.attributes.position.array;
    const colors = sparkGeo.attributes.color.array;

    for (let i = 0; i < MAX_SPARKS; i++) {
      if (i < activeSparks.length) {
        const spark = activeSparks[i];
        
        // Physics update
        spark.posX += spark.velX * dt;
        spark.posY += spark.velY * dt;
        spark.posZ += spark.velZ * dt;
        
        // Add gravity
        spark.velY -= 9.8 * dt;
        // Friction
        spark.velX *= 0.96;
        spark.velY *= 0.98;
        spark.velZ *= 0.96;

        spark.life -= spark.decay;

        if (spark.life > 0) {
          positions[i * 3] = spark.posX;
          positions[i * 3 + 1] = spark.posY;
          positions[i * 3 + 2] = spark.posZ;

          // Fade spark color as it decays
          colors[i * 3] = spark.color.r * spark.life;
          colors[i * 3 + 1] = spark.color.g * spark.life;
          colors[i * 3 + 2] = spark.color.b * spark.life;
        } else {
          // Send dead particles offscreen
          positions[i * 3] = 999;
          positions[i * 3 + 1] = 999;
          positions[i * 3 + 2] = 999;
        }
      }
    }

    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;
    
    // Prune dead sparks
    if (activeSparks.every(s => s.life <= 0)) {
      activeSparks = [];
    }
  }
}

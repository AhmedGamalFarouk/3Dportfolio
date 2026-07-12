import * as THREE from 'three';
import gsap from 'gsap';

// ─── Vector helpers ───────────────────────────────────────────────────────────

class Vector2D {
  constructor(x, y) { this.x = x; this.y = y; }
  static random(min, max) { return min + Math.random() * (max - min); }
}

class Vector3D {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
}

// ─── Star ─────────────────────────────────────────────────────────────────────

class Star {
  constructor(cameraZ, cameraTravelDistance) {
    this.angle            = Math.random() * Math.PI * 2;
    this.distance         = 30 * Math.random() + 15;
    this.rotationDir      = Math.random() > 0.5 ? 1 : -1;
    this.expansionRate    = 1.2 + Math.random() * 0.8;
    this.finalScale       = 0.7 + Math.random() * 0.6;
    this.dx               = this.distance * Math.cos(this.angle);
    this.dy               = this.distance * Math.sin(this.angle);
    this.spiralLocation   = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
    this.z                = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);
    const lerp            = (a, b, t) => a * (1 - t) + b * t;
    this.z                = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation);
    this.strokeWeightFactor = Math.pow(Math.random(), 2.0);
  }

  render(p, ctrl) {
    const spiralPos = ctrl.spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;
    if (q <= 0) return;

    const dp = ctrl.constrain(4 * q, 0, 1);
    const linearE  = dp;
    const elasticE = ctrl.easeOutElastic(dp);
    const powerE   = dp * dp;

    let screenX, screenY;

    if (dp < 0.3) {
      const e = ctrl.lerp(linearE, powerE, dp / 0.3);
      screenX = ctrl.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, e / 0.3);
      screenY = ctrl.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, e / 0.3);
    } else if (dp < 0.7) {
      const mid  = (dp - 0.3) / 0.4;
      const cs   = Math.sin(mid * Math.PI) * this.rotationDir * 1.5;
      const bx   = spiralPos.x + this.dx * 0.3,  by = spiralPos.y + this.dy * 0.3;
      const tx   = spiralPos.x + this.dx * 0.7,  ty = spiralPos.y + this.dy * 0.7;
      const px   = -this.dy * 0.4 * cs,           py = this.dx * 0.4 * cs;
      screenX = ctrl.lerp(bx, tx, mid) + px * mid;
      screenY = ctrl.lerp(by, ty, mid) + py * mid;
    } else {
      const fp   = (dp - 0.7) / 0.3;
      const bx   = spiralPos.x + this.dx * 0.7,  by = spiralPos.y + this.dy * 0.7;
      const td   = this.distance * this.expansionRate * 1.5;
      const sa   = this.angle + 1.2 * this.rotationDir * fp * Math.PI;
      const tx   = spiralPos.x + td * Math.cos(sa);
      const ty   = spiralPos.y + td * Math.sin(sa);
      screenX = ctrl.lerp(bx, tx, fp);
      screenY = ctrl.lerp(by, ty, fp);
    }

    const vx = (this.z - ctrl.cameraZ) * screenX / ctrl.viewZoom;
    const vy = (this.z - ctrl.cameraZ) * screenY / ctrl.viewZoom;

    let sm = dp < 0.6
      ? 1.0 + dp * 0.2
      : 1.2 * (1 - (dp - 0.6) / 0.4) + this.finalScale * ((dp - 0.6) / 0.4);

    ctrl.showProjectedDot(new Vector3D(vx, vy, this.z), 8.5 * this.strokeWeightFactor * sm);
  }
}

// ─── AnimationController ──────────────────────────────────────────────────────

class AnimationController {
  constructor(canvas, ctx, width, height) {
    this.canvas               = canvas;
    this.ctx                  = ctx;
    this.width                = width;
    this.height               = height;
    this.time                 = 0;
    this.stars                = [];

    this.changeEventTime      = 0.32;
    this.cameraZ              = -400;
    this.cameraTravelDistance = 3400;
    this.startDotYOffset      = 28;
    this.viewZoom             = 100;
    this.numberOfStars        = 5000;
    this.trailLength          = 80;

    // seed stars with deterministic RNG
    const orig = Math.random;
    let seed   = 1234;
    Math.random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < this.numberOfStars; i++)
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
    Math.random = orig;

    this.timeline = gsap.timeline({ repeat: -1 });
    this.timeline.to(this, { time: 1, duration: 15, repeat: -1, ease: 'none', onUpdate: () => this.render() });
  }

  // ── math helpers ──────────────────────────────────────────────────
  ease(p, g)            { return p < 0.5 ? 0.5 * Math.pow(2*p, g) : 1 - 0.5 * Math.pow(2*(1-p), g); }
  easeOutElastic(x)     {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0; if (x >= 1) return 1;
    return Math.pow(2, -8*x) * Math.sin((x*8 - 0.75) * c4) + 1;
  }
  map(v, s1, e1, s2, e2) { return s2 + (e2 - s2) * ((v - s1) / (e1 - s1)); }
  constrain(v, lo, hi)    { return Math.min(Math.max(v, lo), hi); }
  lerp(a, b, t)           { return a * (1 - t) + b * t; }

  spiralPath(p) {
    p = this.constrain(1.2 * p, 0, 1);
    p = this.ease(p, 1.8);
    const turns = 6;
    const theta = 2 * Math.PI * turns * Math.sqrt(p);
    const r     = 170 * Math.sqrt(p);
    return new Vector2D(r * Math.cos(theta), r * Math.sin(theta) + this.startDotYOffset);
  }

  rotate(v1, v2, p, flip) {
    const mx = (v1.x + v2.x) / 2, my = (v1.y + v2.y) / 2;
    const dx = v1.x - mx, dy = v1.y - my;
    const a  = Math.atan2(dy, dx);
    const o  = flip ? -1 : 1;
    const r  = Math.sqrt(dx*dx + dy*dy);
    const b  = Math.sin(p * Math.PI) * 0.05 * (1 - p);
    const ea = this.easeOutElastic(p);
    return new Vector2D(mx + r*(1+b)*Math.cos(a + o*Math.PI*ea), my + r*(1+b)*Math.sin(a + o*Math.PI*ea));
  }

  showProjectedDot(pos, sz) {
    const t2  = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    const camZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;
    if (pos.z <= camZ) return;
    const depth = pos.z - camZ;
    const x  = this.viewZoom * pos.x / depth;
    const y  = this.viewZoom * pos.y / depth;
    const sw = 400 * sz / depth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, Math.max(sw / 2, 0.4), 0, Math.PI * 2);
    this.ctx.fill();
  }

  render() {
    const { ctx, width, height } = this;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * this.ease(t2, 2.7));

    // trail
    for (let i = 0; i < this.trailLength; i++) {
      const f  = this.map(i, 0, this.trailLength, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
      ctx.fillStyle = 'white';
      const pos = this.spiralPath(t1 - 0.00015 * i);
      const off = new Vector2D(pos.x + 5, pos.y + 5);
      const r   = this.rotate(pos, off, Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5, i % 2 === 0);
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(sw / 2, 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // stars
    ctx.fillStyle = 'white';
    for (const s of this.stars) s.render(t1, this);

    // origin dot
    if (this.time > this.changeEventTime) {
      const dy = this.cameraZ * this.startDotYOffset / this.viewZoom;
      this.showProjectedDot(new Vector3D(0, dy, this.cameraTravelDistance), 2.5);
    }

    ctx.restore();
  }

  destroy() { this.timeline.kill(); }
}

// ─── Public API ───────────────────────────────────────────────────────────────

let offscreenCanvas = null;
let offscreenCtx    = null;
let controller      = null;
let bgMesh          = null;
let bgTexture       = null;
let bgScene         = null;
let bgCamera        = null;
let resizeHandler   = null;

/**
 * Call once after Three.js renderer is ready.
 * Returns { bgScene, bgCamera } that you should render BEFORE the bloom composer.
 */
export function initSpiralBackground(renderer) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  // Offscreen 2-D canvas (no DPR scaling — the texture handles that)
  offscreenCanvas        = document.createElement('canvas');
  offscreenCanvas.width  = W;
  offscreenCanvas.height = H;
  offscreenCtx           = offscreenCanvas.getContext('2d');

  controller = new AnimationController(offscreenCanvas, offscreenCtx, W, H);

  // Canvas texture updated every frame
  bgTexture             = new THREE.CanvasTexture(offscreenCanvas);
  bgTexture.minFilter   = THREE.LinearFilter;

  // Orthographic scene — fullscreen quad
  bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  bgScene  = new THREE.Scene();
  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.MeshBasicMaterial({ map: bgTexture, depthTest: false, depthWrite: false });
  bgMesh    = new THREE.Mesh(geo, mat);
  bgScene.add(bgMesh);

  // Resize handler
  resizeHandler = () => {
    const nW = window.innerWidth, nH = window.innerHeight;
    offscreenCanvas.width  = nW;
    offscreenCanvas.height = nH;
    if (controller) controller.destroy();
    controller = new AnimationController(offscreenCanvas, offscreenCtx, nW, nH);
  };
  window.addEventListener('resize', resizeHandler);

  return { bgScene, bgCamera };
}

/**
 * Call every frame inside the render loop BEFORE composer.render().
 */
export function renderSpiralBackground(renderer) {
  if (!bgScene || !bgCamera || !bgTexture) return;
  bgTexture.needsUpdate = true;
  renderer.render(bgScene, bgCamera);
}

export function destroySpiralBackground() {
  if (controller)   { controller.destroy(); controller = null; }
  if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
  if (bgTexture)    { bgTexture.dispose();  bgTexture = null; }
  bgScene = null; bgCamera = null; bgMesh = null;
}

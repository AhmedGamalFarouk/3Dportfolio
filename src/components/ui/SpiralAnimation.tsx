import { useEffect, useRef, useState } from 'react';

// ─── Cyberpunk Star Colors ──────────────────────────────────────────────────
const STAR_COLORS = [
  '#00f3ff', // Electric Blue
  '#bd00ff', // Violet/Purple
  '#00ffd5', // Cyan
  '#ffffff', // Pure White
  '#ffd700', // Gold
];

class Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  prevX: number | null = null;
  prevY: number | null = null;

  constructor(w: number, h: number, maxZ: number) {
    this.x = (Math.random() - 0.5) * w * 2.5;
    this.y = (Math.random() - 0.5) * h * 2.5;
    this.z = Math.random() * maxZ;
    this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    this.size = 0.5 + Math.random() * 2.0;
  }

  reset(w: number, h: number, maxZ: number) {
    this.x = (Math.random() - 0.5) * w * 2.5;
    this.y = (Math.random() - 0.5) * h * 2.5;
    this.z = maxZ;
    this.prevX = null;
    this.prevY = null;
  }
}

class StarfieldController {
  private stars: Star[] = [];
  private maxZ = 1600;
  private speed = 4.5;
  private fov = 350;
  private animationFrameId: number | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private w: number,
    private h: number,
    numStars = 800
  ) {
    for (let i = 0; i < numStars; i++) {
      this.stars.push(new Star(w, h, this.maxZ));
    }
  }

  start() {
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private render() {
    const { ctx, w, h } = this;

    // Fade trail to make moving speed streaks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;

    this.stars.forEach((star) => {
      // Move star towards the camera
      star.z -= this.speed;

      // Reset star if it passes the camera
      if (star.z <= 0) {
        star.reset(w, h, this.maxZ);
      }

      // 3D projection calculations
      const scale = this.fov / (star.z + 1);
      const sx = centerX + star.x * scale;
      const sy = centerY + star.y * scale;

      // Check if the star is within the screen bounds
      if (sx < 0 || sx > w || sy < 0 || sy > h) {
        star.reset(w, h, this.maxZ);
        return;
      }

      // Draw star trail / dot
      ctx.strokeStyle = star.color;
      ctx.lineWidth = (1.0 - star.z / this.maxZ) * star.size * 1.5;
      ctx.lineCap = 'round';

      if (star.prevX !== null && star.prevY !== null) {
        ctx.beginPath();
        ctx.moveTo(star.prevX, star.prevY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, ctx.lineWidth / 2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Cache current screen positions for next frame's line trail
      star.prevX = sx;
      star.prevY = sy;
    });
  }
}

// ─── React Component ──────────────────────────────────────────────────────────

export function SpiralAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrlRef = useRef<StarfieldController | null>(null);
  const [dim, setDim] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dim.w * dpr;
    canvas.height = dim.h * dpr;
    canvas.style.width = `${dim.w}px`;
    canvas.style.height = `${dim.h}px`;
    ctx.scale(dpr, dpr);

    ctrlRef.current?.stop();
    // Using 900 stars for dense, immersive cyberpunk starfield journey
    ctrlRef.current = new StarfieldController(ctx, dim.w, dim.h, 900);
    ctrlRef.current.start();

    return () => {
      ctrlRef.current?.stop();
      ctrlRef.current = null;
    };
  }, [dim]);

  return (
    <canvas
      ref={canvasRef}
      className="spiral-canvas"
      aria-hidden="true"
    />
  );
}

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ─── Vector Helpers ───────────────────────────────────────────────────────────

class Vec2 {
  constructor(public x: number, public y: number) {}
  static rand(min: number, max: number) { return min + Math.random() * (max - min); }
}
class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}
}

// ─── Star ─────────────────────────────────────────────────────────────────────

class Star {
  angle: number; distance: number; rotDir: number;
  expRate: number; finalScale: number;
  dx: number; dy: number;
  spiralLoc: number; z: number; swf: number;

  constructor(camZ: number, camDist: number) {
    this.angle = Math.random() * Math.PI * 2;
    this.distance = 30 * Math.random() + 15;
    this.rotDir = Math.random() > 0.5 ? 1 : -1;
    this.expRate = 1.2 + Math.random() * 0.8;
    this.finalScale = 0.7 + Math.random() * 0.6;
    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);
    this.spiralLoc = (1 - Math.pow(1 - Math.random(), 3)) / 1.3;
    this.z = Vec2.rand(0.5 * camZ, camDist + camZ);
    const lerp = (a: number, b: number, t: number) => a * (1-t) + b*t;
    this.z = lerp(this.z, camDist / 2, 0.3 * this.spiralLoc);
    this.swf = Math.pow(Math.random(), 2);
  }

  render(p: number, ctrl: AnimCtrl) {
    const sp = ctrl.spiralPath(this.spiralLoc);
    const q = p - this.spiralLoc;
    if (q <= 0) return;
    const dp = ctrl.constrain(4*q, 0, 1);
    const le = dp, ee = ctrl.easeElastic(dp), pe = dp*dp;
    let sx: number, sy: number;
    if (dp < 0.3) {
      const e = ctrl.lerp(le, pe, dp/0.3);
      sx = ctrl.lerp(sp.x, sp.x + this.dx*0.3, e/0.3);
      sy = ctrl.lerp(sp.y, sp.y + this.dy*0.3, e/0.3);
    } else if (dp < 0.7) {
      const mid = (dp-0.3)/0.4;
      const cs = Math.sin(mid*Math.PI)*this.rotDir*1.5;
      const bx=sp.x+this.dx*0.3, by=sp.y+this.dy*0.3;
      const tx=sp.x+this.dx*0.7, ty=sp.y+this.dy*0.7;
      const px=-this.dy*0.4*cs, py=this.dx*0.4*cs;
      sx=ctrl.lerp(bx,tx,mid)+px*mid; sy=ctrl.lerp(by,ty,mid)+py*mid;
    } else {
      const fp=(dp-0.7)/0.3;
      const bx=sp.x+this.dx*0.7, by=sp.y+this.dy*0.7;
      const td=this.distance*this.expRate*1.5;
      const sa=this.angle+1.2*this.rotDir*fp*Math.PI;
      const tx=sp.x+td*Math.cos(sa), ty=sp.y+td*Math.sin(sa);
      sx=ctrl.lerp(bx,tx,fp); sy=ctrl.lerp(by,ty,fp);
    }
    const vx=(this.z-ctrl.camZ)*sx/ctrl.viewZoom;
    const vy=(this.z-ctrl.camZ)*sy/ctrl.viewZoom;
    const sm = dp<0.6 ? 1+dp*0.2 : 1.2*(1-(dp-0.6)/0.4)+this.finalScale*((dp-0.6)/0.4);
    ctrl.project(new Vec3(vx,vy,this.z), 8.5*this.swf*sm);
  }
}

// ─── Animation Controller ─────────────────────────────────────────────────────

class AnimCtrl {
  time = 0;
  stars: Star[] = [];
  readonly changeTime = 0.32;
  readonly camZ = -400;
  readonly camDist = 3400;
  readonly dotYOff = 28;
  readonly viewZoom = 100;
  private tl: gsap.core.Timeline;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private w: number,
    private h: number,
  ) {
    const orig = Math.random;
    let seed = 1234;
    Math.random = () => { seed=(seed*9301+49297)%233280; return seed/233280; };
    for (let i=0; i<5000; i++) this.stars.push(new Star(this.camZ, this.camDist));
    Math.random = orig;

    this.tl = gsap.timeline({ repeat: -1 });
    this.tl.to(this, { time: 1, duration: 15, repeat: -1, ease: 'none', onUpdate: () => this.render() });
  }

  ease(p: number, g: number) { return p<0.5 ? 0.5*Math.pow(2*p,g) : 1-0.5*Math.pow(2*(1-p),g); }
  easeElastic(x: number) {
    const c4 = (2*Math.PI)/4.5;
    if(x<=0)return 0; if(x>=1)return 1;
    return Math.pow(2,-8*x)*Math.sin((x*8-0.75)*c4)+1;
  }
  map(v: number, s1: number, e1: number, s2: number, e2: number) { return s2+(e2-s2)*((v-s1)/(e1-s1)); }
  constrain(v: number, lo: number, hi: number) { return Math.min(Math.max(v,lo),hi); }
  lerp(a: number, b: number, t: number) { return a*(1-t)+b*t; }

  spiralPath(p: number): Vec2 {
    p = this.constrain(1.2*p, 0, 1);
    p = this.ease(p, 1.8);
    const theta = 2*Math.PI*6*Math.sqrt(p);
    const r = 170*Math.sqrt(p);
    return new Vec2(r*Math.cos(theta), r*Math.sin(theta)+this.dotYOff);
  }

  rotate(v1: Vec2, v2: Vec2, p: number, flip: boolean): Vec2 {
    const mx=(v1.x+v2.x)/2, my=(v1.y+v2.y)/2;
    const dx=v1.x-mx, dy=v1.y-my;
    const a=Math.atan2(dy,dx), o=flip?-1:1;
    const r=Math.sqrt(dx*dx+dy*dy);
    const b=Math.sin(p*Math.PI)*0.05*(1-p);
    const ea=this.easeElastic(p);
    return new Vec2(mx+r*(1+b)*Math.cos(a+o*Math.PI*ea), my+r*(1+b)*Math.sin(a+o*Math.PI*ea));
  }

  project(pos: Vec3, sz: number) {
    const t2=this.constrain(this.map(this.time,this.changeTime,1,0,1),0,1);
    const cz=this.camZ+this.ease(Math.pow(t2,1.2),1.8)*this.camDist;
    if(pos.z<=cz)return;
    const d=pos.z-cz;
    const x=this.viewZoom*pos.x/d, y=this.viewZoom*pos.y/d;
    const sw=400*sz/d;
    this.ctx.beginPath();
    this.ctx.arc(x, y, Math.max(sw/2, 0.4), 0, Math.PI*2);
    this.ctx.fill();
  }

  render() {
    const {ctx,w,h} = this;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
    ctx.save(); ctx.translate(w/2,h/2);
    const t1=this.constrain(this.map(this.time,0,this.changeTime+0.25,0,1),0,1);
    const t2=this.constrain(this.map(this.time,this.changeTime,1,0,1),0,1);
    ctx.rotate(-Math.PI*this.ease(t2,2.7));
    // trail
    for(let i=0;i<80;i++){
      const f=this.map(i,0,80,1.1,0.1);
      const sw=(1.3*(1-t1)+3*Math.sin(Math.PI*t1))*f;
      ctx.fillStyle='white';
      const pos=this.spiralPath(t1-0.00015*i);
      const off=new Vec2(pos.x+5,pos.y+5);
      const r=this.rotate(pos,off,Math.sin(this.time*Math.PI*2)*0.5+0.5,i%2===0);
      ctx.beginPath(); ctx.arc(r.x,r.y,Math.max(sw/2,0.5),0,Math.PI*2); ctx.fill();
    }
    // stars
    ctx.fillStyle='white';
    for(const s of this.stars) s.render(t1,this);
    // origin dot
    if(this.time>this.changeTime){
      const dy=this.camZ*this.dotYOff/this.viewZoom;
      this.project(new Vec3(0,dy,this.camDist),2.5);
    }
    ctx.restore();
  }

  destroy() { this.tl.kill(); }
}

// ─── React Component ──────────────────────────────────────────────────────────

export function SpiralAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrlRef = useRef<AnimCtrl | null>(null);
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
    ctrlRef.current?.destroy();
    ctrlRef.current = new AnimCtrl(ctx, dim.w, dim.h);
    return () => { ctrlRef.current?.destroy(); ctrlRef.current = null; };
  }, [dim]);

  return (
    <canvas
      ref={canvasRef}
      className="spiral-canvas"
      aria-hidden="true"
    />
  );
}

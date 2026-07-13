// DIAGNOSTIC: Ultra-simple shader that always renders bright regardless of progress
// If this is visible, the issue is in the gating logic. If not, it's geometry/pipeline.

export const energyTrailVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const energyTrailFragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // Flow animation along U coordinate
    float flow = sin(vUv.x * 35.0 - uTime * 14.0) * 0.5 + 0.5;
    
    // Progress gate: energy only flows up to uProgress
    float gate = step(vUv.x, uProgress);
    
    // Bright wave front at progress head
    float head = smoothstep(uProgress - 0.08, uProgress, vUv.x) * (1.0 - step(uProgress, vUv.x));
    
    // Combine base glow, animated flow wave, and hot leading edge
    vec3 glowColor = mix(uColor * 0.4, uColor * 2.8, flow * 0.6 + head * 2.2);
    
    // Fade out tube edges
    float alpha = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
    
    gl_FragColor = vec4(glowColor, alpha * gate * 0.85);
  }
`;

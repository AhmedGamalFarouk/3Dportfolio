// GLSL Energy Trail Shader — animated glowing pulse along circuit traces
// Ported from the vanilla JS energySystem.js

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
    float pulse = sin(vUv.x * 20.0 - uTime * 6.0) * 0.5 + 0.5;
    float trail = smoothstep(0.0, uProgress, vUv.x);
    float alpha = pulse * trail * 0.85;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

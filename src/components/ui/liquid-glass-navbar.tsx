"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./liquid-glass-navbar.css";

export type LiquidNavFx = "spin" | "pop" | "drop" | "plane" | "none";

export interface LiquidNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  fx?: LiquidNavFx;
}

export interface LiquidNavbarProps {
  items: LiquidNavItem[];
  active?: number;
  defaultActive?: number;
  onChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  tone?: "dark" | "light";
  compact?: boolean;
  sound?: boolean;
  className?: string;
  ariaLabel?: string;
}

interface ItemTarget {
  pos: number;
  cx: number;
  cy: number;
  q: number;
  r: number;
}

interface Satellite {
  pos: number;
  cross: number;
  vPos: number;
  vCross: number;
  r: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  strength: number;
}

interface PhysicsState {
  ready: boolean;
  w: number;
  h: number;
  a: { pos: number; vel: number };
  b: { pos: number; vel: number };
  targets: ItemTarget[];
  targetIdx: number;
  sats: Satellite[];
  ripples: Ripple[];
  hover: boolean;
  vert: boolean;
  dark: boolean;
}

const PAD = 24;

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uSize;
uniform float uDpr;
uniform float uTime;
uniform float uDark;
uniform float uVert;
uniform vec4 uPill;
uniform vec4 uBlob[2];
uniform vec2 uSquash;
uniform vec4 uSats[6];
uniform vec4 uRipples[4];

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float pillD(vec2 p) {
  float r = min(uPill.z, uPill.w);
  vec2 q = abs(p - uPill.xy) - (uPill.zw - vec2(r));
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sdCap(vec2 p, vec4 B, float sy) {
  vec2 d = p - B.xy;
  if (uVert < 0.5) {
    d.y /= sy;
    d.x = max(abs(d.x) - B.z, 0.0);
  } else {
    d.x /= sy;
    d.y = max(abs(d.y) - B.z, 0.0);
  }
  return length(d) - B.w;
}

float waves(vec2 p) {
  float axis = uVert >= 0.5 ? p.y : p.x;
  float w = 0.025 * sin(axis * 0.14 - uTime * 3.1) * cos(uTime * 1.4);
  for (int i = 0; i < 4; i++) {
    vec4 rp = uRipples[i];
    if (rp.w > 0.001) {
      float d = length(p - rp.xy);
      float front = rp.z * 115.0;
      float ring = exp(-abs(d - front) * 0.11) * sin((d - front) * 0.42);
      float env = max(0.0, 1.0 - rp.z / 1.25);
      w += ring * env * rp.w * 0.55;
    }
  }
  return w;
}

float fieldD(vec2 p) {
  float dA = sdCap(p, uBlob[0], uSquash.x);
  float dB = sdCap(p, uBlob[1], uSquash.y);
  float d = smin(dA, dB, 13.0);
  for (int i = 0; i < 6; i++) {
    vec4 sat = uSats[i];
    if (sat.z > 0.2 && sat.w > 0.01) {
      float ds = length(p - sat.xy) - sat.z * sat.w;
      d = smin(d, ds, 6.5);
    }
  }
  return d + waves(p);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / uDpr, uSize.y - gl_FragCoord.y / uDpr);

  float dp = pillD(p);
  float pillMask = 1.0 - smoothstep(-1.0, 1.2, dp);
  if (pillMask <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float d = fieldD(p);
  vec2 shOffset = uVert >= 0.5 ? vec2(1.2, 2.2) : vec2(0.4, 2.4);
  float dSh = fieldD(p - shOffset);
  float sh = smoothstep(5.5, -2.5, dSh) * (1.0 - smoothstep(-2.0, 0.5, d)) * 0.24;

  float body = 1.0 - smoothstep(-1.2, 1.2, d);
  if (body <= 0.001 && sh <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float eps = 1.2;
  float gx = fieldD(p + vec2(eps, 0.0)) - fieldD(p - vec2(eps, 0.0));
  float gy = fieldD(p + vec2(0.0, eps)) - fieldD(p - vec2(0.0, eps));
  float slope = 1.0 - smoothstep(-14.0, -0.2, d);
  vec3 N = normalize(vec3(gx * 0.55, gy * 0.55, 1.6 + slope * 1.4));

  vec3 L1 = normalize(vec3(-0.52, -0.68, 0.52));
  vec3 L2 = normalize(vec3(0.55, 0.62, 0.45));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H1 = normalize(L1 + V);

  float diff = clamp(dot(N, L1), 0.0, 1.0);
  float spec = pow(clamp(dot(N, H1), 0.0, 1.0), 42.0);
  float caustic = pow(clamp(dot(N, L2), 0.0, 1.0), 10.0) * 0.36;
  float rim = smoothstep(-2.8, 0.1, d) * (1.0 - smoothstep(-0.2, 1.2, d));
  float fresnel = pow(1.0 - clamp(N.z, 0.0, 1.0), 2.1);

  vec3 tint = uDark > 0.5 ? vec3(0.84, 0.88, 0.94) : vec3(0.95, 0.97, 1.0);
  vec3 lc = uDark > 0.5 ? vec3(0.32, 0.38, 0.52) : vec3(0.52, 0.60, 0.72);
  vec3 irid = mix(vec3(0.96, 0.95, 0.92), vec3(0.76, 0.85, 0.96), 0.5 + 0.5 * sin(N.x * 3.1 + N.y * 2.4 + uTime));

  vec3 glassCol = mix(lc, tint, 0.38 + 0.44 * diff);
  glassCol += tint * caustic * 0.75;
  glassCol += irid * (fresnel * 0.35 + rim * 0.42);
  glassCol += vec3(1.0) * (spec * 0.82 + rim * 0.36);

  float glassAlpha = body * (uDark > 0.5 ? 0.30 + 0.26 * rim + 0.20 * spec : 0.36 + 0.25 * rim + 0.22 * spec);
  glassAlpha = clamp(glassAlpha, 0.0, 0.88);

  float totalAlpha = clamp(glassAlpha + sh * (1.0 - body), 0.0, 1.0) * pillMask;
  vec3 premul = glassCol * (glassAlpha * pillMask);
  gl_FragColor = vec4(premul, totalAlpha);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface GLBundle {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  loc: {
    aPos: number;
    uSize: WebGLUniformLocation | null;
    uDpr: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uDark: WebGLUniformLocation | null;
    uVert: WebGLUniformLocation | null;
    uPill: WebGLUniformLocation | null;
    uBlob: WebGLUniformLocation | null;
    uSquash: WebGLUniformLocation | null;
    uSats: WebGLUniformLocation | null;
    uRipples: WebGLUniformLocation | null;
  };
}

function createLiquidGL(canvas: HTMLCanvasElement): GLBundle | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  return {
    gl,
    program,
    buffer,
    loc: {
      aPos: gl.getAttribLocation(program, "aPos"),
      uSize: gl.getUniformLocation(program, "uSize"),
      uDpr: gl.getUniformLocation(program, "uDpr"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uDark: gl.getUniformLocation(program, "uDark"),
      uVert: gl.getUniformLocation(program, "uVert"),
      uPill: gl.getUniformLocation(program, "uPill"),
      uBlob: gl.getUniformLocation(program, "uBlob"),
      uSquash: gl.getUniformLocation(program, "uSquash"),
      uSats: gl.getUniformLocation(program, "uSats"),
      uRipples: gl.getUniformLocation(program, "uRipples"),
    },
  };
}

export function LiquidNavbar({
  items,
  active,
  defaultActive = 0,
  onChange,
  orientation = "horizontal",
  tone = "dark",
  compact = false,
  sound = false,
  className = "",
  ariaLabel = "Navegación principal",
}: LiquidNavbarProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isControlled = active !== undefined;
  const [innerActive, setInnerActive] = useState(defaultActive);
  const currentActive = Math.max(
    0,
    Math.min(items.length - 1, isControlled ? active! : innerActive)
  );

  const [useFallback, setUseFallback] = useState(false);
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);
  const [fallbackBox, setFallbackBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>({ x: 0, y: 0, w: 42, h: 42 });

  const stateRef = useRef<PhysicsState>({
    ready: false,
    w: 0,
    h: 0,
    a: { pos: 0, vel: 0 },
    b: { pos: 0, vel: 0 },
    targets: [],
    targetIdx: currentActive,
    sats: [],
    ripples: [],
    hover: false,
    vert: orientation === "vertical",
    dark: tone === "dark",
  });

  stateRef.current.vert = orientation === "vertical";
  stateRef.current.dark = tone === "dark";

  const wakeRef = useRef<() => void>(() => {});
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current.dark = tone === "dark";
    wakeRef.current();
  }, [tone]);

  const triggerPulse = useCallback((idx: number) => {
    setPulseIdx(idx);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => {
      setPulseIdx(null);
    }, 600);
  }, []);

  const spawnClickFX = useCallback((prevIdx: number, nextIdx: number) => {
    const s = stateRef.current;
    const T = s.targets[nextIdx];
    const P = s.targets[prevIdx];
    if (!T) return;

    s.ripples.push({ x: T.cx, y: T.cy, age: 0, strength: 1.0 });
    if (s.ripples.length > 4) s.ripples.shift();

    if (P && Math.abs(T.pos - P.pos) > 16) {
      const dir = T.pos >= P.pos ? 1 : -1;
      const lo = Math.min(P.pos, T.pos);
      const hi = Math.max(P.pos, T.pos);
      const count = 3;
      for (let i = 0; i < count; i++) {
        const frac = (i + 1) / (count + 1);
        s.sats.push({
          pos: lo + (hi - lo) * frac,
          cross: (i % 2 === 0 ? 1 : -1) * (3 + i * 1.6),
          vPos: dir * (40 + i * 24),
          vCross: (i % 2 === 0 ? 1 : -1) * (14 + i * 6),
          r: 5.5 + i * 1.4,
          life: 0,
          maxLife: 0.42 + i * 0.08,
        });
      }
      if (s.sats.length > 6) {
        s.sats.splice(0, s.sats.length - 6);
      }
    }
  }, []);

  const measureFallback = useCallback(
    (idx: number) => {
      const btn = itemRefs.current[idx];
      if (!btn) return;
      setFallbackBox({
        x: btn.offsetLeft,
        y: btn.offsetTop,
        w: btn.offsetWidth,
        h: btn.offsetHeight,
      });
    },
    []
  );

  // Sincronización ante cambios externos (p.ej. Scroll-Spy)
  const prevActiveRef = useRef(currentActive);
  useEffect(() => {
    const s = stateRef.current;
    const prevIdx = prevActiveRef.current;
    s.targetIdx = currentActive;

    if (prevIdx !== currentActive) {
      prevActiveRef.current = currentActive;
      spawnClickFX(prevIdx, currentActive);
      triggerPulse(currentActive);
    }
    measureFallback(currentActive);
    wakeRef.current();
  }, [currentActive, measureFallback, spawnClickFX, triggerPulse]);

  useEffect(() => {
    const nav = navRef.current;
    const canvas = canvasRef.current;
    if (!nav) return;

    const s = stateRef.current;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let glb: GLBundle | null =
      !useFallback && canvas ? createLiquidGL(canvas) : null;
    if (canvas && !glb && !useFallback) {
      setUseFallback(true);
    }

    const blobArr = new Float32Array(8);
    const satArr = new Float32Array(24);
    const rippleArr = new Float32Array(16);
    let dpr = 1;

    const measure = () => {
      const nw = nav.offsetWidth;
      const nh = nav.offsetHeight;
      if (nw < 2 || nh < 2) {
        s.ready = false;
        return;
      }

      const vert = s.vert;
      const nextTargets: ItemTarget[] = [];
      for (let i = 0; i < items.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const r = Math.min(el.offsetWidth, el.offsetHeight) / 2;
        if (vert) {
          const pos = PAD + el.offsetTop + el.offsetHeight / 2;
          const cx = PAD + el.offsetLeft + el.offsetWidth / 2;
          const q = Math.max(0, el.offsetHeight / 2 - r);
          nextTargets.push({ pos, cx, cy: pos, q, r });
        } else {
          const pos = PAD + el.offsetLeft + el.offsetWidth / 2;
          const cy = PAD + el.offsetTop + el.offsetHeight / 2;
          const q = Math.max(0, el.offsetWidth / 2 - r);
          nextTargets.push({ pos, cx: pos, cy, q, r });
        }
      }

      s.targets = nextTargets;
      s.w = nw;
      s.h = nh;

      if (canvas && glb) {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = Math.round((nw + PAD * 2) * dpr);
        const ch = Math.round((nh + PAD * 2) * dpr);
        if (canvas.width !== cw) canvas.width = cw;
        if (canvas.height !== ch) canvas.height = ch;
      }

      const target = s.targets[s.targetIdx] ?? s.targets[0];
      if (!s.ready && target) {
        s.a.pos = target.pos;
        s.b.pos = target.pos;
        s.a.vel = 0;
        s.b.vel = 0;
      }
      s.ready = Boolean(target);
      measureFallback(s.targetIdx);
    };

    const draw = (nowSec: number) => {
      if (!glb || !canvas || !s.ready) return;
      const T = s.targets[s.targetIdx] ?? s.targets[0];
      if (!T) return;

      const { gl, program, buffer, loc } = glb;
      const canvasW = s.w + PAD * 2;
      const canvasH = s.h + PAD * 2;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(loc.aPos);
      gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const distAB = Math.abs(s.a.pos - s.b.pos);
      const speedNorm = Math.min(1, Math.abs(s.a.vel) / 480);
      const stretchNorm = Math.min(1, distAB / 42);
      const headSy = Math.max(0.76, 1.0 - speedNorm * 0.12 - stretchNorm * 0.14);
      const tailSy = Math.max(0.74, 1.0 - stretchNorm * 0.18);
      const tailScaleR = Math.max(0.72, 1.0 - stretchNorm * 0.18);
      const headQ = T.q + Math.min(7, distAB * 0.14);

      if (s.vert) {
        blobArr[0] = T.cx;
        blobArr[1] = s.a.pos;
        blobArr[2] = headQ;
        blobArr[3] = T.r;
        blobArr[4] = T.cx;
        blobArr[5] = s.b.pos;
        blobArr[6] = T.q * 0.7;
        blobArr[7] = T.r * tailScaleR;
      } else {
        blobArr[0] = s.a.pos;
        blobArr[1] = T.cy;
        blobArr[2] = headQ;
        blobArr[3] = T.r;
        blobArr[4] = s.b.pos;
        blobArr[5] = T.cy;
        blobArr[6] = T.q * 0.7;
        blobArr[7] = T.r * tailScaleR;
      }

      satArr.fill(0);
      for (let i = 0; i < Math.min(6, s.sats.length); i++) {
        const sat = s.sats[i];
        const alpha = Math.sin(Math.min(1, sat.life / sat.maxLife) * Math.PI);
        if (s.vert) {
          satArr[i * 4] = T.cx + sat.cross;
          satArr[i * 4 + 1] = sat.pos;
        } else {
          satArr[i * 4] = sat.pos;
          satArr[i * 4 + 1] = T.cy + sat.cross;
        }
        satArr[i * 4 + 2] = sat.r;
        satArr[i * 4 + 3] = alpha;
      }

      rippleArr.fill(0);
      for (let i = 0; i < Math.min(4, s.ripples.length); i++) {
        const rp = s.ripples[i];
        rippleArr[i * 4] = rp.x;
        rippleArr[i * 4 + 1] = rp.y;
        rippleArr[i * 4 + 2] = rp.age;
        rippleArr[i * 4 + 3] = rp.strength;
      }

      gl.uniform2f(loc.uSize, canvasW, canvasH);
      gl.uniform1f(loc.uDpr, dpr);
      gl.uniform1f(loc.uTime, nowSec);
      gl.uniform1f(loc.uDark, s.dark ? 1.0 : 0.0);
      gl.uniform1f(loc.uVert, s.vert ? 1.0 : 0.0);
      gl.uniform4f(
        loc.uPill,
        PAD + s.w / 2,
        PAD + s.h / 2,
        Math.max(1, s.w / 2 - 4),
        Math.max(1, s.h / 2 - 4)
      );
      gl.uniform4fv(loc.uBlob, blobArr);
      gl.uniform2f(loc.uSquash, headSy, tailSy);
      gl.uniform4fv(loc.uSats, satArr);
      gl.uniform4fv(loc.uRipples, rippleArr);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const step = (dt: number) => {
      const T = s.targets[s.targetIdx] ?? s.targets[0];
      if (!T) return false;

      if (reducedMotion) {
        s.a.pos = T.pos;
        s.b.pos = T.pos;
        s.a.vel = 0;
        s.b.vel = 0;
        s.sats.length = 0;
        s.ripples.length = 0;
        return false;
      }

      const axisLen = s.vert ? s.h : s.w;
      const lo = PAD + 6 + T.r + T.q;
      const hi = Math.max(lo, PAD + axisLen - 6 - T.r - T.q);

      const accA = 240 * (T.pos - s.a.pos) - 19 * s.a.vel;
      s.a.vel += accA * dt;
      s.a.pos += s.a.vel * dt;
      if (s.a.pos < lo) {
        s.a.pos = lo;
        s.a.vel = Math.abs(s.a.vel) * 0.35;
      } else if (s.a.pos > hi) {
        s.a.pos = hi;
        s.a.vel = -Math.abs(s.a.vel) * 0.35;
      }

      const accB = 135 * (s.a.pos - s.b.pos) - 17 * s.b.vel;
      s.b.vel += accB * dt;
      s.b.pos += s.b.vel * dt;
      if (s.b.pos < lo) {
        s.b.pos = lo;
        s.b.vel = Math.abs(s.b.vel) * 0.3;
      } else if (s.b.pos > hi) {
        s.b.pos = hi;
        s.b.vel = -Math.abs(s.b.vel) * 0.3;
      }

      for (let i = s.sats.length - 1; i >= 0; i--) {
        const sat = s.sats[i];
        sat.life += dt;
        sat.pos = Math.max(lo, Math.min(hi, sat.pos + sat.vPos * dt));
        sat.cross += sat.vCross * dt;
        sat.vPos *= 0.92;
        sat.vCross *= 0.88;
        if (sat.life >= sat.maxLife) s.sats.splice(i, 1);
      }

      for (let i = s.ripples.length - 1; i >= 0; i--) {
        s.ripples[i].age += dt;
        if (s.ripples[i].age >= 1.25) s.ripples.splice(i, 1);
      }

      const moving =
        Math.abs(T.pos - s.a.pos) > 0.15 ||
        Math.abs(s.a.vel) > 0.25 ||
        Math.abs(s.a.pos - s.b.pos) > 0.2 ||
        Math.abs(s.b.vel) > 0.25 ||
        s.sats.length > 0 ||
        s.ripples.length > 0 ||
        s.hover;

      return moving;
    };

    let rafId = 0;
    let lastTs = 0;
    let inView = true;

    const frame = (ts: number) => {
      rafId = 0;
      if (document.hidden || !inView || !s.ready) return;

      const dt = lastTs
        ? Math.min(0.032, Math.max(0.004, (ts - lastTs) / 1000))
        : 0.016;
      lastTs = ts;

      const keepAlive = step(dt);
      draw(ts / 1000);

      if (keepAlive && inView) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        lastTs = 0;
      }
    };

    const wake = () => {
      if (document.hidden || !inView) return;
      if (!s.ready) measure();
      if (!s.ready || !glb) return;
      draw(performance.now() / 1000);
      if (!rafId) {
        lastTs = 0;
        rafId = window.requestAnimationFrame(frame);
      }
    };

    wakeRef.current = wake;
    measure();
    if (s.ready) {
      draw(performance.now() / 1000);
      wake();
    }

    const io = new IntersectionObserver((entries) => {
      inView = entries[0] ? entries[0].isIntersecting : true;
      if (inView) {
        measure();
        wake();
      } else if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });
    io.observe(nav);

    const ro = new ResizeObserver(() => {
      measure();
      if (s.ready && inView) {
        draw(performance.now() / 1000);
        wake();
      }
    });
    ro.observe(nav);

    const onVis = () => {
      if (!document.hidden && inView) {
        measure();
        wake();
      } else if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      setUseFallback(true);
    };
    canvas?.addEventListener("webglcontextlost", onContextLost);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas?.removeEventListener("webglcontextlost", onContextLost);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      if (glb) {
        glb.gl.deleteBuffer(glb.buffer);
        glb.gl.deleteProgram(glb.program);
        glb = null;
      }
    };
  }, [items.length, measureFallback, orientation, useFallback]);

  const selectIndex = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, nextIdx));
      const prevIdx = prevActiveRef.current;

      if (!isControlled) setInnerActive(clamped);
      stateRef.current.targetIdx = clamped;
      prevActiveRef.current = clamped;

      spawnClickFX(prevIdx, clamped);
      triggerPulse(clamped);
      measureFallback(clamped);
      wakeRef.current();

      if (sound && typeof window !== "undefined") {
        // Gancho reservado; desactivado por defecto según sound={false}.
      }
      onChange?.(clamped);
    },
    [
      isControlled,
      items.length,
      measureFallback,
      onChange,
      sound,
      spawnClickFX,
      triggerPulse,
    ]
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

    let target: number | null = null;
    if (e.key === prevKey) {
      target = (idx - 1 + items.length) % items.length;
    } else if (e.key === nextKey) {
      target = (idx + 1) % items.length;
    } else if (e.key === "Home") {
      target = 0;
    } else if (e.key === "End") {
      target = items.length - 1;
    }

    if (target !== null) {
      e.preventDefault();
      itemRefs.current[target]?.focus();
      selectIndex(target);
    }
  };

  const fallbackDropStyle = useMemo<React.CSSProperties>(() => {
    if (orientation === "vertical") {
      return {
        height: fallbackBox.h,
        transform: `translate3d(0, ${fallbackBox.y}px, 0)`,
      };
    }
    return {
      width: fallbackBox.w,
      transform: `translate3d(${fallbackBox.x}px, 0, 0)`,
    };
  }, [fallbackBox.h, fallbackBox.w, fallbackBox.x, fallbackBox.y, orientation]);

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      data-orientation={orientation}
      data-tone={tone}
      data-compact={compact ? "true" : "false"}
      className={`nimbus-nav ${className}`.trim()}
      onPointerEnter={() => {
        stateRef.current.hover = true;
        wakeRef.current();
      }}
      onPointerLeave={() => {
        stateRef.current.hover = false;
      }}
    >
      <div className="nimbus-glass" aria-hidden="true" />

      {useFallback ? (
        <div
          className="nimbus-drop"
          aria-hidden="true"
          style={fallbackDropStyle}
        />
      ) : (
        <canvas ref={canvasRef} className="nimbus-canvas" aria-hidden="true" />
      )}

      {items.map((item, idx) => {
        const isActive = idx === currentActive;
        const isPulsing = pulseIdx === idx;
        return (
          <button
            key={item.id}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            type="button"
            data-fx={item.fx ?? "pop"}
            data-active={isActive ? "true" : "false"}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => selectIndex(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`nimbus-item${isPulsing ? " is-pulsing" : ""}`}
          >
            <span className="nimbus-icon" aria-hidden="true">
              {item.icon}
            </span>
            {!compact && <span className="nimbus-label">{item.label}</span>}
            {orientation === "vertical" && compact && (
              <span className="nimbus-tooltip" aria-hidden="true">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default LiquidNavbar;

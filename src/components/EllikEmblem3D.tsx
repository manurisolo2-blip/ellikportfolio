"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface EllikEmblem3DProps {
  className?: string;
  boost?: boolean;
  scrollProgress?: number;
  scrollProgressRef?: React.RefObject<number>;
}

const CORE_VERTEX_SHADER = `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocalPos;

void main() {
  vLocalPos = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const CORE_FRAGMENT_SHADER = `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocalPos;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vViewDir);
  float core = pow(max(dot(n, v), 0.0), 1.8);

  float plasma = sin(vLocalPos.x * 11.0 + uTime * 1.4)
               * cos(vLocalPos.y * 11.0 - uTime * 1.1)
               * sin(vLocalPos.z * 11.0 + uTime * 0.9);
  float pulse = 0.92 + 0.08 * plasma;

  vec3 warmCenter = vec3(1.0, 0.992, 0.969);   // #FFFDF7
  vec3 coolSilver = vec3(0.647, 0.706, 0.988); // #A5B4FC
  vec3 starlight  = vec3(0.957, 0.945, 0.918); // #F4F1EA

  vec3 rimTone = mix(coolSilver, starlight, 0.45 + 0.25 * sin(uTime * 0.8));
  vec3 color = mix(rimTone, warmCenter, smoothstep(0.08, 0.88, core)) * pulse;
  float alpha = pow(core, 1.4);

  gl_FragColor = vec4(color, alpha);
}
`;

function createCoronaHaloTexture(): THREE.CanvasTexture | null {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(255, 252, 245, 0.55)");
  grad.addColorStop(0.24, "rgba(244, 241, 234, 0.28)");
  grad.addColorStop(0.56, "rgba(148, 163, 184, 0.12)");
  grad.addColorStop(0.82, "rgba(148, 163, 184, 0.03)");
  grad.addColorStop(1, "rgba(148, 163, 184, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createDiffractionSpikeTexture(): THREE.CanvasTexture | null {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;

  const drawRay = (angleRad: number) => {
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(angleRad);
    ctx.scale(1, 0.032);
    const rayGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
    rayGrad.addColorStop(0, "rgba(255, 253, 247, 0.92)");
    rayGrad.addColorStop(0.28, "rgba(244, 241, 234, 0.36)");
    rayGrad.addColorStop(0.65, "rgba(165, 180, 252, 0.07)");
    rayGrad.addColorStop(1, "rgba(148, 163, 184, 0)");
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawRay(0);
  drawRay(Math.PI / 2);

  const centerGrad = ctx.createRadialGradient(half, half, 0, half, half, half * 0.24);
  centerGrad.addColorStop(0, "rgba(255, 253, 247, 0.7)");
  centerGrad.addColorStop(0.5, "rgba(244, 241, 234, 0.16)");
  centerGrad.addColorStop(1, "rgba(244, 241, 234, 0)");
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Construye una escena procedural de estudio con softboxes amplios en blanco cálido,
 * plata, celeste hielo y rebote perla para generar reflejos metálicos continuos.
 */
function buildDarkStudioEnvironment(
  pmremGenerator: THREE.PMREMGenerator
): THREE.WebGLRenderTarget {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#08090C");

  const tempDisposables: Array<{ dispose: () => void }> = [];

  const addLightPanel = (
    w: number,
    h: number,
    hex: string,
    intensity: number,
    pos: [number, number, number]
  ) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const col = new THREE.Color(hex).multiplyScalar(intensity);
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
    tempDisposables.push(geo, mat);
  };

  // Softbox superior amplio en blanco cálido
  addLightPanel(14, 6, "#FFF9F0", 2.6, [0.0, 6.2, 2.8]);

  // Dos tiras laterales anchas (plata izquierda + celeste hielo muy tenue derecha)
  addLightPanel(4, 12, "#E2E8F0", 2.0, [-6.4, 0.4, 1.8]);
  addLightPanel(4, 12, "#BAE6FD", 1.8, [6.4, 0.2, 1.6]);

  // Panel inferior de rebote suave en gris perla para despegar la base de los anillos
  addLightPanel(14, 8, "#71717A", 1.35, [0.0, -6.2, 0.5]);

  // Cinta frontal superior para acentuar el perfil biselado de la banda y el cubo
  addLightPanel(10, 2.4, "#FFFDF7", 2.0, [2.4, 3.4, 5.8]);

  const rt = pmremGenerator.fromScene(envScene, 0.035);
  for (const d of tempDisposables) {
    d.dispose();
  }
  return rt;
}

export function EllikEmblem3D({
  className = "",
  boost = false,
  scrollProgress = 0,
  scrollProgressRef,
}: EllikEmblem3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boostRef = useRef<boolean>(boost);
  const scrollPropRef = useRef<number>(scrollProgress);
  const externalScrollRef = useRef<React.RefObject<number> | undefined>(
    scrollProgressRef
  );

  useEffect(() => {
    boostRef.current = boost;
  }, [boost]);

  useEffect(() => {
    scrollPropRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    externalScrollRef.current = scrollProgressRef;
  }, [scrollProgressRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const initialW = Math.max(container.clientWidth, 260);
    const initialH = Math.max(container.clientHeight, 260);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(initialW, initialH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.className = "block h-full w-full pointer-events-none";
    renderer.domElement.style.background = "transparent";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      initialW / initialH,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.4);

    // Entorno de estudio con softboxes amplios y alto contraste
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRT = buildDarkStudioEnvironment(pmremGenerator);
    scene.environment = envRT.texture;

    // Iluminación de estudio + luz interna cálida para los aros
    const hemiLight = new THREE.HemisphereLight("#F8FAFC", "#1E293B", 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight("#FFFDF7", 2.6);
    keyLight.position.set(5.0, 6.0, 5.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#93C5FD", 2.0);
    rimLight.position.set(-5.0, -3.5, -4.5);
    scene.add(rimLight);

    const centerLight = new THREE.PointLight("#FFF6E5", 5.5, 7);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    // Grupo maestro del emblema ELLIK
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Núcleo Estelar Volumétrico (Shader GLSL Fresnel + Corona + Difracción)
    const coreGeo = new THREE.SphereGeometry(0.32, 48, 48);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: CORE_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    emblemGroup.add(coreMesh);
    disposables.push(coreGeo, coreMat);

    const coronaTex = createCoronaHaloTexture();
    let coronaMat: THREE.SpriteMaterial | null = null;
    if (coronaTex) {
      coronaMat = new THREE.SpriteMaterial({
        map: coronaTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.78,
      });
      const coronaSprite = new THREE.Sprite(coronaMat);
      coronaSprite.scale.set(1.9, 1.9, 1);
      emblemGroup.add(coronaSprite);
      disposables.push(coronaTex, coronaMat);
    }

    const diffractionTex = createDiffractionSpikeTexture();
    let diffractionMat: THREE.SpriteMaterial | null = null;
    if (diffractionTex) {
      diffractionMat = new THREE.SpriteMaterial({
        map: diffractionTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.45,
      });
      const diffractionSprite = new THREE.Sprite(diffractionMat);
      diffractionSprite.scale.set(1.35, 1.35, 1);
      emblemGroup.add(diffractionSprite);
      disposables.push(diffractionTex, diffractionMat);
    }

    // 2. Anillo 1 — Aro Principal tipo Banda Arquitectónica (Titanio Plateado Satinado)
    const ring1Group = new THREE.Group();
    ring1Group.position.set(0.03, 0.02, 0);
    ring1Group.rotation.set(0.48, 0.26, -0.18);
    emblemGroup.add(ring1Group);

    const ring1Geo = new THREE.TorusGeometry(1.48, 0.062, 64, 220);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: "#D6D3CE",
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      iridescence: 0.35,
      iridescenceIOR: 1.35,
      envMapIntensity: 1.75,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.scale.set(1, 1, 0.48);
    ring1Group.add(ring1Mesh);
    disposables.push(ring1Geo, ring1Mat);

    // 3. Anillo 2 — Órbita Exterior Fina + Esfera Satélite en Cromo Espejo con Micro-Anillo
    const ring2Group = new THREE.Group();
    ring2Group.rotation.set(0.88, -0.44, 0.32);
    emblemGroup.add(ring2Group);

    const ring2Geo = new THREE.TorusGeometry(1.74, 0.024, 48, 200);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
      color: "#F4F1EA",
      metalness: 0.96,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.0,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Group.add(ring2Mesh);
    disposables.push(ring2Geo, ring2Mat);

    const satelliteGroup = new THREE.Group();
    satelliteGroup.position.set(1.74, 0, 0);
    ring2Group.add(satelliteGroup);

    const satelliteGeo = new THREE.SphereGeometry(0.115, 48, 48);
    const satelliteMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      metalness: 1.0,
      roughness: 0.04,
      iridescence: 0.6,
      iridescenceIOR: 1.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
    });
    const satelliteMesh = new THREE.Mesh(satelliteGeo, satelliteMat);
    satelliteGroup.add(satelliteMesh);

    const satelliteRingGeo = new THREE.TorusGeometry(0.165, 0.008, 16, 64);
    const satelliteRingMesh = new THREE.Mesh(satelliteRingGeo, satelliteMat);
    satelliteRingMesh.rotation.set(0.72, 0.28, 0);
    satelliteGroup.add(satelliteRingMesh);
    disposables.push(satelliteGeo, satelliteRingGeo, satelliteMat);

    // 4. Anillo 3 — Órbita Interior Excéntrica en Cristal Iridiscente + Cubo Gema Biselado
    const ring3Group = new THREE.Group();
    ring3Group.position.set(-0.1, -0.07, 0);
    ring3Group.rotation.set(-0.56, -0.52, -0.28);
    emblemGroup.add(ring3Group);

    const ring3Geo = new THREE.TorusGeometry(0.96, 0.044, 48, 160);
    const ring3Mat = new THREE.MeshPhysicalMaterial({
      color: "#E4E4E7",
      metalness: 0.15,
      roughness: 0.05,
      transmission: 0.82,
      ior: 1.5,
      thickness: 0.45,
      iridescence: 0.9,
      iridescenceIOR: 1.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.2,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Group.add(ring3Mesh);
    disposables.push(ring3Geo, ring3Mat);

    const cubeGroup = new THREE.Group();
    cubeGroup.position.set(0, 0.96, 0);
    ring3Group.add(cubeGroup);

    const cubeGeo = new RoundedBoxGeometry(0.24, 0.24, 0.24, 5, 0.04);
    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: "#F4F1EA",
      metalness: 0.95,
      roughness: 0.09,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.2,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeGroup.add(cubeMesh);

    const baseCubeForEdges = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const cubeWireEdgesGeo = new THREE.EdgesGeometry(baseCubeForEdges);
    baseCubeForEdges.dispose();
    const cubeWireMat = new THREE.LineBasicMaterial({
      color: "#FFFFFF",
      transparent: true,
      opacity: 0.28,
    });
    const cubeWireframe = new THREE.LineSegments(cubeWireEdgesGeo, cubeWireMat);
    cubeWireframe.scale.setScalar(1.18);
    cubeGroup.add(cubeWireframe);
    disposables.push(cubeGeo, cubeMat, cubeWireEdgesGeo, cubeWireMat);

    // 5. Polvo Orbital Microscópico (70 partículas sutiles en anillo inclinado)
    const dustCount = 70;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const angle = (i / dustCount) * Math.PI * 2 + (i % 7) * 0.19;
      const radius = 1.12 + (((i * 37) % 100) / 100) * 0.9;
      const yJitter = (((i * 53) % 100) / 100 - 0.5) * 0.26;
      dustPositions[i * 3] = Math.cos(angle) * radius;
      dustPositions[i * 3 + 1] = yJitter;
      dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3)
    );
    const dustMat = new THREE.PointsMaterial({
      color: "#F4F1EA",
      size: 0.018,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustPoints.rotation.set(0.42, 0.18, -0.22);
    emblemGroup.add(dustPoints);
    disposables.push(dustGeo, dustMat);

    // Respuesta al tamaño del contenedor
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 1);
      const h = Math.max(Math.round(entry.contentRect.height), 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    // Seguimiento suave del puntero en desktop
    const finePointerMq = window.matchMedia("(pointer: fine)");
    let targetMouseTiltX = 0;
    let targetMouseTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!finePointerMq.matches) return;
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      const nx = e.clientX / vw - 0.5;
      const ny = e.clientY / vh - 0.5;
      targetMouseTiltX = ny * 0.38;
      targetMouseTiltY = nx * 0.48;
    };

    const handleMouseReset = () => {
      targetMouseTiltX = 0;
      targetMouseTiltY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", handleMouseReset);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let speedMult = 1;
    let rafId = 0;
    let isIntersecting = true;

    const animate = () => {
      rafId = 0;
      if (document.hidden || !isIntersecting) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      const extRef = externalScrollRef.current;
      const scrollP =
        extRef && extRef.current !== null && extRef.current !== undefined
          ? extRef.current
          : scrollPropRef.current;
      const clampedScroll = Math.max(0, Math.min(1, scrollP));

      const targetSpeed =
        1 + (boostRef.current ? 1.85 : 0) + clampedScroll * 2.2;
      speedMult += (targetSpeed - speedMult) * (1 - Math.exp(-6 * dt));

      // Coreografía orbital pesada en gravedad cero
      ring1Group.rotation.y += dt * 0.2 * speedMult;
      ring1Group.rotation.x += dt * 0.08 * speedMult;

      ring2Group.rotation.x += dt * 0.16 * speedMult;
      ring2Group.rotation.z -= dt * 0.12 * speedMult;

      ring3Group.rotation.y -= dt * 0.24 * speedMult;
      ring3Group.rotation.z += dt * 0.14 * speedMult;

      satelliteRingMesh.rotation.z += dt * 0.45 * speedMult;

      cubeMesh.rotation.x += dt * 0.42 * speedMult;
      cubeMesh.rotation.y += dt * 0.55 * speedMult;
      cubeWireframe.rotation.x -= dt * 0.28 * speedMult;
      cubeWireframe.rotation.y -= dt * 0.36 * speedMult;

      dustPoints.rotation.y += dt * 0.05 * speedMult;
      dustPoints.rotation.z -= dt * 0.02 * speedMult;

      // Respiración lenta del núcleo y evolución de plasma GLSL
      const coreBreath = 1.005 + Math.sin(elapsed * 1.5) * 0.045;
      coreMesh.scale.setScalar(coreBreath);
      coreMat.uniforms.uTime.value = elapsed;

      if (coronaMat) {
        coronaMat.opacity = 0.74 + Math.sin(elapsed * 1.5) * 0.06;
      }
      if (diffractionMat) {
        diffractionMat.opacity = 0.43 + Math.sin(elapsed * 1.9 + 0.8) * 0.05;
        diffractionMat.rotation = elapsed * 0.06;
      }

      // Micro-flotación vertical + inclinación lerp hacia el cursor (0.045)
      emblemGroup.position.y = Math.sin(elapsed * 1.1) * 0.045;
      emblemGroup.rotation.x +=
        (targetMouseTiltX - emblemGroup.rotation.x) * 0.045;
      emblemGroup.rotation.y +=
        (targetMouseTiltY - emblemGroup.rotation.y) * 0.045;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (!rafId && !document.hidden && isIntersecting) {
        clock.getDelta();
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0]?.isIntersecting ?? true;
        if (isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleMouseReset);

      for (const item of disposables) {
        item.dispose();
      }
      scene.clear();
      envRT.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative pointer-events-none select-none w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] ${className}`}
    />
  );
}

export default EllikEmblem3D;

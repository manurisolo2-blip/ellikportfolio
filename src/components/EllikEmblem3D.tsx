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

function createStarHaloTexture(warmInner: boolean): THREE.CanvasTexture | null {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  if (warmInner) {
    grad.addColorStop(0, "rgba(255, 253, 247, 1)");
    grad.addColorStop(0.28, "rgba(244, 241, 234, 0.58)");
    grad.addColorStop(0.62, "rgba(244, 241, 234, 0.12)");
    grad.addColorStop(1, "rgba(244, 241, 234, 0)");
  } else {
    grad.addColorStop(0, "rgba(244, 241, 234, 0.55)");
    grad.addColorStop(0.35, "rgba(244, 241, 234, 0.2)");
    grad.addColorStop(0.7, "rgba(147, 197, 253, 0.05)");
    grad.addColorStop(1, "rgba(5, 5, 5, 0)");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Construye una escena procedural de estudio oscuro con 4 paneles softbox
 * estratégicos para generar reflejos de cromo oscuro con alto contraste.
 */
function buildDarkStudioEnvironment(
  pmremGenerator: THREE.PMREMGenerator
): THREE.WebGLRenderTarget {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#030305");

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

  // 1. Tira principal superior derecha en blanco puro (intensidad alta para brillos filosos)
  addLightPanel(7.5, 2.2, "#FFFFFF", 3.6, [5.4, 4.6, 4.0]);

  // 2. Tira lateral izquierda en blanco cálido (intensidad media)
  addLightPanel(2.6, 7.2, "#F4F1EA", 1.9, [-6.0, 0.6, 3.0]);

  // 3. Tira inferior trasera en azul hielo muy sutil (intensidad baja para despegar volumen)
  addLightPanel(8.5, 2.0, "#93C5FD", 0.85, [0.0, -5.5, -4.4]);

  // 4. Panel cenital fino que marca el borde superior del cubo biselado y los aros
  addLightPanel(6.8, 1.1, "#FFFFFF", 2.6, [0.0, 6.4, 0.8]);

  const rt = pmremGenerator.fromScene(envScene, 0.02);
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
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.className = "block h-full w-full pointer-events-none";
    renderer.domElement.style.background = "transparent";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      initialW / initialH,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.4);

    // A. Entorno procedural de estudio oscuro (sin RoomEnvironment lavado)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRT = buildDarkStudioEnvironment(pmremGenerator);
    scene.environment = envRT.texture;

    // Luces puntuales y direccionales de precisión
    const centerLight = new THREE.PointLight("#F4F1EA", 4.5, 6);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    const keyLight = new THREE.DirectionalLight("#FFFFFF", 2.2);
    keyLight.position.set(4.5, 5.5, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#93C5FD", 1.1);
    rimLight.position.set(-4.5, -3.5, -4.0);
    scene.add(rimLight);

    // Grupo maestro del emblema ELLIK
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Núcleo Estelar Refinado (estrella compacta + doble halo volumétrico)
    const coreGeo = new THREE.SphereGeometry(0.11, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      emissive: "#FFFDF7",
      emissiveIntensity: 3.0,
      roughness: 0.08,
      metalness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    emblemGroup.add(coreMesh);
    disposables.push(coreGeo, coreMat);

    const innerHaloTex = createStarHaloTexture(true);
    const outerHaloTex = createStarHaloTexture(false);
    let innerHaloMat: THREE.SpriteMaterial | null = null;
    let outerHaloMat: THREE.SpriteMaterial | null = null;

    if (innerHaloTex) {
      innerHaloMat = new THREE.SpriteMaterial({
        map: innerHaloTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.9,
      });
      const innerSprite = new THREE.Sprite(innerHaloMat);
      innerSprite.scale.set(0.66, 0.66, 1);
      emblemGroup.add(innerSprite);
      disposables.push(innerHaloTex, innerHaloMat);
    }

    if (outerHaloTex) {
      outerHaloMat = new THREE.SpriteMaterial({
        map: outerHaloTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.28,
      });
      const outerSprite = new THREE.Sprite(outerHaloMat);
      outerSprite.scale.set(1.55, 1.55, 1);
      emblemGroup.add(outerSprite);
      disposables.push(outerHaloTex, outerHaloMat);
    }

    // 2. Anillo 1 — Órbita Exterior Principal (Cromo Oscuro Espejado)
    const ring1Group = new THREE.Group();
    ring1Group.position.set(0.03, 0.02, 0);
    ring1Group.rotation.set(0.36, 0.22, 0.1);
    emblemGroup.add(ring1Group);

    const ring1Geo = new THREE.TorusGeometry(1.52, 0.026, 48, 180);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: "#27272A",
      metalness: 1.0,
      roughness: 0.09,
      envMapIntensity: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Group.add(ring1Mesh);
    disposables.push(ring1Geo, ring1Mat);

    // 3. Anillo 2 — Órbita Media Inclinada + Esfera Satélite Pulida
    const ring2Group = new THREE.Group();
    ring2Group.rotation.set(1.04, -0.38, 0.22);
    emblemGroup.add(ring2Group);

    const ring2Geo = new THREE.TorusGeometry(1.18, 0.02, 48, 160);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
      color: "#A1A1AA",
      metalness: 0.96,
      roughness: 0.16,
      envMapIntensity: 1.8,
      clearcoat: 0.7,
      clearcoatRoughness: 0.1,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Group.add(ring2Mesh);
    disposables.push(ring2Geo, ring2Mat);

    const satelliteGeo = new THREE.SphereGeometry(0.085, 32, 32);
    const satelliteMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      metalness: 1.0,
      roughness: 0.04,
      envMapIntensity: 2.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });
    const satelliteMesh = new THREE.Mesh(satelliteGeo, satelliteMat);
    satelliteMesh.position.set(1.18, 0, 0);
    ring2Group.add(satelliteMesh);
    disposables.push(satelliteGeo, satelliteMat);

    // 4. Anillo 3 — Órbita Interior + Cubo Biselado de Precisión (RoundedBoxGeometry)
    const ring3Group = new THREE.Group();
    ring3Group.position.set(-0.08, -0.06, 0);
    ring3Group.rotation.set(-0.52, 0.45, -0.25);
    emblemGroup.add(ring3Group);

    const ring3Geo = new THREE.TorusGeometry(0.84, 0.022, 48, 140);
    const ring3Mat = new THREE.MeshPhysicalMaterial({
      color: "#18181B",
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 2.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.06,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Group.add(ring3Mesh);
    disposables.push(ring3Geo, ring3Mat);

    const cubeGeo = new RoundedBoxGeometry(0.16, 0.16, 0.16, 4, 0.025);
    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: "#E4E4E7",
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0, 0.84, 0);
    ring3Group.add(cubeMesh);
    disposables.push(cubeGeo, cubeMat);

    // 5. Polvo Orbital Microscópico (70 partículas sutiles en anillo inclinado)
    const dustCount = 70;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      // Distribución determinista suave para estética limpia
      const angle = (i / dustCount) * Math.PI * 2 + (i % 7) * 0.19;
      const radius = 1.0 + ((i * 37) % 100) / 100 * 0.85;
      const yJitter = (((i * 53) % 100) / 100 - 0.5) * 0.24;
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
      opacity: 0.45,
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

    // Seguimiento sedoso del puntero en desktop
    const finePointerMq = window.matchMedia("(pointer: fine)");
    let targetMouseTiltX = 0;
    let targetMouseTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!finePointerMq.matches) return;
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      const nx = e.clientX / vw - 0.5;
      const ny = e.clientY / vh - 0.5;
      targetMouseTiltX = ny * 0.42;
      targetMouseTiltY = nx * 0.55;
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

      // Rotación giroscópica independiente de los 3 anillos
      ring1Group.rotation.y += dt * 0.36 * speedMult;
      ring1Group.rotation.x += dt * 0.15 * speedMult;

      ring2Group.rotation.x += dt * 0.3 * speedMult;
      ring2Group.rotation.z -= dt * 0.23 * speedMult;

      ring3Group.rotation.y -= dt * 0.46 * speedMult;
      ring3Group.rotation.z += dt * 0.26 * speedMult;

      // Rotación local propia del cubo 3D biselado sobre su eje
      cubeMesh.rotation.x += dt * 0.85 * speedMult;
      cubeMesh.rotation.y += dt * 1.1 * speedMult;

      // Giro lento del anillo de polvo orbital
      dustPoints.rotation.y += dt * 0.08 * speedMult;
      dustPoints.rotation.z -= dt * 0.03 * speedMult;

      // Micro-flotación vertical + inclinación lerp hacia el cursor
      emblemGroup.position.y = Math.sin(elapsed * 1.2) * 0.055;
      emblemGroup.rotation.x +=
        (targetMouseTiltX - emblemGroup.rotation.x) * 0.05;
      emblemGroup.rotation.y +=
        (targetMouseTiltY - emblemGroup.rotation.y) * 0.05;

      if (innerHaloMat) {
        innerHaloMat.opacity = 0.86 + Math.sin(elapsed * 2.2) * 0.08;
      }
      if (outerHaloMat) {
        outerHaloMat.opacity = 0.26 + Math.sin(elapsed * 1.6) * 0.04;
      }

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

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface EllikEmblem3DProps {
  className?: string;
  boost?: boolean;
  scrollProgress?: number;
  scrollProgressRef?: React.RefObject<number>;
}

function createStarHaloTexture(): THREE.CanvasTexture | null {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
  grad.addColorStop(0.24, "rgba(244, 241, 234, 0.45)");
  grad.addColorStop(0.56, "rgba(244, 241, 234, 0.09)");
  grad.addColorStop(1, "rgba(244, 241, 234, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initialW, initialH, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.className = "block h-full w-full pointer-events-none";
    renderer.domElement.style.background = "transparent";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      initialW / initialH,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.4);

    // Entorno real de estudio (sin assets externos)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;

    // Sistema de 3 luces físicas
    const centerLight = new THREE.PointLight(0xf4f1ea, 6, 12);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x94a3b8, 1.4);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // Grupo maestro del emblema ELLIK
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Núcleo Estelar Central + Halo Volumétrico
    const coreGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      emissive: "#F4F1EA",
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    emblemGroup.add(coreMesh);
    disposables.push(coreGeo, coreMat);

    const glowTexture = createStarHaloTexture();
    let haloMat: THREE.SpriteMaterial | null = null;
    if (glowTexture) {
      haloMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.85,
      });
      const haloSprite = new THREE.Sprite(haloMat);
      haloSprite.scale.set(1.55, 1.55, 1);
      emblemGroup.add(haloSprite);
      disposables.push(glowTexture, haloMat);
    }

    // 2. Anillo 1 — Órbita Principal Pulida
    const ring1Group = new THREE.Group();
    ring1Group.position.set(0.05, 0.04, 0);
    ring1Group.rotation.set(0.35, 0.2, 0.1);
    emblemGroup.add(ring1Group);

    const ring1Geo = new THREE.TorusGeometry(1.38, 0.036, 32, 128);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: "#EAE6DF",
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Group.add(ring1Mesh);
    disposables.push(ring1Geo, ring1Mat);

    // 3. Anillo 2 — Órbita Exterior Inclinada + Esfera Satélite 3D
    const ring2Group = new THREE.Group();
    ring2Group.rotation.set(1.05, -0.38, 0.22);
    emblemGroup.add(ring2Group);

    const ring2Geo = new THREE.TorusGeometry(1.62, 0.024, 28, 128);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
      color: "#B4B4BC",
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.6,
      clearcoatRoughness: 0.14,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Group.add(ring2Mesh);
    disposables.push(ring2Geo, ring2Mat);

    const satelliteGeo = new THREE.SphereGeometry(0.11, 32, 32);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      metalness: 0.95,
      roughness: 0.08,
      emissive: "#F4F1EA",
      emissiveIntensity: 0.35,
    });
    const satelliteMesh = new THREE.Mesh(satelliteGeo, satelliteMat);
    satelliteMesh.position.set(1.62, 0, 0);
    ring2Group.add(satelliteMesh);
    disposables.push(satelliteGeo, satelliteMat);

    // 4. Anillo 3 — Órbita Interior Excéntrica + Nodo Cubo 3D
    const ring3Group = new THREE.Group();
    ring3Group.position.set(-0.18, -0.12, 0);
    ring3Group.rotation.set(-0.52, 0.45, -0.25);
    emblemGroup.add(ring3Group);

    const ring3Geo = new THREE.TorusGeometry(0.95, 0.03, 28, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: "#D4D4D8",
      metalness: 0.88,
      roughness: 0.18,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Group.add(ring3Mesh);
    disposables.push(ring3Geo, ring3Mat);

    const cubeGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      metalness: 0.9,
      roughness: 0.12,
      emissive: "#FFFFFF",
      emissiveIntensity: 0.2,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0, 0.95, 0);
    ring3Group.add(cubeMesh);
    disposables.push(cubeGeo, cubeMat);

    // Respuesta al tamaño del contenedor
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 1);
      const h = Math.max(Math.round(entry.contentRect.height), 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
      ring1Group.rotation.y += dt * 0.38 * speedMult;
      ring1Group.rotation.x += dt * 0.16 * speedMult;

      ring2Group.rotation.x += dt * 0.31 * speedMult;
      ring2Group.rotation.z -= dt * 0.24 * speedMult;

      ring3Group.rotation.y -= dt * 0.48 * speedMult;
      ring3Group.rotation.z += dt * 0.28 * speedMult;

      // Rotación local propia del cubo 3D sobre su eje
      cubeMesh.rotation.x += dt * 0.9 * speedMult;
      cubeMesh.rotation.y += dt * 1.15 * speedMult;

      // Micro-flotación vertical + inclinación lerp hacia el cursor
      emblemGroup.position.y = Math.sin(elapsed * 1.2) * 0.06;
      emblemGroup.rotation.x +=
        (targetMouseTiltX - emblemGroup.rotation.x) * 0.05;
      emblemGroup.rotation.y +=
        (targetMouseTiltY - emblemGroup.rotation.y) * 0.05;

      if (haloMat) {
        haloMat.opacity = 0.78 + Math.sin(elapsed * 2.1) * 0.1;
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
      roomEnv.dispose();
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

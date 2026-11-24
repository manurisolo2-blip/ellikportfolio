"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ELLIK_LOGO_BEZIER_SEGMENTS_A,
  ELLIK_LOGO_BEZIER_SEGMENTS_B,
  ELLIK_LOGO_SIZE,
  ELLIK_LOGO_STROKE_WIDTH,
  type CubicBezierSegment,
} from "@/lib/ellikLogoGeometry";
import { EllikEmblem } from "./EllikLogo";

export interface EllikEmblem3DProps {
  className?: string;
  boost?: boolean;
  scrollProgress?: number;
  scrollProgressRef?: React.RefObject<number>;
}

function createCoronaHaloTexture(): THREE.CanvasTexture | null {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(255, 253, 247, 0.52)");
  grad.addColorStop(0.28, "rgba(244, 241, 234, 0.24)");
  grad.addColorStop(0.58, "rgba(212, 212, 216, 0.08)");
  grad.addColorStop(0.82, "rgba(212, 212, 216, 0.02)");
  grad.addColorStop(1, "rgba(212, 212, 216, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Construye una escena procedural de estudio monocromática con softboxes amplios
 * en blanco cálido y neutros metálicos para generar reflejos continuos y nítidos.
 */
function buildDarkStudioEnvironment(
  pmremGenerator: THREE.PMREMGenerator
): THREE.WebGLRenderTarget {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#080808");

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

  // Softbox superior amplio en blanco cálido starlight
  addLightPanel(14, 6, "#FFFDF7", 2.5, [0.0, 6.2, 2.8]);

  // Dos tiras laterales anchas en tonos blanco cálido y plata neutra
  addLightPanel(4, 12, "#F4F1EA", 2.0, [-6.4, 0.4, 1.8]);
  addLightPanel(4, 12, "#E4E4E7", 1.85, [6.4, 0.2, 1.6]);

  // Panel inferior de rebote neutro en zinc medio para despegar la base escultórica
  addLightPanel(14, 8, "#71717A", 1.35, [0.0, -6.2, 0.5]);

  // Cinta frontal superior para definir los biseles y aristas del metal
  addLightPanel(10, 2.4, "#FFFDF7", 2.1, [2.4, 3.4, 5.8]);

  // Relleno trasero sutil para iluminar el contorno en inclinaciones pronunciadas
  addLightPanel(8, 8, "#A1A1AA", 1.1, [-3.0, -2.0, -5.5]);

  const rt = pmremGenerator.fromScene(envScene, 0.035);
  for (const d of tempDisposables) {
    d.dispose();
  }
  envScene.clear();
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
  const [webglFailed, setWebglFailed] = useState(false);

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
      if (!renderer.getContext()) {
        renderer.dispose();
        setWebglFailed(true);
        return;
      }
    } catch {
      setWebglFailed(true);
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

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRT = buildDarkStudioEnvironment(pmremGenerator);
    scene.environment = envRT.texture;

    // Iluminación de estudio estrictamente monocromática / blanco cálido
    const hemiLight = new THREE.HemisphereLight("#F4F1EA", "#27272A", 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight("#FFFFFF", 2.6);
    keyLight.position.set(5.0, 6.0, 5.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#D4D4D8", 2.0);
    rimLight.position.set(-5.0, -3.5, -4.5);
    scene.add(rimLight);

    const centerLight = new THREE.PointLight("#F4F1EA", 4.2, 7);
    centerLight.position.set(0, 0, 0.9);
    scene.add(centerLight);

    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const disposables: Array<{ dispose: () => void }> = [];

    // Halo de corona starlight tenue detrás del emblema metálico
    const coronaTex = createCoronaHaloTexture();
    let coronaMat: THREE.SpriteMaterial | null = null;
    if (coronaTex) {
      coronaMat = new THREE.SpriteMaterial({
        map: coronaTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.42,
      });
      const coronaSprite = new THREE.Sprite(coronaMat);
      coronaSprite.position.set(0, 0, -0.18);
      coronaSprite.scale.set(1.8, 1.8, 1);
      emblemGroup.add(coronaSprite);
      disposables.push(coronaTex, coronaMat);
    }

    // Mapeo exacto SVG [0..512] -> espacio 3D (invirtiendo Y para mantener orientación vertical)
    const worldScale = 3.1 / ELLIK_LOGO_SIZE;
    const toVec3 = (x: number, y: number, z = 0) =>
      new THREE.Vector3((x - 256) * worldScale, -(y - 256) * worldScale, z);
    const tubeRadius = (ELLIK_LOGO_STROKE_WIDTH / 2) * worldScale;

    const capGeo = new THREE.SphereGeometry(tubeRadius, 18, 18);
    disposables.push(capGeo);

    const buildRibbonMesh = (
      segments: readonly CubicBezierSegment[],
      material: THREE.Material,
      zOffset = 0
    ): THREE.Group => {
      const ribbonGroup = new THREE.Group();
      const curvePath = new THREE.CurvePath<THREE.Vector3>();

      for (const [p0, p1, p2, p3] of segments) {
        curvePath.add(
          new THREE.CubicBezierCurve3(
            toVec3(p0[0], p0[1], zOffset),
            toVec3(p1[0], p1[1], zOffset),
            toVec3(p2[0], p2[1], zOffset),
            toVec3(p3[0], p3[1], zOffset)
          )
        );
      }

      const tubeGeo = new THREE.TubeGeometry(
        curvePath,
        96,
        tubeRadius,
        20,
        false
      );
      const ribbonMesh = new THREE.Mesh(tubeGeo, material);
      ribbonGroup.add(ribbonMesh);
      disposables.push(tubeGeo);

      const first = segments[0];
      const last = segments[segments.length - 1];
      if (first && last) {
        const startCap = new THREE.Mesh(capGeo, material);
        startCap.position.copy(toVec3(first[0][0], first[0][1], zOffset));
        ribbonGroup.add(startCap);

        const endCap = new THREE.Mesh(capGeo, material);
        endCap.position.copy(toVec3(last[3][0], last[3][1], zOffset));
        ribbonGroup.add(endCap);
      }

      return ribbonGroup;
    };

    const ribbonAMat = new THREE.MeshPhysicalMaterial({
      color: "#F4F1EA",
      metalness: 0.9,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.9,
    });

    const ribbonBMat = new THREE.MeshPhysicalMaterial({
      color: "#FFFFFF",
      metalness: 0.92,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.0,
    });

    disposables.push(ribbonAMat, ribbonBMat);

    emblemGroup.add(buildRibbonMesh(ELLIK_LOGO_BEZIER_SEGMENTS_A, ribbonAMat, 0));
    emblemGroup.add(buildRibbonMesh(ELLIK_LOGO_BEZIER_SEGMENTS_B, ribbonBMat, 0));

    // Micro-polvo estelar sutil en suspensión
    const dustCount = 50;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const angle = (i / dustCount) * Math.PI * 2 + (i % 7) * 0.19;
      const radius = 1.08 + (((i * 37) % 100) / 100) * 0.82;
      const yJitter = (((i * 53) % 100) / 100 - 0.5) * 0.34;
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
      size: 0.017,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustPoints.rotation.set(0.42, 0.18, -0.22);
    emblemGroup.add(dustPoints);
    disposables.push(dustGeo, dustMat);

    const finePointerMq = window.matchMedia("(pointer: fine)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 1);
      const h = Math.max(Math.round(entry.contentRect.height), 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      if (reducedMotionMq.matches) {
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(container);

    let targetMouseTiltX = 0;
    let targetMouseTiltY = 0;

    const clampTilt = (val: number) => Math.max(-0.38, Math.min(0.38, val));

    const handleMouseMove = (e: MouseEvent) => {
      if (!isIntersecting || !finePointerMq.matches || reducedMotionMq.matches) return;
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      const nx = e.clientX / vw - 0.5;
      const ny = e.clientY / vh - 0.5;
      targetMouseTiltX = clampTilt(ny * 0.76);
      targetMouseTiltY = clampTilt(nx * 0.76);
    };

    const handleMouseReset = () => {
      targetMouseTiltX = 0;
      targetMouseTiltY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", handleMouseReset);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let swayTime = 0;
    let speedMult = 1;
    let boostMix = 0;
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

      const targetBoostMix = boostRef.current ? 1 : 0;
      boostMix += (targetBoostMix - boostMix) * (1 - Math.exp(-5 * dt));

      const targetSpeed = 1 + boostMix * 0.85 + clampedScroll * 1.4;
      speedMult += (targetSpeed - speedMult) * (1 - Math.exp(-6 * dt));
      swayTime += dt * (1 + boostMix * 0.85);

      dustPoints.rotation.y += dt * 0.045 * speedMult;
      dustPoints.rotation.z -= dt * 0.018 * speedMult;

      if (coronaMat) {
        coronaMat.opacity =
          0.4 + Math.sin(elapsed * 1.4) * 0.03 + boostMix * 0.06;
      }
      centerLight.intensity =
        4.2 + Math.sin(elapsed * 1.6) * 0.35 + boostMix * 0.85;

      // Flotación suave + balanceo escultórico frontal siempre legible
      emblemGroup.position.y = Math.sin(elapsed * 1.1) * 0.05;

      const swayAmp = 1 + boostMix * 0.2;
      const swayX = Math.sin(swayTime * 0.55) * 0.14 * swayAmp;
      const swayY = Math.cos(swayTime * 0.45) * 0.22 * swayAmp;

      emblemGroup.rotation.x +=
        (swayX + targetMouseTiltX - emblemGroup.rotation.x) * 0.045;
      emblemGroup.rotation.y +=
        (swayY + targetMouseTiltY - emblemGroup.rotation.y) * 0.045;

      const targetRotZ =
        clampedScroll * 0.45 + boostMix * Math.sin(swayTime * 0.9) * 0.06;
      emblemGroup.rotation.z += (targetRotZ - emblemGroup.rotation.z) * 0.06;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (reducedMotionMq.matches) {
        renderer.render(scene, camera);
        return;
      }
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

    const handleReducedMotionChange = () => {
      if (reducedMotionMq.matches) {
        stopLoop();
        emblemGroup.position.y = 0;
        emblemGroup.rotation.set(0, 0, 0);
        renderer.render(scene, camera);
      } else {
        startLoop();
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
    reducedMotionMq.addEventListener("change", handleReducedMotionChange);

    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionMq.removeEventListener("change", handleReducedMotionChange);
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
      className={`relative flex items-center justify-center pointer-events-none select-none w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] ${className}`}
    >
      {webglFailed ? (
        <EllikEmblem className="h-44 w-44 sm:h-52 sm:w-52 md:h-64 md:w-64 text-[#F4F1EA]" />
      ) : null}
    </div>
  );
}

export default EllikEmblem3D;

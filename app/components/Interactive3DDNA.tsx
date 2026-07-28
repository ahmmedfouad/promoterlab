"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type DNAProps = {
  activeSequence?: string;
};

export function Interactive3DDNA({ activeSequence = "TTGACATGCATCGATCGATCGATCGATCGATATAAATGC" }: DNAProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBase, setHoveredBase] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 32;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 100);
    pointLight.position.set(10, 10, 15);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight2.position.set(-10, -10, -15);
    scene.add(pointLight2);

    // Parent group for entire 3D model
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Background Vinca Cellular State Particle Sphere Mesh
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 18 + Math.random() * 6;

      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.4,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    dnaGroup.add(particleMesh);

    // Color definitions for DNA bases
    const baseColors: Record<string, number> = {
      A: 0x10b981, // Emerald
      T: 0xa855f7, // Purple
      C: 0x6366f1, // Indigo
      G: 0x06b6d4, // Cyan
    };

    // Build 3D Helix from sequence
    const normalizedSeq = activeSequence.replace(/\s/g, "").toUpperCase();
    const numPairs = Math.min(normalizedSeq.length, 30);
    const radius = 4;
    const heightPerPair = 0.8;
    const twistAngle = 0.45;

    const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);

    const baseMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < numPairs; i++) {
      const char = normalizedSeq[i] || "A";
      const y = (i - numPairs / 2) * heightPerPair;
      const angle = i * twistAngle;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Base Node 1
      const mat1 = new THREE.MeshStandardMaterial({
        color: baseColors[char] || 0x6366f1,
        roughness: 0.3,
        metalness: 0.2,
        emissive: baseColors[char] || 0x6366f1,
        emissiveIntensity: 0.2,
      });
      const node1 = new THREE.Mesh(sphereGeo, mat1);
      node1.position.set(x1, y, z1);
      node1.userData = { base: char, index: i };
      dnaGroup.add(node1);
      baseMeshes.push(node1);

      // Complementary Base Node 2
      const compMap: Record<string, string> = { A: "T", T: "A", C: "G", G: "C" };
      const compChar = compMap[char] || "T";
      const mat2 = new THREE.MeshStandardMaterial({
        color: baseColors[compChar] || 0xa855f7,
        roughness: 0.3,
        metalness: 0.2,
        emissive: baseColors[compChar] || 0xa855f7,
        emissiveIntensity: 0.2,
      });
      const node2 = new THREE.Mesh(sphereGeo, mat2);
      node2.position.set(x2, y, z2);
      node2.userData = { base: compChar, index: i };
      dnaGroup.add(node2);
      baseMeshes.push(node2);

      // Rung connecting node 1 and node 2
      const rungMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.6,
      });
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      rung.scale.set(1, radius * 2, 1);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      dnaGroup.add(rung);
    }

    // Mouse Interaction setup
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsInteracting(true);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      dnaGroup.rotation.y += deltaX * 0.01;
      dnaGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      setIsInteracting(false);
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(baseMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.base) {
          setHoveredBase(`Base Pair #${hit.userData.index + 1}: ${hit.userData.base}`);
        }
      } else {
        setHoveredBase(null);
      }
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handlePointerMove);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isMouseDown) {
        dnaGroup.rotation.y += 0.005;
        particleMesh.rotation.y -= 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeSequence]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 via-[#090d16] to-[#090d16] p-4 shadow-2xl backdrop-blur-xl">
      {/* Dynamic Header Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
        3D Interactive DNA Canvas
      </div>

      {/* Hover Info Badge */}
      <div className="absolute top-4 right-4 z-10 font-mono text-xs font-bold text-cyan-300">
        {hoveredBase || (isInteracting ? "Rotating 3D Model..." : "Drag Mouse to Rotate 3D Helix")}
      </div>

      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="h-[380px] w-full cursor-grab active:cursor-grabbing sm:h-[440px]" />

      {/* Legend Footer Bar */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-4 border-t border-slate-800/80 pt-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Adenine (A)
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-purple-400">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Thymine (T)
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Cytosine (C)
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Guanine (G)
        </div>
      </div>
    </div>
  );
}

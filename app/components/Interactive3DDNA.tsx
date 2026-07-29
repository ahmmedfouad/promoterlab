"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type DNAProps = { activeSequence?: string };

const BASE_COLORS: Record<string, number> = {
  A: 0xc97050,
  T: 0xd8ad45,
  C: 0x4f8a62,
  G: 0x23352c,
};

export function Interactive3DDNA({ activeSequence = "TTGACATGCATCGATCGATCGATCGATCGATATAAATGC" }: DNAProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBase, setHoveredBase] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 1000);
    camera.position.z = 31;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    scene.add(new THREE.AmbientLight(0xffffff, 1.65));
    const keyLight = new THREE.DirectionalLight(0xd8ad45, 2.4);
    keyLight.position.set(8, 10, 16);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xc97050, 1.2, 80);
    fillLight.position.set(-10, -8, 10);
    scene.add(fillLight);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    const particleGeo = new THREE.BufferGeometry();
    const particleCount = window.innerWidth < 640 ? 100 : 240;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < positions.length; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 16 + Math.random() * 6;
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.19, color: 0x4f8a62, transparent: true, opacity: 0.32 }));
    dnaGroup.add(particles);

    const sequence = activeSequence.replace(/\s/g, "").toUpperCase();
    const pairs = Math.min(sequence.length, window.innerWidth < 640 ? 20 : 30);
    const sphere = new THREE.SphereGeometry(0.52, 14, 14);
    const rungGeometry = new THREE.CylinderGeometry(0.065, 0.065, 1, 8);
    const bases: THREE.Mesh[] = [];
    const complement: Record<string, string> = { A: "T", T: "A", C: "G", G: "C" };

    for (let index = 0; index < pairs; index++) {
      const base = sequence[index] || "A";
      const pairedBase = complement[base] || "T";
      const angle = index * 0.45;
      const y = (index - pairs / 2) * 0.8;
      const x = Math.cos(angle) * 4;
      const z = Math.sin(angle) * 4;
      const oppositeX = Math.cos(angle + Math.PI) * 4;
      const oppositeZ = Math.sin(angle + Math.PI) * 4;

      for (const [letter, px, pz] of [[base, x, z], [pairedBase, oppositeX, oppositeZ]] as const) {
        const color = BASE_COLORS[letter] || BASE_COLORS.C;
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.04, emissive: color, emissiveIntensity: 0.06 });
        const node = new THREE.Mesh(sphere, material);
        node.position.set(px, y, pz);
        node.userData = { base: letter, index };
        dnaGroup.add(node);
        bases.push(node);
      }

      const rung = new THREE.Mesh(rungGeometry, new THREE.MeshBasicMaterial({ color: 0x23352c, transparent: true, opacity: 0.42 }));
      rung.position.set((x + oppositeX) / 2, y, (z + oppositeZ) / 2);
      rung.scale.set(1, 8, 1);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      dnaGroup.add(rung);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let previous = { x: 0, y: 0 };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      setIsInteracting(true);
      previous = { x: event.clientX, y: event.clientY };
      container.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      if (dragging) {
        dnaGroup.rotation.y += (event.clientX - previous.x) * 0.01;
        dnaGroup.rotation.x += (event.clientY - previous.y) * 0.01;
        previous = { x: event.clientX, y: event.clientY };
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(bases)[0]?.object;
      setHoveredBase(hit?.userData?.base ? `Pair ${hit.userData.index + 1} · ${hit.userData.base}` : null);
    };
    const onPointerEnd = () => { dragging = false; setIsInteracting(false); };
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerEnd);
    container.addEventListener("pointercancel", onPointerEnd);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!dragging) { dnaGroup.rotation.y += 0.003; particles.rotation.y -= 0.0012; }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerEnd);
      container.removeEventListener("pointercancel", onPointerEnd);
      sphere.dispose(); rungGeometry.dispose(); particleGeo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [activeSequence]);

  return (
    <section className="dna-atlas" aria-label="Interactive three-dimensional DNA model">
      <div className="dna-atlas-top"><span>DNA model</span><strong>{hoveredBase || (isInteracting ? "Rotating helix" : "Drag to rotate")}</strong></div>
      <div ref={mountRef} className="dna-atlas-canvas" />
      <div className="dna-atlas-legend" aria-label="DNA base colour legend">
        <span><i className="base-a" /> A · adenine</span><span><i className="base-t" /> T · thymine</span><span><i className="base-c" /> C · cytosine</span><span><i className="base-g" /> G · guanine</span>
      </div>
    </section>
  );
}

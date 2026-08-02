"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type DNAProps = { activeSequence?: string };

const COMPLEMENT: Record<string, string> = { A: "T", T: "A", C: "G", G: "C" };

export function Interactive3DDNA({ activeSequence = "TTGACATGCATCGATCGATCGATCGATCGATATAAATGC" }: DNAProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBase, setHoveredBase] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const readColor = (token: string) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(token).trim()).getHex();
    const baseColors: Record<string, number> = {
      A: readColor("--base-a"),
      T: readColor("--base-t"),
      C: readColor("--base-c"),
      G: readColor("--base-g"),
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      const fallback = document.createElement("p");
      fallback.className = "minimal-dna-fallback";
      fallback.textContent = "WebGL is unavailable in this browser.";
      container.appendChild(fallback);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(readColor("--dna-canvas"), 1);
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 25);

    scene.add(new THREE.HemisphereLight(readColor("--white"), readColor("--line-strong"), 2.3));
    const keyLight = new THREE.DirectionalLight(readColor("--white"), 2.6);
    keyLight.position.set(8, 10, 12);
    scene.add(keyLight);

    const dna = new THREE.Group();
    scene.add(dna);
    const sequence = (activeSequence.replace(/\s/g, "").toUpperCase() || "ATCG").slice(0, 24);
    const sphereGeometry = new THREE.SphereGeometry(0.38, 18, 18);
    const rungGeometry = new THREE.CylinderGeometry(0.055, 0.055, 1, 8);
    const bases: THREE.Mesh[] = [];
    const materials: THREE.Material[] = [];

    Array.from(sequence).forEach((base, index) => {
      const pairedBase = COMPLEMENT[base] || "T";
      const angle = index * 0.62;
      const y = (index - (sequence.length - 1) / 2) * 0.68;
      const x = Math.cos(angle) * 2.6;
      const z = Math.sin(angle) * 2.6;
      const oppositeX = -x;
      const oppositeZ = -z;

      [[base, x, z], [pairedBase, oppositeX, oppositeZ]].forEach(([letter, px, pz]) => {
        const color = baseColors[letter as string] || baseColors.C;
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.08 });
        const node = new THREE.Mesh(sphereGeometry, material);
        node.position.set(px as number, y, pz as number);
        node.userData = { base: letter, index };
        dna.add(node);
        bases.push(node);
        materials.push(material);
      });

      const rungMaterial = new THREE.MeshStandardMaterial({ color: readColor("--dna-rung"), roughness: 0.65, metalness: 0.05 });
      const rung = new THREE.Mesh(rungGeometry, rungMaterial);
      rung.position.set(0, y, 0);
      rung.scale.y = 5.2;
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      dna.add(rung);
      materials.push(rungMaterial);
    });

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 340);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    resize();
    window.addEventListener("resize", resize);

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
        dna.rotation.y += (event.clientX - previous.x) * 0.012;
        dna.rotation.x += (event.clientY - previous.y) * 0.008;
        previous = { x: event.clientX, y: event.clientY };
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(bases, false)[0]?.object;
      setHoveredBase(hit ? `Pair ${hit.userData.index + 1} · ${hit.userData.base}` : null);
    };
    const onPointerEnd = () => {
      dragging = false;
      setIsInteracting(false);
    };
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerEnd);
    container.addEventListener("pointerleave", onPointerEnd);

    let frame = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!dragging) dna.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerEnd);
      container.removeEventListener("pointerleave", onPointerEnd);
      sphereGeometry.dispose();
      rungGeometry.dispose();
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [activeSequence]);

  return (
    <section className="minimal-dna" aria-label="Interactive three-dimensional DNA model">
      <div className="minimal-dna-header">
        <span>DNA model</span>
        <strong>{hoveredBase || (isInteracting ? "Drag to rotate" : "Drag to rotate")}</strong>
      </div>
      <div ref={mountRef} className="minimal-dna-canvas" />
    </section>
  );
}

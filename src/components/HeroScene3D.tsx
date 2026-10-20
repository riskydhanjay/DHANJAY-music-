import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroScene3DProps {
  isPlaying?: boolean;
}

export const HeroScene3D: React.FC<HeroScene3DProps> = ({ isPlaying = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect headless or reduced-motion environments
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for Vinyl & Elements
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff4fa3, 4, 20);
    pinkLight.position.set(-3, 3, 3);
    scene.add(pinkLight);

    const purpleLight = new THREE.PointLight(0x7b2cff, 4, 20);
    purpleLight.position.set(3, -2, 2);
    scene.add(purpleLight);

    // 1. Vinyl Record
    const vinylGroup = new THREE.Group();
    vinylGroup.rotation.x = 0.55;
    vinylGroup.rotation.y = -0.3;
    rootGroup.add(vinylGroup);

    // Vinyl Body (Black cylinder with shiny groove material)
    const vinylGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.05, 48);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x0c0716,
      roughness: 0.25,
      metalness: 0.85,
    });
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
    vinylGroup.add(vinylMesh);

    // Grooves rings
    for (let r = 1.0; r <= 1.95; r += 0.12) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.03, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x24123d,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.028;
      vinylGroup.add(ringMesh);
    }

    // Vinyl Center Label (Neon Pink / Electric Purple)
    const labelGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.055, 32);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xff4fa3,
      emissive: 0x7b2cff,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    vinylGroup.add(labelMesh);

    // Spindle Hole
    const holeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x10091f });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    vinylGroup.add(holeMesh);

    // Outer Neon Aura Ring
    const auraGeo = new THREE.RingGeometry(2.15, 2.22, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff4fa3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.rotation.x = Math.PI / 2;
    vinylGroup.add(auraMesh);

    // Second Orbiting Ring
    const ring2Geo = new THREE.TorusGeometry(2.6, 0.02, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x7b2cff,
      transparent: true,
      opacity: 0.5,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = 1.2;
    rootGroup.add(ring2Mesh);

    // Floating Starlight Particles
    const starCount = isHeadless ? 30 : 120;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const pinkColor = new THREE.Color(0xff4fa3);
    const purpleColor = new THREE.Color(0x7b2cff);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 8;
      starPositions[idx + 1] = (Math.random() - 0.5) * 6;
      starPositions[idx + 2] = (Math.random() - 0.5) * 4;

      const mixed = Math.random() > 0.5 ? pinkColor : purpleColor;
      starColors[idx] = mixed.r;
      starColors[idx + 1] = mixed.g;
      starColors[idx + 2] = mixed.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    rootGroup.add(starPoints);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      if (isHeadless || prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      rootGroup.rotation.y = mouseX;
      rootGroup.rotation.x = mouseY;

      // Vinyl rotation
      const spinSpeed = isPlayingRef.current ? 1.8 : 0.4;
      vinylGroup.rotation.z += spinSpeed * delta;

      // Secondary ring slow tumble
      ring2Mesh.rotation.z -= 0.3 * delta;
      ring2Mesh.rotation.y += 0.2 * delta;

      // Starfield gentle breathing
      starPoints.rotation.y += 0.05 * delta;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[320px] md:h-[440px] flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Vinyl Experience"
      role="img"
    >
      <div className="absolute inset-0 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

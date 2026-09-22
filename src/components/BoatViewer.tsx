import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface BoatViewerProps {
  modelUrl: string;
}

function loadBoatModel(scene: THREE.Scene, modelUrl: string) {
  const g = new THREE.Group();
  new GLTFLoader().load(modelUrl, ({ scene: model }) => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    model.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = maxDimension > 0 ? 4.2 / maxDimension : 1;
    model.scale.setScalar(scale);
    model.position.y += (size.y * scale) / 2 + 0.03;
    g.add(model);
  });
  g.rotation.y = Math.PI * 0.14;
  scene.add(g);
  return g;
}

// ── main export ───────────────────────────────────────────────────────────────
export default function BoatViewer({ modelUrl }: BoatViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9299a1);
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(5.5, 3.2, 5.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

    // Soft studio lighting keeps the hull readable from every angle.
    const hemisphere = new THREE.HemisphereLight(0xf4f6f8, 0x59616a, 2.2);
    scene.add(hemisphere);

    const ambient = new THREE.AmbientLight(0xe6ebef, 0.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(7, 10, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd9e8f2, 1.4);
    fill.position.set(-6, 4, -5);
    scene.add(fill);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.3);
    rimLight.position.set(-2, 6, -8);
    scene.add(rimLight);

    const leftLight = new THREE.DirectionalLight(0xf5f7ff, 1.1);
    leftLight.position.set(-8, 3, 2);
    scene.add(leftLight);

    const rightLight = new THREE.DirectionalLight(0xffead0, 0.9);
    rightLight.position.set(8, 4, -1);
    scene.add(rightLight);

    loadBoatModel(scene, modelUrl);

    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth, nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(el);

    let id: number;
    const animate = () => {
      id = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      controls.dispose();
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [modelUrl]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

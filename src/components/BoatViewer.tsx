import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type BoatBuildType = "centerConsole46" | "centerConsole63" | "catamaran80";

interface BoatViewerProps {
  buildType: BoatBuildType;
  hullColor: number;
  accentColor: number;
}

// ── material helpers ──────────────────────────────────────────────────────────
function mat(color: number, metalness = 0.05, roughness = 0.65) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}
function glassMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x88b8d4,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.5,
  });
}

// ── mesh helper ───────────────────────────────────────────────────────────────
function box(
  g: THREE.Group,
  material: THREE.Material,
  lx: number, ly: number, lz: number,
  px: number, py: number, pz = 0,
  ry = 0
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(lx, ly, lz), material);
  m.position.set(px, py, pz);
  if (ry) m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function cyl(
  g: THREE.Group,
  material: THREE.Material,
  rt: number, rb: number, h: number,
  px: number, py: number, pz = 0,
  rx = 0, rz = 0
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 12), material);
  m.position.set(px, py, pz);
  m.rotation.x = rx;
  m.rotation.z = rz;
  m.castShadow = true;
  g.add(m);
  return m;
}

// ── hull factory — tapered sport fishing V-hull ───────────────────────────────
function addSportHull(
  g: THREE.Group,
  hullMat: THREE.Material,
  accentMat: THREE.Material,
  deckMat: THREE.Material,
  length: number,   // along X
  beam: number,     // along Z
  depth: number     // along Y
) {
  // main hull body
  const hullGeo = new THREE.BoxGeometry(length, depth, beam, 6, 1, 2);
  const pos = hullGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // taper bow: pinch Z as we go toward +X bow
    const bowStart = length * 0.3;
    if (x > bowStart) {
      const t = (x - bowStart) / (length * 0.5 - bowStart);
      pos.setZ(i, z * (1 - t * 0.92));
      pos.setY(i, y - t * depth * 0.18);
    }
    // V-hull: depress keel at centerline
    if (y < 0) {
      const zFrac = Math.abs(z) / (beam * 0.5);
      pos.setY(i, y - (1 - zFrac) * depth * 0.22);
    }
  }
  hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.castShadow = true;
  hull.receiveShadow = true;
  g.add(hull);

  // waterline stripe
  const stripeGeo = new THREE.BoxGeometry(length * 0.97, 0.04, beam + 0.02, 6, 1, 2);
  const sPos = stripeGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < sPos.count; i++) {
    const x = sPos.getX(i);
    const z = sPos.getZ(i);
    const bowStart = length * 0.3;
    if (x > bowStart) {
      const t = (x - bowStart) / (length * 0.5 - bowStart);
      sPos.setZ(i, z * (1 - t * 0.92));
    }
  }
  stripeGeo.computeVertexNormals();
  const stripe = new THREE.Mesh(stripeGeo, accentMat);
  stripe.position.y = depth * 0.12;
  g.add(stripe);

  // deck
  const deckGeo = new THREE.BoxGeometry(length * 0.93, 0.04, beam * 0.9, 6, 1, 2);
  const dPos = deckGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < dPos.count; i++) {
    const x = dPos.getX(i);
    const z = dPos.getZ(i);
    const bowStart = length * 0.28;
    if (x > bowStart) {
      const t = (x - bowStart) / (length * 0.5 - bowStart);
      dPos.setZ(i, z * (1 - t * 0.92));
    }
  }
  deckGeo.computeVertexNormals();
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = depth * 0.5 + 0.02;
  g.add(deck);
}

// ── center console geometry (shared, parameterized for 46 vs 63) ──────────────
function buildCenterConsole(
  scene: THREE.Scene,
  hullColor: number,
  accentColor: number,
  scale: number  // 1.0 = 46ft, 1.37 = 63ft
) {
    const g = new THREE.Group();
  void hullColor;
  void accentColor;
  new GLTFLoader().load("/models/cat80.glb", ({ scene: model }) => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    g.add(model);
  });
  g.rotation.y = Math.PI * 0.14;
  scene.add(g);
  return g;
}

// ── catamaran ─────────────────────────────────────────────────────────────────
function buildCatamaran(scene: THREE.Scene, hullColor: number, accentColor: number) {
  const g = new THREE.Group();
  void hullColor;
  void accentColor;
  new GLTFLoader().load("/models/cat80.glb", ({ scene: model }) => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    g.add(model);
  });
  g.rotation.y = Math.PI * 0.14;
  scene.add(g);
  return g;
}

// ── main export ───────────────────────────────────────────────────────────────
export default function BoatViewer({ buildType, hullColor, accentColor }: BoatViewerProps) {
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

    // Lighting — warm Gulf sun
    const ambient = new THREE.AmbientLight(0xd0e0f0, 0.75);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4dc, 2.4);
    sun.position.set(7, 10, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x6ab8e0, 0.65);
    fill.position.set(-5, 2, -3);
    scene.add(fill);

    const rimLight = new THREE.DirectionalLight(0xf0d090, 0.4);
    rimLight.position.set(1, -1, -6);
    scene.add(rimLight);

    // Ocean plane
    const waterGeo = new THREE.PlaneGeometry(20, 20, 28, 28);
    const wPos = waterGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < wPos.count; i++) {
      const x = wPos.getX(i), z = wPos.getZ(i);
      wPos.setZ(i, Math.sin(x * 0.8 + z * 0.6) * 0.045 + Math.cos(x * 1.2 + z * 0.4) * 0.03);
    }
    waterGeo.computeVertexNormals();
    const water = new THREE.Mesh(
      waterGeo,
      new THREE.MeshStandardMaterial({ color: 0x0a1f35, metalness: 0.2, roughness: 0.45, transparent: true, opacity: 0.88 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = buildType === "catamaran80" ? -0.38 : -0.26;
    water.receiveShadow = true;
    scene.add(water);

    const grid = new THREE.GridHelper(14, 14, 0x152840, 0x152840);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.18;
    grid.position.y = (buildType === "catamaran80" ? -0.38 : -0.26) + 0.01;
    scene.add(grid);

    // Build boat
    if (buildType === "centerConsole46") {
      buildCenterConsole(scene, hullColor, accentColor, 1.0);
    } else if (buildType === "centerConsole63") {
      buildCenterConsole(scene, hullColor, accentColor, 1.38);
    } else {
      buildCatamaran(scene, hullColor, accentColor);
    }

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
  }, [buildType, hullColor, accentColor]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

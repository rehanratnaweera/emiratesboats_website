import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

  const hullM   = mat(hullColor, 0.04, 0.7);
  const accentM = mat(accentColor, 0.5, 0.3);
  const deckM   = mat(0xf2ede5, 0.0, 0.85);
  const darkM   = mat(0x1a2530, 0.15, 0.6);
  const metalM  = mat(0xb8c4cc, 0.7, 0.3);
  const blackM  = mat(0x0d1318, 0.2, 0.5);

  const L = 4.2 * scale;
  const B = 1.45 * scale;
  const D = 0.52 * scale;

  addSportHull(g, hullM, accentM, deckM, L, B, D);

  // gunwale cap rails
  box(g, metalM, L * 0.88, 0.035, 0.04, -L * 0.01, D * 0.52, B * 0.47);
  box(g, metalM, L * 0.88, 0.035, 0.04, -L * 0.01, D * 0.52, -B * 0.47);

  // center console body
  const cy = D * 0.5 + 0.02;
  box(g, darkM, 0.55 * scale, 0.58 * scale, 0.8 * scale, 0.1 * scale, cy + 0.29 * scale);
  // windshield
  box(g, glassMat(), 0.06, 0.32 * scale, 0.72 * scale, 0.375 * scale, cy + 0.38 * scale);
  // electronics arch / screen cluster
  box(g, blackM, 0.08, 0.22 * scale, 0.5 * scale, 0.36 * scale, cy + 0.22 * scale);

  // T-top frame
  const ttY = cy + 0.58 * scale + 0.4 * scale;
  const ttW = 0.95 * scale;
  const ttL = 0.85 * scale;
  // four corner legs
  for (const [pz, px] of [
    [ttW / 2, ttL / 2], [ttW / 2, -ttL / 2],
    [-ttW / 2, ttL / 2], [-ttW / 2, -ttL / 2],
  ] as [number, number][]) {
    cyl(g, metalM, 0.022, 0.022, 0.4 * scale, px + 0.1 * scale, cy + 0.58 * scale + 0.18 * scale, pz);
  }
  // top surface
  box(g, darkM, ttL + 0.12 * scale, 0.06 * scale, ttW + 0.1 * scale, 0.1 * scale, ttY);
  // radar/electronics on top
  box(g, blackM, 0.28 * scale, 0.06 * scale, 0.22 * scale, 0.1 * scale, ttY + 0.06 * scale);
  // VHF antenna
  cyl(g, metalM, 0.01, 0.01, 0.45 * scale, 0.08 * scale, ttY + 0.28 * scale);

  // outriggers (long angled poles from T-top sides)
  for (const side of [1, -1]) {
    const outGeo = new THREE.CylinderGeometry(0.012, 0.008, 2.2 * scale, 8);
    const out = new THREE.Mesh(outGeo, metalM);
    out.position.set(0.1 * scale, ttY - 0.1 * scale, side * ttW * 0.5);
    out.rotation.x = side * Math.PI * 0.18;
    out.rotation.z = Math.PI * 0.15;
    g.add(out);
  }

  // outboard engines on transom
  const numEngines = scale > 1.2 ? 4 : 3;
  const engineSpacing = B * 0.26;
  const engineOffsets = numEngines === 3
    ? [0, engineSpacing, -engineSpacing]
    : [engineSpacing * 1.5, engineSpacing * 0.5, -engineSpacing * 0.5, -engineSpacing * 1.5];

  for (const pz of engineOffsets) {
    const ex = -L * 0.5 - 0.12;
    const ey = D * 0.05;
    // engine block
    box(g, darkM, 0.18, 0.45 * scale, 0.22 * scale, ex - 0.09, ey + 0.18 * scale, pz);
    // lower unit
    box(g, blackM, 0.1, 0.35 * scale, 0.12 * scale, ex - 0.09, ey - 0.12 * scale, pz);
    // prop
    cyl(g, metalM, 0.09 * scale, 0.09 * scale, 0.06, ex - 0.09, ey - 0.33 * scale, pz, 0, Math.PI / 2);
  }

  // rod holders (vertical tubes around gunwale)
  const rodPositions: [number, number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const rx = -L * 0.5 + 0.35 + i * 0.5 * scale;
    rodPositions.push([rx, D * 0.5 + 0.14, B * 0.46]);
    rodPositions.push([rx, D * 0.5 + 0.14, -B * 0.46]);
  }
  for (const [px, py, pz] of rodPositions) {
    cyl(g, metalM, 0.018, 0.018, 0.28, px, py, pz, 0.15 * Math.sign(pz));
  }

  // fish box / livewell in bow
  box(g, darkM, 0.7 * scale, 0.08, 0.5 * scale, L * 0.33, D * 0.5 + 0.06);
  // cooler / livewell aft
  box(g, darkM, 0.45 * scale, 0.16 * scale, 0.36 * scale, -L * 0.28, D * 0.5 + 0.1 * scale);

  // swim platform
  box(g, deckM, 0.42, 0.04, B * 0.7, -L * 0.5 - 0.21, D * 0.0);

  g.rotation.y = Math.PI * 0.18;
  scene.add(g);
  return g;
}

// ── catamaran ─────────────────────────────────────────────────────────────────
function buildCatamaran(scene: THREE.Scene, hullColor: number, accentColor: number) {
  const g = new THREE.Group();

  // carbon fiber hull — very dark with slight sheen
  const cfMat = new THREE.MeshStandardMaterial({
    color: 0x0d1215,
    metalness: 0.35,
    roughness: 0.28,
  });
  const accentM  = mat(accentColor, 0.55, 0.28);
  const superM   = mat(0xf0f2f4, 0.05, 0.65);
  const deckM    = mat(0xe8e0d0, 0.0, 0.85);
  const metalM   = mat(0xb0bcc8, 0.72, 0.28);
  const darkM    = mat(0x121a22, 0.2, 0.55);
  const glassM   = glassMat();

  const L   = 5.0;    // hull length
  const bw  = 0.52;   // hull beam (each)
  const hd  = 0.42;   // hull depth
  const sep = 1.55;   // centerline separation (hull-to-hull gap)

  // build each hull
  for (const side of [1, -1]) {
    const pz = side * sep * 0.5;
    const hullG = new THREE.Group();

    // hull body
    const hGeo = new THREE.BoxGeometry(L, hd, bw, 8, 1, 2);
    const pos = hGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (x > L * 0.2) {
        const t = (x - L * 0.2) / (L * 0.5 - L * 0.2);
        pos.setZ(i, z * (1 - t * 0.88));
        pos.setY(i, y - t * hd * 0.15);
      }
      // sharp V bottom
      if (y < 0) {
        const zFrac = Math.abs(z) / (bw * 0.5);
        pos.setY(i, y - (1 - zFrac) * hd * 0.32);
      }
    }
    hGeo.computeVertexNormals();
    const hull = new THREE.Mesh(hGeo, cfMat);
    hull.castShadow = true;
    hull.receiveShadow = true;
    hullG.add(hull);

    // accent stripe
    const sGeo = new THREE.BoxGeometry(L * 0.96, 0.038, bw + 0.01, 8, 1, 2);
    const sPos = sGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < sPos.count; i++) {
      const x = sPos.getX(i);
      const z = sPos.getZ(i);
      if (x > L * 0.2) {
        const t = (x - L * 0.2) / (L * 0.5 - L * 0.2);
        sPos.setZ(i, z * (1 - t * 0.88));
      }
    }
    sGeo.computeVertexNormals();
    const stripe = new THREE.Mesh(sGeo, accentM);
    stripe.position.y = hd * 0.1;
    hullG.add(stripe);

    hullG.position.z = pz;
    g.add(hullG);

    // daggerboard slot suggestion
    box(g, darkM, 0.1, hd * 0.55, 0.05, 0.2, -hd * 0.15, pz);
  }

  // bridge deck (connecting structure)
  const bdY = hd * 0.42;
  box(g, cfMat, L * 0.82, 0.1, sep - bw, -0.08, bdY);
  // deck surface
  box(g, deckM, L * 0.8, 0.04, sep + bw * 1.8, -0.08, bdY + 0.07);

  // main saloon / superstructure
  const sY = bdY + 0.12;
  box(g, superM, 2.4, 0.58, sep * 0.72, -0.15, sY + 0.31);
  // upper deck / flybridge
  box(g, superM, 1.7, 0.38, sep * 0.65, -0.1, sY + 0.88);
  // hardtop over flybridge
  box(g, cfMat, 1.8, 0.06, sep * 0.72, -0.1, sY + 1.12);

  // glazing — saloon
  box(g, glassM, 0.04, 0.44, sep * 0.68, 1.06, sY + 0.31);
  box(g, glassM, 2.38, 0.04, sep * 0.72, -0.15, sY + 0.54);
  // flybridge windshield
  box(g, glassM, 0.04, 0.3, sep * 0.6, 0.74, sY + 0.93);

  // solar panel array on hardtop
  box(g, new THREE.MeshStandardMaterial({ color: 0x0a1520, metalness: 0.2, roughness: 0.4 }),
    1.5, 0.02, sep * 0.62, -0.1, sY + 1.16);

  // mast
  cyl(g, metalM, 0.028, 0.022, 2.8, 0.6, sY + 2.5);
  box(g, metalM, 1.0, 0.025, 0.025, 0.1, sY + 3.9);
  // radar
  const radGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const rad = new THREE.Mesh(radGeo, metalM);
  rad.position.set(0.6, sY + 4.0, 0);
  g.add(rad);

  // trampoline net (between hulls, fore)
  box(g, new THREE.MeshStandardMaterial({ color: 0x1a2a1a, wireframe: true }),
    1.4, 0.01, sep - bw * 0.2, 1.55, bdY + 0.08);

  // transom crossbeam
  box(g, cfMat, 0.12, 0.28, sep + bw, -L * 0.45, hd * 0.1);

  // outdrives / engines
  for (const side of [1, -1]) {
    box(g, darkM, 0.18, 0.38, 0.24, -L * 0.5 - 0.09, hd * 0.0, side * sep * 0.5);
    cyl(g, metalM, 0.1, 0.1, 0.06, -L * 0.5 - 0.09, -hd * 0.3, side * sep * 0.5, 0, Math.PI / 2);
  }

  // railing along deck edges
  for (const side of [1, -1]) {
    const rzail = side * (sep * 0.5 + bw * 0.9);
    for (const px of [-1.8, -1.0, 0.0, 0.8, 1.5]) {
      cyl(g, metalM, 0.015, 0.015, 0.36, px, bdY + 0.28, rzail);
    }
    box(g, metalM, 3.5, 0.02, 0.01, -0.1, bdY + 0.46, rzail);
  }

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

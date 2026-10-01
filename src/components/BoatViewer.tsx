import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";

export type BoatMaterialColors = Record<string, number>;

export interface BoatModelEffect {
  id: string;
  type: "color" | "visibility" | "asset_variant";
  targetName: string;
  color?: number;
  visible?: boolean;
  assetUrl: string;
  assetMode: "overlay" | "replace";
  sort: number;
}

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

interface BoatViewerProps {
  modelUrl: string;
  materialColors: BoatMaterialColors;
  zoomFactor: number;
  effects?: BoatModelEffect[];
  onLoadProgress?: (progress: number) => void;
  onLoadError?: () => void;
}

function normalizeMaterialKey(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function getMaterialKey(name: string, materialColors: BoatMaterialColors): string | undefined {
  const normalized = name.toLowerCase().replace(/[\s_-]+/g, "");
  return Object.keys(materialColors)
    .sort((left, right) => normalizeMaterialKey(right).length - normalizeMaterialKey(left).length)
    .find((key) => normalized.includes(normalizeMaterialKey(key)));
}

function normalizedObjectName(value: string) {
  return value.trim().toLowerCase().replace(/\\/g, "/").replace(/\s+/g, " ");
}

function objectPath(root: THREE.Object3D, object: THREE.Object3D) {
  const names: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) names.unshift(current.name);
    if (current === root) break;
    current = current.parent;
  }
  return names.join("/");
}

function findModelTargets(root: THREE.Object3D, targetName: string) {
  const target = normalizedObjectName(targetName);
  if (!target) return [];
  const matches: THREE.Object3D[] = [];
  root.traverse((object) => {
    const candidate = target.includes("/") ? objectPath(root, object) : object.name;
    if (normalizedObjectName(candidate) === target) matches.push(object);
  });
  return matches;
}

function visitMaterials(object: THREE.Object3D, apply: (material: THREE.Material) => void) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(apply);
  });
}

const variantScenes = new Map<string, Promise<THREE.Object3D>>();

function loadVariantScene(url: string) {
  const cached = variantScenes.get(url);
  if (cached) return cached;

  const promise = new Promise<THREE.Object3D>((resolve, reject) => {
    gltfLoader.load(url, ({ scene }) => resolve(scene), undefined, reject);
  }).catch((error: unknown) => {
    variantScenes.delete(url);
    throw error;
  });
  variantScenes.set(url, promise);
  return promise;
}

function loadBoatModel(
  scene: THREE.Scene,
  modelUrl: string,
  materialColors: BoatMaterialColors,
  onLoaded: (model: THREE.Object3D) => void,
  onLoadProgress?: (progress: number) => void,
  onLoadError?: () => void
) {
  const g = new THREE.Group();
  if (!modelUrl) {
    scene.add(g);
    return g;
  }

  onLoadProgress?.(0);
  gltfLoader.load(modelUrl, ({ scene: model }) => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
        const materials = sourceMaterials.map((material) => material.clone());
        child.material = Array.isArray(child.material) ? materials : materials[0];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            const materialKey = getMaterialKey(`${child.name} ${material.name}`, materialColors);
            if (materialKey) material.color.setHex(materialColors[materialKey]);
          }
          if ("color" in material && material.color instanceof THREE.Color) {
            material.userData.configurationBaseColor = material.color.getHex();
          }
        });
      }
      child.userData.configurationBaseVisible = child.visible;
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
    onLoaded(g);
  }, (event) => {
    if (event.total > 0) onLoadProgress?.(Math.min((event.loaded / event.total) * 100, 99));
  }, (error) => {
    console.error(`Unable to load boat model: ${modelUrl}`, error);
    onLoadError?.();
  });
  g.rotation.y = Math.PI * 0.14;
  scene.add(g);
  return g;
}

// ── main export ───────────────────────────────────────────────────────────────
export default function BoatViewer({ modelUrl, materialColors, zoomFactor, effects = [], onLoadProgress, onLoadError }: BoatViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const baseModelRef = useRef<THREE.Object3D | null>(null);
  const variantHostRef = useRef<THREE.Group | null>(null);
  const effectsRef = useRef(effects);
  const generationRef = useRef(0);
  const variantRequestRef = useRef(0);

  const applyEffects = (activeEffects: BoatModelEffect[]) => {
    const baseModel = baseModelRef.current;
    const modelGroup = modelGroupRef.current;
    if (!baseModel || !modelGroup) return;

    const requestId = ++variantRequestRef.current;
    if (variantHostRef.current) modelGroup.remove(variantHostRef.current);
    const variantHost = new THREE.Group();
    variantHost.name = "Configuration Variants";
    modelGroup.add(variantHost);
    variantHostRef.current = variantHost;

    baseModel.traverse((object) => {
      if (typeof object.userData.configurationBaseVisible === "boolean") {
        object.visible = object.userData.configurationBaseVisible;
      }
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          const baseColor = material.userData.configurationBaseColor;
          if (typeof baseColor === "number" && "color" in material && material.color instanceof THREE.Color) {
            material.color.setHex(baseColor);
          }
        });
      }
    });

    activeEffects.forEach((effect) => {
      if (effect.type === "color" && effect.color !== undefined) {
        const targets = findModelTargets(baseModel, effect.targetName);
        const exactMaterialMatches: THREE.Material[] = [];
        baseModel.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (normalizedObjectName(material.name) === normalizedObjectName(effect.targetName)) exactMaterialMatches.push(material);
          });
        });
        if (exactMaterialMatches.length > 0) {
          exactMaterialMatches.forEach((material) => {
            if ("color" in material && material.color instanceof THREE.Color) material.color.setHex(effect.color!);
          });
        } else {
          targets.forEach((target) => visitMaterials(target, (material) => {
            if ("color" in material && material.color instanceof THREE.Color) material.color.setHex(effect.color!);
          }));
        }
      }

      if (effect.type === "visibility" && effect.visible !== undefined) {
        findModelTargets(baseModel, effect.targetName).forEach((target) => { target.visible = effect.visible!; });
      }

      if (effect.type === "asset_variant" && effect.assetUrl) {
        void loadVariantScene(effect.assetUrl).then((source) => {
          if (requestId !== variantRequestRef.current || modelGroupRef.current !== modelGroup) return;
          const variant = source.clone(true);
          const baseTransform = baseModel;
          variant.position.copy(baseTransform.position);
          variant.rotation.copy(baseTransform.rotation);
          variant.scale.copy(baseTransform.scale);
          variant.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });
          variantHost.add(variant);
          if (effect.assetMode === "replace") {
            findModelTargets(baseModel, effect.targetName).forEach((target) => { target.visible = false; });
          }
        }).catch((error: unknown) => {
          console.error(`Unable to load configuration asset: ${effect.assetUrl}`, error);
        });
      }
    });
  };

  useEffect(() => {
    effectsRef.current = effects;
    applyEffects(effects);
  }, [effects]);

  useEffect(() => {
    if (!mountRef.current) return;
    const generation = ++generationRef.current;
    const el = mountRef.current;
    const w = el.clientWidth;
    const h = el.clientHeight;

    const safeZoomFactor = Number.isFinite(zoomFactor) && zoomFactor > 0 ? zoomFactor : 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(window.devicePixelRatio);

    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(5.5 * safeZoomFactor, 3.2 * safeZoomFactor, 5.5 * safeZoomFactor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3 * safeZoomFactor;
    controls.maxDistance = 16 * safeZoomFactor;
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

    loadBoatModel(scene, modelUrl, materialColors, (model) => {
      if (generationRef.current !== generation) return;
      modelGroupRef.current = model as THREE.Group;
      baseModelRef.current = model.children[0] ?? null;
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const radius = Math.max(size.length() / 2, 0.1);
      camera.near = Math.max(radius / 100, 0.01);
      camera.far = Math.max(radius * 100, 100);
      camera.updateProjectionMatrix();
      controls.target.copy(center);
      controls.update();
      applyEffects(effectsRef.current);
      onLoadProgress?.(100);
    }, onLoadProgress, onLoadError);

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
      generationRef.current += 1;
      variantRequestRef.current += 1;
      modelGroupRef.current = null;
      baseModelRef.current = null;
      variantHostRef.current = null;
      cancelAnimationFrame(id);
      controls.dispose();
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [modelUrl, materialColors, zoomFactor, onLoadProgress, onLoadError]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

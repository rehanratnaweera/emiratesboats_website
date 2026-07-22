import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// 1. Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0, 2, 5);

// 2. Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 4. Draco & Boat Loader
let boat = null;

// Initialize DracoLoader and point to WebAssembly decoders on CDN
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');

// Initialize GLTFLoader and attach Draco decoder to it
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); // <-- Missing link added here!

loader.load(
  'models/63-cabin-short.glb', 
  function (gltf) {
    boat = gltf.scene;
    boat.scale.set(0.1, 0.1, 0.1);
    scene.add(boat);
    console.log('Draco-compressed boat loaded successfully!');
  }, 
  undefined, 
  function (error) {
    console.error('Error loading GLTF model:', error);
  }
);

// 5. Render Loop
function animate() {
  requestAnimationFrame(animate);

  if (boat) {
    boat.rotation.y += 0.003;
  }

  renderer.render(scene, camera);
}
animate();

// 6. Handle Window Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
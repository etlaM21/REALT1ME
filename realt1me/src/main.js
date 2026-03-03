import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Search } from 'astronomy-engine'; // We'll use this later!

// 1. Scene Setup
const scene = new THREE.Scene();

// 2. Camera Setup (Looking at the center)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

// 3. Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector('#app').appendChild(renderer.domElement);

// 4. Orbit Controls (Lets you drag to rotate the view)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- REALT1ME VISUAL GUIDES ---
// A central point representing Earth
const earthGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const earthMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Add standard X, Y, Z axes for reference (Red=X, Green=Y, Blue=Z)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);
// ------------------------------

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
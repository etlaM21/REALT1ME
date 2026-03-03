import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Astronomy from 'astronomy-engine';
import GUI from 'lil-gui';

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

// --- REALT1ME HANDS & ASTRONOMY MATH ---

const degToRad = (degrees) => degrees * (Math.PI / 180);
const origin = new THREE.Vector3(0, 0, 0);

// Create the arrows (We pass dummy directions at first; the math will overwrite them instantly)
const dummyDir = new THREE.Vector3(1, 0, 0);
const sunHand = new THREE.ArrowHelper(dummyDir, origin, 4, 0xffff00);   // Yellow
const earthHand = new THREE.ArrowHelper(dummyDir, origin, 3, 0x00aaff); // Blue
const moonHand = new THREE.ArrowHelper(dummyDir, origin, 2.5, 0xdddddd);// Gray

scene.add(sunHand);
scene.add(earthHand);
scene.add(moonHand);

// Helper function: Converts astronomical coordinates to our 3D space.
// We use the X-Z plane as our flat "Year" track. Y is "Up".
function eclipticToVector3(lonDeg, latDeg) {
    const lon = degToRad(lonDeg);
    const lat = degToRad(latDeg);
    
    const x = Math.cos(lat) * Math.cos(lon);
    const z = Math.cos(lat) * -Math.sin(lon); // -sin keeps the orbit counter-clockwise
    const y = Math.sin(lat);
    return new THREE.Vector3(x, y, z);
}

// Our "Time Machine" variable. We start exactly at the current real-world time!
let simulationDate = new Date();

function updateCelestialHands() {
    const astroTime = Astronomy.MakeTime(simulationDate);

    // 1. THE SUN (Year Hand)
    const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, astroTime, true);
    const sunEcl = Astronomy.Ecliptic(sunGeo);
    // The Sun stays perfectly flat on the Ecliptic plane
    sunHand.setDirection(eclipticToVector3(sunEcl.elon, sunEcl.elat));

    // 2. THE MOON (Moon Phase Hand)
    const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, true);
    const moonEcl = Astronomy.Ecliptic(moonGeo);
    // The Moon naturally follows its 5.1-degree tilted orbit!
    moonHand.setDirection(eclipticToVector3(moonEcl.elon, moonEcl.elat));

    // 3. THE EARTH (Day Hand / Equator)
    // Sidereal Time gives us the Earth's exact rotation angle relative to the stars
    const stHours = Astronomy.SiderealTime(astroTime);
    const earthRotationDegrees = stHours * 15; // The Earth rotates 15 degrees every hour
    
    // The Equator is permanently tilted 23.44 degrees from the Ecliptic plane.
    // We calculate the flat rotation first, then apply that permanent tilt!
    const earthVec = new THREE.Vector3(
        Math.cos(degToRad(earthRotationDegrees)), 
        0, 
        -Math.sin(degToRad(earthRotationDegrees))
    );
    earthVec.applyAxisAngle(new THREE.Vector3(1, 0, 0), degToRad(-23.44));
    
    earthHand.setDirection(earthVec.normalize());
}

// ---------------------------------------

// --- UI CONTROLS (LIL-GUI) ---

// We need a clock to calculate true real-time seconds between frames
const clock = new THREE.Clock();

const timeConfig = {
    // We'll use a slider from 0 to 100. We will map this non-linearly 
    // so you have fine control over slow speeds, but can still zoom to 1 month/12s.
    speedSlider: 100, 
    currentLabel: 'Initializing...'
};

const gui = new GUI({ title: 'REALT1ME Controls' });

// Add the slider
gui.add(timeConfig, 'speedSlider', 0, 100, 0.1)
   .name('Speed')
   .onChange(updateSpeedLabel);

// Add the text label (disable it so it's read-only)
const labelController = gui.add(timeConfig, 'currentLabel').name('Pace').disable();

// This function calculates how many minutes to add per frame, 
// and generates the human-readable text!
function updateSpeedLabel() {
    let text = "";
    
    if (timeConfig.speedSlider === 0) {
        text = "Paused";
    } else if (timeConfig.speedSlider <= 1) {
        text = "Realtime";
    } else {
        // Map 1-100 exponentially to 0-60 minutes per frame.
        // This makes the slider feel smooth at both slow and fast speeds.
        const normalized = (timeConfig.speedSlider - 1) / 99; 
        const minutesPerFrame = Math.pow(normalized, 3) * 60; 
        
        // At 60 frames per second, how much time passes in 1 real second?
        const minutesPerSecond = minutesPerFrame * 60;

        if (minutesPerSecond < 60) {
            text = `${Math.round(minutesPerSecond)} mins / sec`;
        } else if (minutesPerSecond < 1440) { // 1440 mins in a day
            text = `${(minutesPerSecond / 60).toFixed(1)} hours / sec`;
        } else {
            const daysPerSec = minutesPerSecond / 1440;
            text = `${daysPerSec.toFixed(1)} days / sec`;
            
            // Add your specific requested milestone!
            if (daysPerSec > 2.4 && daysPerSec < 2.6) {
                text += " (~1 Month / 12s)";
            }
        }
    }
    
    // Update the UI panel text
    timeConfig.currentLabel = text;
    labelController.updateDisplay();
}

// Run once to set the initial label
updateSpeedLabel();
// -----------------------------

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
    
    // Get the time passed since the last frame (usually ~0.016 seconds)
    const delta = clock.getDelta();

    if (timeConfig.speedSlider === 0) {
        // Paused! Do nothing.
    } else if (timeConfig.speedSlider <= 1) {
        // REALTIME: Add true elapsed milliseconds to the simulation date
        simulationDate.setTime(simulationDate.getTime() + (delta * 1000));
    } else {
        // FAST FORWARD: Calculate minutes based on our exponential slider
        const normalized = (timeConfig.speedSlider - 1) / 99;
        const minutesPerFrame = Math.pow(normalized, 3) * 60;
        
        // FIX: Convert the tiny fractional minutes into raw milliseconds!
        const msPerFrame = minutesPerFrame * 60 * 1000;
        simulationDate.setTime(simulationDate.getTime() + msPerFrame);
    }
    
    updateCelestialHands();
    
    renderer.render(scene, camera);
}

animate()
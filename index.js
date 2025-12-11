import * as THREE from "three";
import { Group } from '@tweenjs/tween.js';
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { TeapotGeometry } from "three/examples/jsm/Addons.js";
import { label } from "three/tsl";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
THREE.Cache.enabled = true; // Ensures that the song uploading feature works.
import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'

// Stats
const stats = Stats()
document.body.appendChild(stats.dom)


// Render and Preprocessing //////////
// Initializes trivial things like the renderer and the like.
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

let gui = new GUI();
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({ antialias: false });
let camera = new THREE.PerspectiveCamera(
    75, // FoV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near
    1000 // Far
);
initializeScene();
initializeRenderer();
initializeCamera();

/**
 * Automatically resizes the window.
 */
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    labelRenderer.setSize(300, 200);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * Sets up the renderer.
 */
function initializeRenderer() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor("#000000");
}

// Interaction //////////
// HTML & CSS integration for uploading audio locally and audio playback controls.
/////////////////////////
/////////////////////////
/////////////////////////
const labelRenderer = new CSS2DRenderer();
initializeUserLabel();
function initializeUserLabel(){
    labelRenderer.setSize(300, 200);
    // console.log(labelRenderer.getSize());
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "calc(100vh - 200px)";
    labelRenderer.domElement.style.color = "#ffffff";
    // labelRenderer.domElement.style.zIndex = "-1";
    // labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(labelRenderer.domElement);
}

/**
 * Sets up the upload button.
 */
let input, cPointLabel, audInput, aPointLabel, souInput;
initializeUploadButton();
function initializeUploadButton() {
    input = document.createElement("input");
    input.id = "upload";
    input.type = "file";
    input.accept = ".mp3,audio/*";
    input.style.top = "calc(2em)";
    input.style.left = "calc(0em)";
    cPointLabel = new CSS2DObject(input);
    cPointLabel.position.set(0, 0, 0);
    scene.add(cPointLabel);

    audInput = document.createElement("audio");
    audInput.id = "audio";
    souInput = document.createElement("source");
    souInput.src = "";
    souInput.id = "src";
    audInput.appendChild(souInput);
    aPointLabel = new CSS2DObject(audInput);
    aPointLabel.position.set(0, 0, 0);
    scene.add(aPointLabel);
}

/**
 * Sets up the play button.
 */
let playButtonLabel;
initializePlayButton();
function initializePlayButton(){
    let playButton = document.createElement("button");
    playButton.id = "play";
    playButton.innerHTML = "Play";
    playButton.style.position = "absolute";
    playButton.style.top = "calc(0em)";
    playButton.style.left = "calc(0em)";
    playButton.style.zIndex = "-1";
    playButton.onclick = playAudio;
    document.body.appendChild(playButton);
    playButtonLabel = new CSS2DObject(playButton);
    playButtonLabel.position.set(0, 0, 0);
    scene.add(playButtonLabel);
}

/**
 * Sets up the pause button.
 */
let pauseButtonLabel;
initializePauseButton();
function initializePauseButton(){
    let pauseButton = document.createElement("button");
    pauseButton.id = "pause";
    pauseButton.innerHTML = "Pause";
    pauseButton.style.position = "absolute";
    pauseButton.style.top = "calc(-2em)";
    pauseButton.style.left = "calc(0em)";
    pauseButton.style.zIndex = "-1";
    pauseButton.onclick = pauseAudio;
    document.body.appendChild(pauseButton);
    pauseButtonLabel = new CSS2DObject(pauseButton);
    pauseButtonLabel.position.set(0, 0, 0);
    scene.add(pauseButtonLabel);
}

function handleFiles(event) {
    var files = event.target.files;
    souInput.src = URL.createObjectURL(files[0]);
    initializeSound(souInput.src);
}
input.addEventListener("change", handleFiles, false);

// Audio //////////
// Setting up the audio to play.
///////////////////
///////////////////
///////////////////
let listener = new THREE.AudioListener();
let audioLoader = new THREE.AudioLoader();
let sound = new THREE.Audio(listener);
let analyser = new THREE.AudioAnalyser(sound, 2048);
initializeSound("../sounds/bbkkbkk.mp3");
camera.add(listener);
let playing = false;
function initializeSound(file) {
    console.log(file);
    audioLoader.parse

    audioLoader.load(file, function (buffer) {
        sound.setBuffer(buffer);
        sound.autoplay = false;
        sound.setLoop(false);
        sound.setVolume(1);
        sound.stop();
        // window.addEventListener("click", function () {
        //     // sound.stop();
        //     sound.play();
        //     playing = true;
        // });
    },
        function (xhr) {
            sound.stop();
            playing = false;
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.log(err + "failed to load.");
        }
    );
    
}

/**
 * Function for playing audio used by user-intractable buttons.
 */
function playAudio() {
    if (!playing) {
        sound.play();
        playing = true;
    }
}
/**
 * Function for not playing audio used by user-intractable buttons.
 */
function pauseAudio() {
    if (playing) {
        sound.pause();
        playing = false;
    }
}

// Scene and Background //////////
// These functions pertain to static elements in the program.
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

/**
 * Initializes the scene.
 */
function initializeScene() {
    scene.fog = new THREE.FogExp2(0x000000, 0.005);
}

/**
 * Initializes the camera.
 */
function initializeCamera() {
    camera.position.set(0, -50, 0);
    camera.rotation.x = rad(90);
    camera.rotation.y = rad(0);
    camera.rotation.z = rad(0);
}

/**
 * Move around the view with the mouse. Reset by double clicking.
 */
const controls = new OrbitControls(camera, renderer.domElement);
window.addEventListener('dblclick', function () {
    controls.reset();
});


/**
 * Initializes the floor.
 */
let plane;
initializePlane();
function initializePlane() {
    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 10000, 1, 1),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: false
        })
    );
    plane.receiveShadow = true;
    scene.add(plane);
    plane.position.z = -10;
}

// Audio Analyizer //////////
// The star(s) of the show, these pertain to the extened functionality of audio analysis!
/////////////////////////////
/////////////////////////////
/////////////////////////////
class AudioAnalyserEX {
    data;
    avg;
    freq;
    id;
    
    boostActivate = false;
    freqPre = []; // Previous frequency data list is used for more-accurate peak detection across several frames...
    freqPreMax = 15; // ...but a cap of the length is set so as to not undermine repeated peaks.
    // This length determines on an optional user-defined variable set in the GUI.

    boostTime = 0;
    boostActivateTime = 0;
    boostCumulative = 0;
    boostInetrpolate = 0;
    boostCurrent = 0;
    boostIntensity = 0; // Used for the burst particles to determine how fast they go and how plentiful they are.
    constructor(id) {
        this.id = id;
    }

    /**
     * Not tied to a specific instance of AudioAnalyserEX,
     * this is a more-streamlined, natural approach to detecting peaks.
     * This works very well for tracking general volume,
     * but making certain frequencies act more dynamically requires some more finesse...!
     */
    static yolo(freqNew){
        return ((freqNew / 255 * 2) ** 3) / 8; 
    }

    /**
     * Where a good amount of the magic happens! 
     * Allows objects to activate a parameterized "boost" if a certain frequency band(s) peaks in volume.
     * 
     * Each instance of an AudioAnalyserEX should specialize in a specific range of freuqency bands.
     * It takes this and compares it to recently-stored freqncy bands of previous frames to see if
     * 1. this frame's bands are louder than the average by some threshold
     * 2. exceed a minimum volume
     * 3. a given cooldown is not active.
     * If so, it activates a "boost" of a given amount for a given amount of length and a sets a cooldown of a given length.
     * Multiple boosts can occur simutaneously, but the boost length does not stack.
     */
    freqBoost(freqNew, dt, hreshThold, boostAmount, boostLength, boostActivateLength, volumeThresh) {
        this.freqPreLen = Math.round(60 / (scene.userData.userDefinedBPM / (1000 / dt))); // This allows it to be less influenced by framerate!
        var tEX = 0;
        freqNew /= 255; // Makes every frequency band out of 1.
        if (!analyser) return 0;
        const avg = truncateAvg(this.freqPre, 0, Math.min(this.freqPre.length, this.freqPreMax));

        if ((freqNew > (avg + hreshThold))
            && !this.boostActivate
            && (freqNew > volumeThresh)
        ) {
            this.boostActivate = true;
            this.boostCumulative += boostAmount;
            this.boostCurrent = this.boostInetrpolate;
            this.boostTime = 0;
            this.boostActivateTime = 0;
            this.boostIntensity = (freqNew - avg) * freqNew;
            console.log("BOOST!", this.id, freqNew, this.boostIntensity);
        }
        if (this.boostActivate) {
            this.boostActivateTime += dt / 1000;
            if (this.boostActivateTime > boostActivateLength) {
                this.boostActivate = false;
            }
        }
        this.boostTime += (dt / 1000) / boostLength;
        if (this.boostTime > 1) {
            this.boostTime = 1;
        }

        this.boostInetrpolate = lerp(this.boostCurrent, this.boostCumulative, this.boostTime);

        tEX = this.boostCumulative - this.boostInetrpolate;
        this.freqPre.push(freqNew);
        while (this.freqPre.length > this.freqPreLen) this.freqPre.shift();

        return tEX;
    }
}

/**
 * A companion class for the extended audio analysis used to initialize GUI down the line.
 */
class aaEXparam {
    id;
    startFreqency;
    endFreqency;
    minVolumeDifference;
    boostAmount;
    boostLength;
    boostCooldown;
    minVolume;
    constructor(id, a, b, c, d, e, f, g) {
        this.id = id;
        this.startFreqency = f;
        this.endFreqency = g;
        this.minVolumeDifference = a;
        this.boostAmount = b;
        this.boostLength = c;
        this.boostCooldown = d;
        this.minVolume = e;
    }
}

// Object //////////
// These functions pertain to the floating object, including movement and applying audio analysis.
////////////////////

/**
 * Initializes the object that floats along the curve.
 */
let object2;
initializeObject2();
function initializeObject2() {

    //Adding a particle system to the object
    const object2_particles = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }
    object2_particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const object2_particles_material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff
    });
    const object2_particleSystem = new THREE.Points(object2_particles, object2_particles_material);
    // scene.add(object2_particleSystem);

    object2 = new THREE.Mesh(
        // new THREE.TorusGeometry(5, 2, 12, 48, rad(360)),
        new THREE.IcosahedronGeometry(10, 1),
        // new THREE.ShaderMaterial({
        //     vertexShader: document.getElementById("vertexShader").textContent,
        //     fragmentShader: document.getElementById("fragmentShader").textContent
        // })
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: false
        })
    );
    object2.material.wireframe = true;
    object2.castShadow = true;
    object2.receiveShadow = true;
    scene.add(object2);
    object2.position.set(0.0, 0.0, 10.0);
    object2.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 0.0, 0.0).normalize(), rad(90)));
    object2.t = 0;

    // Sync the particle system with the object.
    object2_particleSystem.position.copy(object2.position);
    object2_particleSystem.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 0.0, 0.0).normalize(), rad(90)));
}

/**
 * Creates a burst particle system for object2 that emits on audio kicks
 */
function createObject2BurstParticles() {
    const burstCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(burstCount * 3);
    const velocities = [];
    
    // Initialize all particles at object2's position
    for (let i = 0; i < burstCount; i++) {
        positions[i * 3] = object2.position.x;
        positions[i * 3 + 1] = object2.position.y;
        positions[i * 3 + 2] = object2.position.z;
        
        // Random outward velocities
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.1 + Math.random() * 0.2; // Variable speed
        
        velocities.push({
            x: Math.sin(phi) * Math.cos(theta) * speed,
            y: Math.sin(phi) * Math.sin(theta) * speed,
            z: Math.cos(phi) * speed,
            life: 0, // Start dead
            active: false
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.2,
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
    });
    
    const burstSystem = new THREE.Points(geometry, material);
    scene.add(burstSystem);
    
    return { mesh: burstSystem, velocities: velocities, nextParticleIndex: 0 };
}

/**
 * Triggers a burst of particles from object2's current position.
 */
function triggerObject2Burst(burstSystem, intensity = 1.0) {
    const particlesPerBurst = Math.floor(20 * intensity); // More particles for stronger kicks
    
    for (let i = 0; i < particlesPerBurst; i++) {
        const idx = burstSystem.nextParticleIndex;
        const vel = burstSystem.velocities[idx];

        const y = 1 - (Math.random() * 2);
        const r = Math.sqrt(1 - (y * y)) * 5; // Radius of the burst's origin.
        const longitude = (1 - (Math.random() * 2)) * 180;
        const inside = Math.pow(Math.random(), (1 / 3));
        const insideFinal = [r * Math.sin(rad(longitude)) * inside, y * inside, r * Math.cos(rad(longitude)) * inside];
        
        // Reset particle at object2's current position
        const positions = burstSystem.mesh.geometry.attributes.position.array;
        positions[idx * 3] = object2.position.x + insideFinal[0];
        positions[idx * 3 + 1] = object2.position.y + insideFinal[1];
        positions[idx * 3 + 2] = object2.position.z + insideFinal[2];
        
        // Generate new random direction
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = (0.1 + Math.random() * 0.1) * intensity;
        
        vel.x = Math.sin(phi) * Math.cos(theta) * speed;
        vel.y = Math.sin(phi) * Math.sin(theta) * speed;
        vel.z = Math.cos(phi) * speed;
        vel.life = 1.0;
        vel.active = true;
        
        burstSystem.nextParticleIndex = (burstSystem.nextParticleIndex + 1) % burstSystem.velocities.length;
    }
    
    burstSystem.mesh.geometry.attributes.position.needsUpdate = true;
}

/**
 * Updates the burst particle system each frame
 */
function updateObject2BurstParticles(burstSystem, deltaTime) {
    const positions = burstSystem.mesh.geometry.attributes.position.array;
    let activeCount = 0;
    
    for (let i = 0; i < burstSystem.velocities.length; i++) {
        const vel = burstSystem.velocities[i];
        
        if (vel.active && vel.life > 0) {
            // Update position
            positions[i * 3] += vel.x * deltaTime * 0.1;
            positions[i * 3 + 1] += vel.y * deltaTime * 0.1;
            positions[i * 3 + 2] += vel.z * deltaTime * 0.1;
            
            // Apply gravity/drag
            vel.z -= (0.1 * (deltaTime / 1000));
            vel.x *= (1.0 - (1.0 * (deltaTime / 10000)));
            vel.y *= (1.0 - (1.0 * (deltaTime / 10000)));
            
            // Decrease lifetime
            vel.life -= (deltaTime / 3000);
            
            if (vel.life <= 0) {
                vel.active = false;
            } else {
                activeCount++;
            }
        }
    }
    
    burstSystem.mesh.geometry.attributes.position.needsUpdate = true;
    
    // Adjust overall opacity based on active particles
    if (activeCount > 0) {
        burstSystem.mesh.material.opacity = Math.min(1.0, activeCount / 50);
    } else {
        burstSystem.mesh.material.opacity = 0;
    }
}

let object2BurstSystem;
object2BurstSystem = createObject2BurstParticles();

// initalizing particle t

/**
 * The path the shape moves along as keyframe data is defined here.
 */
var groupObjectAnimateMusicType2 = new Group();
const keyframesObjAnimateMusicType2 = [
    [-5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [-5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [0.0, 0.0, -10.0, 1.0, 1.0, -1.0, 30.0]
];

/**
 * Initializes GUI for the Object audio analysis parameters.
 */
let kickParam = new aaEXparam("kick", 0.05, 0.25, 0.2, 0.1, 0.6, 8, 18);
let bassParam = new aaEXparam("bass", 0.03, 5, 0.25, 0.1, 0.5, 18, 40);
// Optional, user-defined BPM value.
// Only used in determining the length of the previous frequency array.
// Matching this value with the song BPM can make peaks easier to identify!
scene.userData.userDefinedBPM = 200;

let kickDetec, bassDetec, optiDetec;
initializeObjectGUI();
function initializeObjectGUI() {
    kickDetec = gui.addFolder('Kick Detection ~ Object Burst');
    kickDetec.add(kickParam, 'startFreqency', 2, 18);
    kickDetec.add(kickParam, 'endFreqency', 8, 40);
    kickDetec.add(kickParam, 'minVolumeDifference', 0, 0.1);
    kickDetec.add(kickParam, 'boostAmount', 0, 10);
    kickDetec.add(kickParam, 'boostLength', 0, 2.0);
    kickDetec.add(kickParam, 'boostCooldown', 0, 0.25);
    kickDetec.add(kickParam, 'minVolume', 0, 0.9);
    kickDetec.open();
    bassDetec = gui.addFolder('Bass Detection ~ Object Spin');
    bassDetec.add(bassParam, 'startFreqency', 8, 40);
    bassDetec.add(bassParam, 'endFreqency', 18, 80);
    bassDetec.add(bassParam, 'minVolumeDifference', 0, 0.1);
    bassDetec.add(bassParam, 'boostAmount', 0, 10);
    bassDetec.add(bassParam, 'boostLength', 0, 2.0);
    bassDetec.add(bassParam, 'boostCooldown', 0, 0.25);
    bassDetec.add(bassParam, 'minVolume', 0, 0.9);
    bassDetec.open();   
    optiDetec = gui.addFolder('Optional ~ For Easier Peak Detection');
    optiDetec.add(scene.userData, 'userDefinedBPM', 60, 400);
    optiDetec.open();
}

/**
 * The animation function for the object.
 */
function animateMusicType2(object, thisKeyframes, alph, time, preTime) {
    const avg = truncateAvg(data, 0, 1024);
    const delta_time = time - preTime;

    object.rotation.x += rad(0.5) + rad(AudioAnalyserBass.freqBoost(AudioAnalyserBass.freq, delta_time, bassParam.minVolumeDifference, bassParam.boostAmount, bassParam.boostLength, bassParam.boostCooldown, bassParam.minVolume));
    const butHeresTheScaler = AudioAnalyserKick.freqBoost(AudioAnalyserKick.freq, delta_time, kickParam.minVolumeDifference, kickParam.boostAmount, kickParam.boostLength, kickParam.boostCooldown, kickParam.minVolume);
    object.scale.x = 1 + butHeresTheScaler;
    object.scale.y = 1 + butHeresTheScaler;
    object.scale.z = 1 + butHeresTheScaler;

    var keyframesParse = new Array();
    for (let i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Vector3(thisKeyframes[i][0], thisKeyframes[i][2], thisKeyframes[i][1]));
    }
    // console.log(object.t);
    object.t += (delta_time / 1000 * 0.1) + ((AudioAnalyserEX.yolo(avg * 2)) * (delta_time / 1000) * 0.4);
    object.t %= 1;
    object.position.copy(catmullRomLoop(keyframesParse, object.t, alph));
}

/**
 * Implementation of the Catmull Rom curve that the shape moves along the path of.
 */
function catmullRomLoop(keyframesParse, t, alph) {

    var prog = 1 + t * (keyframesParse.length);
    var selectedKey = Math.floor(prog);
    var midKey = prog - selectedKey;

    var p0 = keyframesParse.at((selectedKey - 1) % keyframesParse.length);
    var p1 = keyframesParse.at((selectedKey + 0) % keyframesParse.length);
    var p2 = keyframesParse.at((selectedKey + 1) % keyframesParse.length);
    var p3 = keyframesParse.at((selectedKey + 2) % keyframesParse.length);

    var t01 = Math.max(Math.pow(p0.distanceTo(p1), alph), 0.0000001);
    var t12 = Math.max(Math.pow(p1.distanceTo(p2), alph), 0.0000001);
    var t23 = Math.max(Math.pow(p2.distanceTo(p3), alph), 0.0000001);

    var m1x = p2.x - p1.x + t12 * ((p1.x - p0.x) / t01 - (p2.x - p0.x) / (t01 + t12));
    var m1y = p2.y - p1.y + t12 * ((p1.y - p0.y) / t01 - (p2.y - p0.y) / (t01 + t12));
    var m1z = p2.z - p1.z + t12 * ((p1.z - p0.z) / t01 - (p2.z - p0.z) / (t01 + t12));

    var m2x = p2.x - p1.x + t12 * ((p3.x - p2.x) / t23 - (p3.x - p1.x) / (t12 + t23));
    var m2y = p2.y - p1.y + t12 * ((p3.y - p2.y) / t23 - (p3.y - p1.y) / (t12 + t23));
    var m2z = p2.z - p1.z + t12 * ((p3.z - p2.z) / t23 - (p3.z - p1.z) / (t12 + t23));

    var ax = 2 * p1.x - 2 * p2.x + m1x + m2x;
    var ay = 2 * p1.y - 2 * p2.y + m1y + m2y;
    var az = 2 * p1.z - 2 * p2.z + m1z + m2z;

    var bx = -3 * p1.x + 3 * p2.x - 2 * m1x - m2x;
    var by = -3 * p1.y + 3 * p2.y - 2 * m1y - m2y;
    var bz = -3 * p1.z + 3 * p2.z - 2 * m1z - m2z;

    var cx = m1x;
    var cy = m1y;
    var cz = m1z;

    var dx = p1.x;
    var dy = p1.y;
    var dz = p1.z;

    const px = ax * midKey * midKey * midKey + bx * midKey * midKey + cx * midKey + dx;
    const py = ay * midKey * midKey * midKey + by * midKey * midKey + cy * midKey + dy;
    const pz = az * midKey * midKey * midKey + bz * midKey * midKey + cz * midKey + dz;

    return new THREE.Vector3(px, py, pz);
}

// Lights //////////
// This functions pertain to the lights.
////////////////////
////////////////////
////////////////////
let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.25);
let spotLight1 = new THREE.SpotLight(0xff8000, 5, 0, rad(-30), 1, 0);
let spotLight2 = new THREE.SpotLight(0x0080ff, 1, 0, rad(10), 1, 0);
initializeLights();
function initializeLights() {
    scene.add(ambientLight1);
    spotLight1.position.set(0, -50, 0);
    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.set(1024, 1024);
    spotLight1.shadow.camera.near = 0.1;
    spotLight1.shadow.camera.far = 1000;
    scene.add(spotLight1);

    spotLight2.position.set(0, 0, 100);
    spotLight2.castShadow = true;
    spotLight2.shadow.mapSize.set(1024, 1024);
    spotLight2.shadow.camera.near = 0.1;
    spotLight2.shadow.camera.far = 1000;
    scene.add(spotLight2);
    spotLight2.target = object2;
    scene.add(spotLight2.target);
}

// Animation Loop //////////
// It's time to play the music; It's time to light the lights...
/////////////////////////////
/////////////////////////////
/////////////////////////////

/**
 * The animation loop that updates each frame.
 * Includes a handy time variable that is frame-independent for smoother animation.
 */
let dt = 0;
let preTime = 0;
let data = analyser.getFrequencyData(); // Bands of frequencies.
let avg = analyser.getAverageFrequency(); // General volume.
let AudioAnalyserKick = new AudioAnalyserEX("Kick!");
let AudioAnalyserBass = new AudioAnalyserEX("Bass!");
let sub, kick, bass, midL, mid, midH, high, vhigh;

function animate(time) {
    // requestAnimationFrame(function loop(time) {
    //     requestAnimationFrame(loop);
    // }); // THIS IS BUILDS TOWARDS A MAJOR PERFORMANCE DECREASE, IT TURNS OUT!
    dt = time - preTime;
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);

    data = analyser.getFrequencyData();
    avg = analyser.getAverageFrequency();
    sub = truncateAvg(data, 2, 8);
    kick = truncateAvg(data, 8, 18);
    bass = truncateAvg(data, 18, 40);
    midL = truncateAvg(data, 40, 80);
    mid = truncateAvg(data, 80, 160);
    midH = truncateAvg(data, 160, 320);
    high = truncateAvg(data, 320, 600);
    vhigh = truncateAvg(data, 600, 1000);

    AudioAnalyserKick.freq = kick;
    AudioAnalyserBass.freq = bass;

    animateMusicType2(object2, keyframesObjAnimateMusicType2, 0, time, preTime);
    // spotLight2.intensity = 1
    // spotLight1.intensity = 5

    if (object2BurstSystem) {
        updateObject2BurstParticles(object2BurstSystem, dt);

        if (AudioAnalyserKick.boostActivate) {
            const particleIntensity = AudioAnalyserKick.boostIntensity * 50;
            // console.log(intensity);
            triggerObject2Burst(object2BurstSystem, particleIntensity);
        }
    }

    if (playing){
        ambientLight1.intensity = AudioAnalyserEX.yolo(midH * 1.25) * 0.5;
        spotLight1.intensity = AudioAnalyserEX.yolo(mid) * 5 * 2;
        spotLight2.intensity = AudioAnalyserEX.yolo(midL) * 2 * 2;
    }
    else{
        ambientLight1.intensity = 0.25;
        spotLight1.intensity = 5 * 2;
        spotLight2.intensity = 1 * 2;
    }

    // // NOTE TO SELF, performance.now() is pretty much the same as time here, but global!
    preTime = time;
}

// Miscellaneous //////////
// These don't quite fit into any catagory. Usually helper functions.
///////////////////////////
///////////////////////////
///////////////////////////

/**
 * Helper "averaging of an array" function.
 * @returns The average value of an array from index i to index k (exclusive).
 */
function truncateAvg(dataer, i, k) {
    if ((k - i) == 0) return dataer[i];
    var j = 0;
    var l = 0;

    for (i; i < k; i++) {
        j += dataer[i];
        l += 1;
    }
    return j / l;
}

/**
 * Helper Linear intERPolation function.
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Helper degrees to radians function.
 */
function rad(x) {
    return x / 180 * Math.PI;
}
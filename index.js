import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Group } from '@tweenjs/tween.js';
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { TeapotGeometry } from "three/examples/jsm/Addons.js";
import { label } from "three/tsl";
THREE.Cache.enabled = true; // Ensures that the song uploading feature works.

let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({ antialias: false });
let camera = new THREE.PerspectiveCamera(
    75, // FoV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near
    1000 // Far
);
initalizeScene();
initalizeRenderer();
initalizeCamera();

// HTML INTEGRATION
const labelRenderer = new CSS2DRenderer();
let input, cPointLabel, audInput, aPointLabel, souInput;
initalizeUploadFileLabel();
initalizePlayButton();
initalizePauseButton();

// Upload file input
function initalizeUploadFileLabel() {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.color = "#ffffff";
    // labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(labelRenderer.domElement);

    input = document.createElement("input");
    input.id = "upload";
    input.type = "file";
    input.accept = ".mp3,audio/*";
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

// Button functionality
function playAudio() {
    if (!playing) {
        sound.play();
        playing = true;
    }
}

function pauseAudio() {
    if (playing) {
        sound.pause();
        playing = false;
    }
}

let playButtonLabel;
function initalizePlayButton(){
    let playButton = document.createElement("button");
    playButton.id = "play";
    playButton.innerHTML = "Play";
    playButton.style.position = "absolute";
    playButton.style.top = "10px";
    playButton.style.left = "10px";
    playButton.style.zIndex = "1";
    playButton.onclick = playAudio;
    document.body.appendChild(playButton);
    playButtonLabel = new CSS2DObject(playButton);
    playButtonLabel.position.set(0, 0, 0);
    scene.add(playButtonLabel);
}

let pauseButtonLabel;
function initalizePauseButton(){
    let pauseButton = document.createElement("button");
    pauseButton.id = "pause";
    pauseButton.innerHTML = "Pause";
    pauseButton.style.position = "absolute";
    pauseButton.style.top = "10px";
    pauseButton.style.left = "10px";
    pauseButton.style.zIndex = "1";
    pauseButton.onclick = pauseAudio;
    document.body.appendChild(pauseButton);
    pauseButtonLabel = new CSS2DObject(pauseButton);
    pauseButtonLabel.position.set(0, 0, 0);
    scene.add(pauseButtonLabel);
}




function handleFiles(event) {
    var files = event.target.files;
    souInput.src = URL.createObjectURL(files[0]);
    initalizeSound(souInput.src);
}
input.addEventListener("change", handleFiles, false);

// AUDIO
let listener = new THREE.AudioListener();
let audioLoader = new THREE.AudioLoader();
let sound = new THREE.Audio(listener);
let analyser = new THREE.AudioAnalyser(sound, 2048);
initalizeSound("../sounds/CyclicUniverseTheory.mp3");
camera.add(listener);
let playing = false;
function initalizeSound(file) {
    console.log(file);
    audioLoader.parse

    audioLoader.load(file, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1);
        window.addEventListener("click", function () {
            // sound.stop();
            sound.play();
            playing = true;
        });
    },
        function (xhr) {
            sound.stop();
            playing = false;
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            // console.log(err + "did not load!");
        }
    );
}

// Automatically resizes the window.
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// SCENE
function initalizeScene() {
    scene.fog = new THREE.FogExp2(0x000000, 0.005);
}

// RENDERER SETUP
function initalizeRenderer() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor("#000000");
}

// CAMERA
function initalizeCamera() {
    camera.position.set(0, -50, 0);
    camera.rotation.x = rad(90);
    camera.rotation.y = rad(0);
    camera.rotation.z = rad(0);
}

// OBJECT(s) of interest
let object2;
initalizeObject2();
function initalizeObject2() {

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
}

// FLOOR
let plane;
initalizePlane();
function initalizePlane() {
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

// LIGHT(S)
let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.25);
let spotLight1 = new THREE.SpotLight(0xff8000, 5, 0, rad(-30), 1, 0);
let spotLight2 = new THREE.SpotLight(0x0080ff, 1, 0, rad(10), 1, 0);
initalizeLights();
function initalizeLights() {
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


// The meat of the extended audio analysis is within these functions!
class AudioAnalyserEX {
    data;
    avg;
    freq;
    id;
    
    boostActivate = false;
    freqPreLen = 15;
    freqPre = []; // Previous frequency data is stored as a list for accuracy.
    boostTime = 0;
    boostActivateTime = 0;
    boostCumulative = 0;
    boostInetrpolate = 0;
    boostCurrent = 0;
    constructor(id) {
        this.id = id;
    }

    // Where the magical truly happens!
    freqBoost(freqNew, dt, hreshThold, boostAmount, boostLength, boostActivateLength, volumeThresh) {
        var tEX = 0;
        freqNew /= 255;
        if (!analyser) return 0;

        if ((freqNew > truncateAvg(this.freqPre, 0, Math.min(this.freqPre.length, this.freqPreLen)) + hreshThold)
            && !this.boostActivate && freqNew > volumeThresh
        ) {
            this.boostActivate = true;
            this.boostCumulative += boostAmount;
            this.boostCurrent = this.boostInetrpolate;
            this.boostTime = 0;
            this.boostActivateTime = 0;
            // console.log("BOOST!", freqNew, truncateAvg(this.freqPre, 0, this.freqPreLen) + hreshThold);
            console.log("BOOST!", this.id, freqNew);
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
        if (this.freqPre.length > this.freqPreLen) this.freqPre.shift();

        return tEX;
    }

    // Currently used for the shape. Could be it's own class?
    t = 0;
    getInterpolation(freqNew, time, preTime){
        var yolo = AudioAnalyserEX.yolo(freqNew);
        dt  = time - preTime;
        this.t += (dt / 1000 * 0.1) + (0) + (yolo * (dt / 1000) * 0.5);
        this.t %= 1;
        return this.t;
    }

    // yolo
    static yolo(freqNew){
        return ((freqNew / 255 * 2) ** 3) / 8; 
    }
}

// ACTION!
var dt = 0;
var preTime = 0;
var data = analyser.getFrequencyData(); // Bands of frequencies.
var avg = analyser.getAverageFrequency(); // General volume.
const AudioAnalyserKick = new AudioAnalyserEX("Kick!");
const AudioAnalyserMid = new AudioAnalyserEX("Mid !");
const AudioAnalyserBass = new AudioAnalyserEX("Bass!");

let sub, kick, bass, midL, mid, midH, high;
function animate(time) {
    requestAnimationFrame(function loop(time) {
        requestAnimationFrame(loop);
    });
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

    AudioAnalyserKick.freq = kick;
    AudioAnalyserMid.freq = mid;
    AudioAnalyserBass.freq = bass;

    animateMusicType2(object2, keyframesObjAnimateMusicType2, 0, time, preTime);
    // spotLight2.intensity = 1
    // spotLight1.intensity = 5

    if (playing){
        ambientLight1.intensity = AudioAnalyserEX.yolo(avg * 2) * 0.5;
        spotLight1.intensity = AudioAnalyserEX.yolo(midH) * 10 * 2;
        spotLight2.intensity = AudioAnalyserEX.yolo(midL) * 2 * 2;
        // console.log((avg * 2) / 255, midL / 255, midH / 255);
    }
    else{
        ambientLight1.intensity = 0.25;
        spotLight1.intensity = 5 * 2;
        spotLight2.intensity = 1 * 2;
    }
    
    // console.log(spotLight1.intensity)

    // // NOTE TO SELF, performance.now() is pretty much the same as time here, but global!
    preTime = time;
}

// The path the shape moves along as kyframe data.
var groupObjectAnimateMusicType2 = new Group();
const keyframesObjAnimateMusicType2 = [
    [-5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [-5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [0.0, 0.0, -10.0, 1.0, 1.0, -1.0, 30.0]
];

// Used to animate the shape.
function animateMusicType2(object, thisKeyframes, alph, time, preTime) {
    const avg = truncateAvg(data, 0, 1024);

    object.rotation.x += rad(AudioAnalyserKick.freqBoost(AudioAnalyserKick.freq, dt, 0.03, 5, 0.50, 0.1, 0.5));
    object.scale.x = 1 + AudioAnalyserBass.freqBoost(AudioAnalyserBass.freq, dt, 0.03, 0.2, 1.0, 0.1, 0.5);
    object.scale.y = 1 + AudioAnalyserBass.freqBoost(AudioAnalyserBass.freq, dt, 0.03, 0.2, 1.0, 0.1, 0.5);
    object.scale.z = 1 + AudioAnalyserBass.freqBoost(AudioAnalyserBass.freq, dt, 0.03, 0.2, 1.0, 0.1, 0.5);

    var keyframesParse = new Array();
    for (let i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Vector3(thisKeyframes[i][0], thisKeyframes[i][2], thisKeyframes[i][1]));
    }
    // console.log(AudioAnalyserKick.getInterpolation(avg, time, preTime));
    object.position.copy(catmullRomLoop(keyframesParse, AudioAnalyserKick.getInterpolation(avg, time, preTime), alph));
}

// Implementation of the Catmull Rom curve that the shape moves along the path of.
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

// Helper function. Gets the average value of an array from index i to index k (exclusive).
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

// Helper Linear intERPolation function.
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Helper degrees to radians function.
function rad(x) {
    return x / 180 * Math.PI;
}
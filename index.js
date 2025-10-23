import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Group } from '@tweenjs/tween.js';
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { TeapotGeometry } from "three/examples/jsm/Addons.js";
THREE.Cache.enabled = true;

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
initalizeLabel();
function initalizeLabel() {
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
function handleFiles(event) {
    var files = event.target.files;
    souInput.src = URL.createObjectURL(files[0]);
    initalizeSound(souInput.src);
}
input.addEventListener("change", handleFiles, false);

let listener = new THREE.AudioListener();
let audioLoader = new THREE.AudioLoader();
let sound = new THREE.Audio(listener);
let analyser = new THREE.AudioAnalyser(sound, 2048);
initalizeSound("../sounds/UnprecedentedTraveler.mp3");
camera.add(listener);
// AUDIO
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
        });
    },
        function (xhr) {
            sound.stop();
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

let object2;
initalizeObject2();
// OBJECT(s) of interest
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

let plane;
initalizePlane();
// FLOOR
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


let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.25);
let spotLight1 = new THREE.SpotLight(0xffffff, 5, 0, rad(-30), 1, 0);
let spotLight2 = new THREE.SpotLight(0xffffff, 1, 0, rad(10), 1, 0);
initalizeLights();
// LIGHT(S)
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

class AudioAnalyserEX {
    data;
    avg;
    freq;
    id;
    
    boostActivate = false;
    freqPreLen = 15;
    freqPre = [];
    boostTime = 0;
    boostActivateTime = 0;
    boostCumulative = 0;
    boostInetrpolate = 0;
    boostCurrent = 0;
    constructor(id) {
        this.id = id;
    }

    freqBoost(freqNew, dt, hreshThold, boostAmount, boostLength, boostActivateLength) {
        var tEX = 0;
        freqNew /= 255;
        if (!analyser) return 0;

        if ((freqNew > truncateAvg(this.freqPre, 0, Math.min(this.freqPre.length, this.freqPreLen)) + hreshThold) && !this.boostActivate) {
            this.boostActivate = true;
            this.boostCumulative += boostAmount;
            this.boostCurrent = this.boostInetrpolate;
            this.boostTime = 0;
            this.boostActivateTime = 0;
            // console.log("BOOST!", freqNew, truncateAvg(this.freqPre, 0, this.freqPreLen) + hreshThold);
            console.log("BOOST!", this.id);
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

    t = 0;
    getInterpolation(freqNew, time, preTime){
        
        var yolo = ((freqNew / 255 * 2 * 2) ** 3) / 8;
        dt  = time - preTime;
        this.t += (dt / 1000 * 0.1) + (0) + (yolo * (dt / 1000) * 0.5);
        this.t %= 1;
        return this.t;
    }
}

// ACTION!
var swaggest = 0;
var swagger = 0;
var dt = 0;
var preTime = 0;
var data = analyser.getFrequencyData();
var avg = analyser.getAverageFrequency();
const superAudioAnalyser1 = new AudioAnalyserEX("Kick!");
const superAudioAnalyser2 = new AudioAnalyserEX("Mid!");
function animate(time) {
    requestAnimationFrame(function loop(time) {
        requestAnimationFrame(loop);
    });
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);

    data = analyser.getFrequencyData();
    avg = analyser.getAverageFrequency();

    superAudioAnalyser1.freq = truncateAvg(data, 8, 18);
    superAudioAnalyser2.freq = truncateAvg(data, 320, 600);

    // animateMusicType1(object2, time);
    animateMusicType2(object2, keyframesObjAnimateMusicType2, 0, time, preTime);

    // // NOTE TO SELF, performance.now() is pretty much the same as time here, but global!
    // updateFrequencies(data);
    preTime = time;
}

// Improved average calculation with emphasis on peaks
function getWeightedAverage(array) {
    if (array.length === 0) return 0;

    let sum = 0;
    let weight = 0;
    let maxVal = 0;
    const emphasizeFactor = 1.5; // Reduced from 1.8 for more linear response

    for (let i = 0; i < array.length; i++) {
        // Normalize value 0-1
        const value = array[i] / 255;
        maxVal = Math.max(maxVal, value);

        // Apply non-linear emphasis to higher values
        const emphasized = Math.pow(value, emphasizeFactor);

        sum += emphasized;
        weight++;
    }

    // Combine average with max value for better peak detection
    const avg = sum / weight;
    return avg * 0.7 + maxVal * 0.3; // Blend average and peak
}

var groupObjectAnimateMusicType2 = new Group();
const keyframesObjAnimateMusicType2 = [
    [-5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [-5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 10.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [5.0, 0.0, 0.0, 1.0, 1.0, -1.0, 30.0],
    [0.0, 0.0, -10.0, 1.0, 1.0, -1.0, 30.0]
];


function animateMusicType2(object, thisKeyframes, alph, time, preTime) {
    const avg = truncateAvg(data, 0, 1024);

    object.rotation.x += rad(superAudioAnalyser1.freqBoost(superAudioAnalyser1.freq, dt, 0.05, 5, 0.25, 0.1));
    object.scale.x = 1 + superAudioAnalyser2.freqBoost(superAudioAnalyser2.freq, dt, 0.03, 1, 0.4, 0.15);

    var keyframesParse = new Array();
    for (let i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Vector3(thisKeyframes[i][0], thisKeyframes[i][2], thisKeyframes[i][1]));
    }
    object.position.copy(catmullRomLoop(keyframesParse, superAudioAnalyser1.getInterpolation(avg, time, preTime), alph));
}

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

// Using a formatted 2-D array of keyframe parameters, this iteratively sets up the position keyframes with De Casteljau's Construction.
function keyframePositionDe(groupObject, object, thisKeyframes, easeKey, timeKey) {
    var keyframesParse = new Array();
    for (var i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Vector3(thisKeyframes[i][0], thisKeyframes[i][2], thisKeyframes[i][1]));
    }
    object2.position.copy(keyframesParse.at(0));

    var catalyst = { t: 0 };
    var masterTween = new TWEEN.Tween(catalyst)
        .to({
            t: 1
        }, timeKey * 1000)
        .onUpdate(function () {
            var keyframesInterStart = keyframesParse.slice();
            var keyframesInter = new Array();
            for (var i = 0; i < keyframesParse.length - 1; i++) {
                for (var j = 0; j < keyframesInterStart.length - 1; j++) {
                    keyframesInter.push(new THREE.Vector3().lerpVectors(keyframesInterStart.at(j), keyframesInterStart.at(j + 1), catalyst.t));
                }
                keyframesInterStart = keyframesInter.slice();
                keyframesInter = new Array();
            }
            object.position.copy(keyframesInterStart.pop());
        })
        .easing(easeKey)
        .repeat(Infinity);

    groupObject.add(masterTween);
    return masterTween;
}

// Using a formatted 2-D array of keyframe parameters, this iteratively sets up the rotation keyframes with De Casteljau's Construction.
function keyframeQuaternionDe(groupObject, object, thisKeyframes, easeKey, timeKey) {
    var keyframesParse = new Array();
    keyframesParse.push(new THREE.Quaternion().copy(object.quaternion));
    for (var i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(thisKeyframes[i][4], thisKeyframes[i][6], thisKeyframes[i][5]).normalize(), rad(thisKeyframes[i][7])));
    }

    var catalyst = { t: 0 };
    var masterTween = new TWEEN.Tween(catalyst)
        .to({ t: 1 }, timeKey)
        .onUpdate(function () {
            var keyframesInterStart = keyframesParse.slice();
            var keyframesInter = new Array();
            for (var i = 0; i < keyframesParse.length - 1; i++) {
                for (var j = 0; j < keyframesInterStart.length - 1; j++) {
                    keyframesInter.push(new THREE.Quaternion().slerpQuaternions(keyframesInterStart.at(j), keyframesInterStart.at(j + 1), catalyst.t));
                }
                keyframesInterStart = keyframesInter.slice();
                keyframesInter = new Array();
            }
            object.quaternion.copy(keyframesInterStart.pop());
        })
        .onComplete(function () {
            object.quaternion.copy(keyframesParse.pop());
        })
        .easing(easeKey);

    groupObject.add(masterTween);
    return masterTween;
}

function animateMusicType1(object, time, data, avg, preTime) {
    const max = Math.max.apply(Math, data);
    const bass = truncateAvg(data, 4, 12);
    dt = time - preTime;

    var swag = (max / 255) * (avg / 255) * 2;
    var swagger = (0 + swag ** 3) / (dt) * 2 + 0.005;
    var swaggery = (0 + (swag / 2) ** 3) / (dt) * 100;
    swaggest += swagger;
    if (swaggest > rad(360)) swaggest -= rad(360);

    object.rotation.z = swaggest;
    object.scale.x = Math.max(lerp(object.scale.x, 1 + swaggery, 0.5), 1 + swaggery);
    object.scale.y = Math.max(lerp(object.scale.y, 1 + swaggery, 0.5), 1 + swaggery);
    object.scale.z = Math.max(lerp(object.scale.z, 1 + swaggery, 0.5), 1 + swaggery);

    console.log(max, avg, swag, swagger, swaggery, swaggest);
}

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

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function rad(x) {
    return x / 180 * Math.PI;
}
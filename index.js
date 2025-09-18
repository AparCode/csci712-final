import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Group } from '@tweenjs/tween.js';
// import { CSS2DRenderer } from "three/examples/jsm/Addons.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { TeapotGeometry } from "three/examples/jsm/Addons.js";

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

let object2 = new THREE.Mesh(
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
let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000, 1, 1),
    new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: false
    })
);
let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.25);
let spotLight1 = new THREE.SpotLight(0xffffff, 5, 0, rad(-30), 1, 0);
let spotLight2  = new THREE.SpotLight(0xffffff, 5, 0, rad(10), 1, 0);
initalizeObject2();
initalizePlane();
initalizeLights();

let listener = new THREE.AudioListener();
let audioLoader = new THREE.AudioLoader();
let sound = new THREE.Audio(listener);
let analyser = new THREE.AudioAnalyser(sound, 2048);
// let audioContext, analyser, audioElement, source;
initalizeSound();

// Automatically resizes the window.
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
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
function initalizeObject2() {
    object2.castShadow = true;
    object2.receiveShadow = true;
    scene.add(object2);
    object2.position.set(0.0, 0.0, 10.0);
    object2.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 0.0, 0.0).normalize(), rad(90)));
}

// FLOOR
function initalizePlane() {
    plane.receiveShadow = true;
    scene.add(plane);
    plane.position.z = -10;
}

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

// AUDIO
function initalizeSound() {
    camera.add(listener);
    audioLoader.load("../sounds/RuinInCascade.mp3", function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1);
        window.addEventListener("click", function () {
            sound.play();
        });
    });
}

var swaggest = 0;
var swagger = 0;
var dt = 0;
var preTime = 0;
// ANIMATION(S)
// object2.position.set(0.0, 0.0, 0.0);
// object2.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 1.0, -1.0).normalize(), rad(0)));
// var groupObject2 = new Group();
// const keyframesObj2 = [
// 	[1,  4.0,  0.0,  0.0, 1.0, 1.0, -1.0, 30.0, TWEEN.Easing.Linear.None], // time, x, y, z, xa, ya, za, angle, easing
// 	[1,  8.0,  0.0,  0.0, 1.0, 1.0, -1.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 12.0, 12.0, 12.0, 1.0, 1.0, -1.0, 180.0, TWEEN.Easing.Linear.None],
// 	[1, 12.0, 18.0, 18.0, 1.0, 1.0, -1.0, 270.0, TWEEN.Easing.Linear.None],
// 	[1, 18.0, 18.0, 18.0, 0.0, 1.0,  0.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 18.0, 18.0, 18.0, 0.0, 0.0,  1.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0, 12.0, 12.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0,  0.0, 18.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0,  1.0, 18.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None]
// ];
// // groupObject2.add(keyframeEX(object2, keyframes));
// keyframePosition(groupObject2, object2, keyframesObj2, 0).start();
// keyframeQuaternion(groupObject2, object2, keyframesObj2, 0, new THREE.Quaternion().copy(object2.quaternion)).start();


// object3.position.set(0.0 - 12.5, 0.0, 0.0);
// object3.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 1.0, -1.0).normalize(), rad(0)));
// var groupObject3 = new Group();
// const keyframesObj3 = [
// 	[1,  4.0 - 12.5,  0.0,  0.0, 1.0, 1.0, -1.0, 30.0, TWEEN.Easing.Linear.None], // time, x, y, z, xa, ya, za, angle, easing
// 	[1,  8.0 - 12.5,  0.0,  0.0, 1.0, 1.0, -1.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 12.0 - 12.5, 12.0, 12.0, 1.0, 1.0, -1.0, 180.0, TWEEN.Easing.Linear.None],
// 	[1, 12.0 - 12.5, 18.0, 18.0, 1.0, 1.0, -1.0, 270.0, TWEEN.Easing.Linear.None],
// 	[1, 18.0 - 12.5, 18.0, 18.0, 0.0, 1.0,  0.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 18.0 - 12.5, 18.0, 18.0, 0.0, 0.0,  1.0, 90.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0 - 12.5, 12.0, 12.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0 - 12.5,  0.0, 18.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None],
// 	[1, 25.0 - 12.5,  1.0, 18.0, 1.0, 0.0,  0.0, 0.0, TWEEN.Easing.Linear.None]
// ];
// keyframePositionDe(groupObject3, object3, keyframesObj3).start();
// keyframeQuaternionDe(groupObject3, object3, keyframesObj3).start();

// ACTION!
function animate(time) {
    requestAnimationFrame(function loop(time) {
        // groupObject2.update(time);
        requestAnimationFrame(loop);
    })
    renderer.render(scene, camera);

    const data = analyser.getFrequencyData();
    const avg = analyser.getAverageFrequency();
    const max = Math.max.apply(Math, data);
    const bass = truncateAvg(data, 4, 12);
    dt = time - preTime;

    var swag = (max / 255) * (avg / 255) * 2;
    var swagger = (0 + swag ** 3) / (dt) * 2 + 0.005;
    var swaggery = (0 + (swag / 2) ** 3) / (dt) * 100;
    swaggest += swagger;
    if (swaggest > rad(360)) swaggest -= rad(360);

    object2.rotation.z = swaggest;
    object2.scale.x = Math.max(lerp(object2.scale.x, 1 + swaggery, 0.5), 1 + swaggery);
    object2.scale.y = Math.max(lerp(object2.scale.y, 1 + swaggery, 0.5), 1 + swaggery);
    object2.scale.z = Math.max(lerp(object2.scale.z, 1 + swaggery, 0.5), 1 + swaggery);
 
    console.log(max, avg, swag, swagger, swaggery, swaggest);
    preTime = time;
}

function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function truncateAvg(dataer, i, k){
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

function liveReaction() {
    if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const scale = 1 + data[0] / 256, bassFrequency = data[0];
        torus.scale.set(scale, scale, scale);
        torus.material.opacity = bassFrequency > 128 ? 0.5 + bassFrequency / 256 : 0.9;
    }
}

// Using a formatted 2-D array of keyframe parameters, this iteratively sets up the rotation keyframes with De Casteljau's Construction.
function keyframeQuaternionDe(groupObject, object, thisKeyframes) {
    var keyframesParse = new Array();
    var easeKey = thisKeyframes[0][8];
    var timeKey = 0;
    keyframesParse.push(new THREE.Quaternion().copy(object.quaternion));
    for (var i = 0; i < thisKeyframes.length; i++) {
        // keyframesParse.push(new THREE.Quaternion().multiplyQuaternions(keyframesParse.at(i - 1), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(thisKeyframes[i][4], thisKeyframes[i][5], thisKeyframes[i][6]).normalize(), rad(thisKeyframes[i][7]))));
        keyframesParse.push(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(thisKeyframes[i][4], thisKeyframes[i][5], thisKeyframes[i][6]).normalize(), rad(thisKeyframes[i][7])));
        timeKey += thisKeyframes[i][0];
    }
    // console.log(keyframesParse);
    timeKey *= 1000;


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

// Using a formatted 2-D array of keyframe parameters, this iteratively sets up the position keyframes with De Casteljau's Construction.
function keyframePositionDe(groupObject, object, thisKeyframes) {
    var keyframesParse = new Array();
    var easeKey = thisKeyframes[0][8];
    var timeKey = 0;
    keyframesParse.push(new THREE.Vector3().copy(object.position));
    for (var i = 0; i < thisKeyframes.length; i++) {
        keyframesParse.push(new THREE.Vector3(thisKeyframes[i][1], thisKeyframes[i][3], thisKeyframes[i][2]));
        timeKey += thisKeyframes[i][0];
    }
    // console.log(timeKey);
    timeKey *= 1000;

    var catalyst = { t: 0 };
    var masterTween = new TWEEN.Tween(catalyst)
        .to({
            t: 1
        }, timeKey)
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
        .easing(easeKey);

    groupObject.add(masterTween);
    return masterTween;
}

// Using a formatted 2-D array of keyframe parameters, this recursively sets up the rotation keyframes.
function keyframeQuaternion(groupObject, object, thisKeyframes, i, qStart) {
    var timeKey = thisKeyframes[i][0] * 1000;
    var xaKey = thisKeyframes[i][4];
    var yaKey = thisKeyframes[i][6];
    var zaKey = thisKeyframes[i][5];
    var radKey = thisKeyframes[i][7];
    var easeKey = thisKeyframes[i][8];

    var timer = { t: 0 };
    var qFinsh = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(xaKey, yaKey, zaKey).normalize(), rad(radKey));
    // var qFinsh = new THREE.Quaternion().multiplyQuaternions(qStart, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(xaKey, yaKey, zaKey).normalize(), rad(radKey)));

    var masterTween = new TWEEN.Tween(timer)
        .to({ t: 1 }, timeKey)
        .onUpdate(function () {
            // if (i == 0) console.log(timer);
            object.quaternion.copy(new THREE.Quaternion().slerpQuaternions(qStart, qFinsh, timer.t));
        })
        .onComplete(function () {
            object.quaternion.copy(qFinsh);
        })
        .easing(easeKey);

    if (i < thisKeyframes.length - 1) {
        var nextTween = keyframeQuaternion(groupObject2, object, thisKeyframes, i + 1, qFinsh);
        masterTween.chain(nextTween);
        groupObject.add(nextTween);
    }

    groupObject.add(masterTween);

    return masterTween;
}

// Using a formatted 2-D array of keyframe parameters, this recursively sets up the position keyframes.
function keyframePosition(groupObject, object, thisKeyframes, i) {
    var timeKey = thisKeyframes[i][0] * 1000;
    var xKey = thisKeyframes[i][1];
    var yKey = thisKeyframes[i][3];
    var zKey = thisKeyframes[i][2];
    var easeKey = thisKeyframes[i][8];

    var masterTween = new TWEEN.Tween(object.position).to({
        x: xKey,
        y: yKey,
        z: zKey
    }, timeKey)
        .easing(easeKey);

    if (i < thisKeyframes.length - 1) {
        var nextTween = keyframePosition(groupObject2, object, thisKeyframes, i + 1);
        masterTween.chain(nextTween);
        groupObject.add(nextTween);
    }

    groupObject.add(masterTween);
    return masterTween;
}

// Translates the X-position of the object.
function translateRelX(object, x, time, delay, ease) {
    return new TWEEN.Tween(object.position)
        .to({ x: object.position.x - x }, time)
        .easing(ease)
        .delay(delay)
        .start();
}

// Translates the Y-position of the object.
function translateRelY(object, y, time, delay, ease) {
    return new TWEEN.Tween(object.position)
        .to({ y: object.position.y - y }, time)
        .easing(ease)
        .delay(delay)
        .start();
}

// Unused. Used to rotate the object along the Y-Axis using the object's built-in Euler angels.
function rotateRelY(object, y, time, delay, ease) {
    return new TWEEN.Tween(object.rotation)
        .to({ y: object.rotation.y - y }, time)
        .easing(ease)
        .delay(delay)
        .start();
}

// Quaternion rotation! Used to rotate the object along the Y-Axis.
function rotateQuaternionAxis(object, axis, angle, time, delay, ease) {
    // var qFinsh = {t: 0};
    var timer = { t: 0 };

    var qStart = new THREE.Quaternion().copy(object.quaternion);
    var qFinsh = new THREE.Quaternion().multiplyQuaternions(qStart, new THREE.Quaternion().setFromAxisAngle(axis, angle));

    // o.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
    // qFinsh = o.quaternion;

    return new TWEEN.Tween(timer)
        .to({ t: 1 }, time)
        .onUpdate(function () {
            object.quaternion.copy(new THREE.Quaternion().slerpQuaternions(qStart, qFinsh, timer.t));
        })
        .onComplete(function () {
            object.quaternion.copy(qFinsh); // Just to be sure!
        })
        .easing(ease)
        .delay(delay)
        .start();
}

// Helper function; Converts degrees to radians.
function rad(x) {
    return x / 180 * Math.PI;
}
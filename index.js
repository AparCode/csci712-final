import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Group } from '@tweenjs/tween.js';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
// import { CSS2DRenderer } from "three/examples/jsm/Addons.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

// Automatically resizes the window.
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// SCENE
const renderer = new THREE.WebGLRenderer({ antialias: false });
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.005);
renderer.setClearColor("#000000");

// HTML INTEGRATION
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);
// const p = document.createElement("p");
// p.textContent = "TEST!!!!!!!!!!!";
const input = document.createElement("input");
input.type = "file";
input.name = "filename";
const cPointLabel = new CSS2DObject(input);
cPointLabel.position.set(0, 0, 0);
scene.add(cPointLabel);

// RENDERER SETUP
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75, // FoV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near
    1000 // Far
);
camera.position.set(0, -50, 10);
camera.rotation.x = rad(90);
camera.rotation.y = rad(0);

// OBJECT of interest
const object1 = new THREE.Mesh(
    // new THREE.BoxGeometry(1, 1, 1), 
    new TeapotGeometry(5, 1),
    new THREE.MeshPhongMaterial({
        color: 0x8000ff,
        flatShading: false
    })
);
object1.castShadow = true;
object1.receiveShadow = true;
scene.add(object1);
object1.position.set(-100, 80, 6);
object1.rotation.set(rad(90), 0, 0);

// FLOOR
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000, 1, 1),
    new THREE.MeshPhongMaterial({
        color: 0x80ff00,
        flatShading: false
    })
);
plane.receiveShadow = true;
scene.add(plane);
plane.position.z = -0.5;

// LIGHT(S)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
scene.add(ambientLight)
const spotLight = new THREE.SpotLight(0xffffff, 5, 0, rad(30), 1, 0);
spotLight.position.set(-20, -50, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 1000;
scene.add(spotLight);
const spotLight2 = new THREE.SpotLight(0xffffff, 5, 0, rad(10), 1, 0);
spotLight2.position.set(0, 0, 100);
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.set(1024, 1024);
spotLight2.shadow.camera.near = 0.1;
spotLight2.shadow.camera.far = 1000;
scene.add(spotLight2);
const spotLight2Target = new THREE.Object3D();
spotLight2Target.position.set(-100, 80, 6);
scene.add(spotLight2Target);
spotLight2.target = object1;
scene.add(spotLight2.target);

// AUDIO
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();
const sound = new THREE.Audio(listener);
audioLoader.load("../sounds/ding.wav", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    window.addEventListener("click", function () {
        sound.play();
    });
}
);

// ANIMATION(S)
var groupObject1 = new Group();
groupObject1.add(translateRelX(object1, -5 * 20, 20000, 0, TWEEN.Easing.Linear.None));
groupObject1.add(translateRelY(object1, 5 * 20, 20000, 0, TWEEN.Easing.Linear.None));
groupObject1.add(rotateRelY(object1, rad(18) * 20.0, 20000, 0, TWEEN.Easing.Linear.None));
// groupObject1.add(rotateQuaternionAxis(object1, new THREE.Vector3(0, 1, 0), rad(18) * 20.0, 20000, 0, TWEEN.Easing.Linear.None));

// ACTION!
function animate(time) {
    requestAnimationFrame(function loop(time) {
        groupObject1.update(time);
        requestAnimationFrame(loop);
    })
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);
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

    // TODO: GET ROTATION USING QUATERNIONS WORKING!
    return new TWEEN.Tween(timer)
        .to({ t: 1 }, time)
        .onUpdate(function () {
            object1.quaternion.copy(new THREE.Quaternion().slerpQuaternions(qStart, qFinsh, timer.t));
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
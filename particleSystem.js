import * as THREE from 'three';

class particleSystem {
    constructor(file, vertexShader, fragmentShader, camera, scene) {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointMultiplier: new THREE.TextureLoader().load(file),
                diffuseTexture: window.innerHeight / (2 * Math.tan(0.5 * camera.fov * Math.PI / 180))
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        this.camera = camera;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.points = new THREE.Points(this.geometry, this.material);
        scene.add(this.points);
    }

    AddParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 1) * 1,
                    (Math.random() * 2 - 1) * 1,
                    (Math.random() * 2 - 1) * 1
                )
            });
        }
    }

    UpdateParticles(timeElapsed) {
        this.particles.sort((a, b) => {
            const aPos = this.camera.position.distanceTo(a.position);
            const bPos = this.camera.position.distanceTo(b.position);

            if (aPos > bPos) return -1;
            if (aPos < bPos) return 1;
            return 0;
        });
    }

    UpdateGeometry() {
        const positions = [];

        for (let particle of this.particles) {
            positions.push(particle.position.x, particle.position.y, particle.position.z);
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.attributes.position.needsUpdate = true;
    }

    Step(timeElapsed) {
        this.AddParticles();
        this.UpdateParticles(timeElapsed);
        this.UpdateGeometry();
    }
};

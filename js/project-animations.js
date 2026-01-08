/**
 * Project-specific 3D Animations
 * Each project gets a unique visualization style
 */

// Base animation class
class ProjectAnimation {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!this.container) return;

        this.options = {
            color: options.color || 0x4f46e5,
            ...options
        };

        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.createGeometry();
        this.animate();
    }

    createGeometry() {
        // Override in subclasses
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        // Override in subclasses
    }
}

// Geo-Insight: Particle Vision Field
class ParticleField extends ProjectAnimation {
    createGeometry() {
        const particles = 500;
        const positions = new Float32Array(particles * 3);

        for (let i = 0; i < particles * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8;
            positions[i + 1] = (Math.random() - 0.5) * 6;
            positions[i + 2] = (Math.random() - 0.5) * 4;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: this.options.color,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Detection box wireframe
        const boxGeometry = new THREE.BoxGeometry(3, 2.5, 0.1);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        this.box = new THREE.Mesh(boxGeometry, boxMaterial);
        this.scene.add(this.box);
    }

    update() {
        this.particles.rotation.y += 0.001;
        this.box.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
        this.box.rotation.x = Math.cos(Date.now() * 0.0015) * 0.1;
    }
}

// Predictive Maintenance: Pulsing Machinery Mesh
class MachineryMesh extends ProjectAnimation {
    createGeometry() {
        // Central gear
        const torusGeometry = new THREE.TorusGeometry(1, 0.3, 8, 20);
        const material = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true
        });

        this.gear1 = new THREE.Mesh(torusGeometry, material);
        this.scene.add(this.gear1);

        // Secondary gear
        const gear2Geometry = new THREE.TorusGeometry(0.6, 0.2, 8, 16);
        this.gear2 = new THREE.Mesh(gear2Geometry, material.clone());
        this.gear2.position.x = 2;
        this.scene.add(this.gear2);

        // Connecting lines
        const points = [
            new THREE.Vector3(-2, 0, 0),
            new THREE.Vector3(2, 0, 0)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: this.options.color,
            transparent: true,
            opacity: 0.5
        });
        this.line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(this.line);

        // Pulse indicator
        this.pulseScale = 1;
        this.pulseDirection = 1;
    }

    update() {
        this.gear1.rotation.z += 0.01;
        this.gear2.rotation.z -= 0.015;

        // Pulsing effect
        this.pulseScale += 0.005 * this.pulseDirection;
        if (this.pulseScale > 1.1 || this.pulseScale < 0.9) {
            this.pulseDirection *= -1;
        }
        this.gear1.scale.setScalar(this.pulseScale);
    }
}

// Chat-with-Assets: Connected Document Nodes
class DocumentNodes extends ProjectAnimation {
    createGeometry() {
        this.nodes = [];
        const nodePositions = [
            { x: 0, y: 1.5, z: 0 },
            { x: -1.5, y: 0, z: 0.5 },
            { x: 1.5, y: 0, z: -0.5 },
            { x: -0.8, y: -1.2, z: 0 },
            { x: 0.8, y: -1.2, z: 0 }
        ];

        const boxGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
        const material = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true
        });

        nodePositions.forEach(pos => {
            const node = new THREE.Mesh(boxGeometry, material.clone());
            node.position.set(pos.x, pos.y, pos.z);
            this.nodes.push(node);
            this.scene.add(node);
        });

        // Connect nodes with lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: this.options.color,
            transparent: true,
            opacity: 0.3
        });

        this.lines = [];
        for (let i = 0; i < nodePositions.length; i++) {
            for (let j = i + 1; j < nodePositions.length; j++) {
                const points = [
                    new THREE.Vector3(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z),
                    new THREE.Vector3(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z)
                ];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.lines.push(line);
                this.scene.add(line);
            }
        }
    }

    update() {
        const time = Date.now() * 0.001;
        this.nodes.forEach((node, i) => {
            node.rotation.y = time + i * 0.5;
            node.position.y += Math.sin(time + i) * 0.002;
        });
    }
}

// Legal-Eagle: DNA Helix (Multi-agent)
class DNAHelix extends ProjectAnimation {
    createGeometry() {
        this.helixPoints1 = [];
        this.helixPoints2 = [];

        const material = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true
        });

        const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);

        for (let i = 0; i < 20; i++) {
            const angle = i * 0.5;
            const y = (i - 10) * 0.3;

            const sphere1 = new THREE.Mesh(sphereGeometry, material);
            sphere1.position.set(Math.cos(angle) * 1.2, y, Math.sin(angle) * 1.2);
            this.helixPoints1.push(sphere1);
            this.scene.add(sphere1);

            const sphere2 = new THREE.Mesh(sphereGeometry, material.clone());
            sphere2.position.set(Math.cos(angle + Math.PI) * 1.2, y, Math.sin(angle + Math.PI) * 1.2);
            this.helixPoints2.push(sphere2);
            this.scene.add(sphere2);

            // Connect pairs
            if (i % 2 === 0) {
                const points = [sphere1.position.clone(), sphere2.position.clone()];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: this.options.color,
                    transparent: true,
                    opacity: 0.4
                });
                this.scene.add(new THREE.Line(lineGeometry, lineMaterial));
            }
        }

        this.rotationOffset = 0;
    }

    update() {
        this.rotationOffset += 0.01;

        this.helixPoints1.forEach((sphere, i) => {
            const angle = i * 0.5 + this.rotationOffset;
            const y = (i - 10) * 0.3;
            sphere.position.x = Math.cos(angle) * 1.2;
            sphere.position.z = Math.sin(angle) * 1.2;
        });

        this.helixPoints2.forEach((sphere, i) => {
            const angle = i * 0.5 + this.rotationOffset + Math.PI;
            sphere.position.x = Math.cos(angle) * 1.2;
            sphere.position.z = Math.sin(angle) * 1.2;
        });
    }
}

// Policy-Guard: Shield Barrier
class ShieldBarrier extends ProjectAnimation {
    createGeometry() {
        // Hexagonal shield pattern
        const hexRadius = 0.4;
        const rings = 3;

        const material = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });

        this.hexagons = [];

        for (let ring = 0; ring < rings; ring++) {
            const count = ring === 0 ? 1 : ring * 6;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const distance = ring * hexRadius * 1.8;

                const hexGeometry = new THREE.CircleGeometry(hexRadius, 6);
                const hex = new THREE.Mesh(hexGeometry, material.clone());
                hex.position.x = Math.cos(angle) * distance;
                hex.position.y = Math.sin(angle) * distance;
                this.hexagons.push(hex);
                this.scene.add(hex);
            }
        }

        // Outer ring
        const ringGeometry = new THREE.RingGeometry(2.2, 2.4, 32);
        this.outerRing = new THREE.Mesh(ringGeometry, material.clone());
        this.scene.add(this.outerRing);
    }

    update() {
        const time = Date.now() * 0.001;

        this.hexagons.forEach((hex, i) => {
            hex.material.opacity = 0.5 + Math.sin(time * 2 + i * 0.5) * 0.3;
        });

        this.outerRing.rotation.z += 0.005;
    }
}

// RL Supply Chain: Flow Pipeline
class FlowPipeline extends ProjectAnimation {
    createGeometry() {
        // Pipeline structure
        const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8, 1, true);
        const pipeMaterial = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });

        this.pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        this.pipe.rotation.z = Math.PI / 2;
        this.scene.add(this.pipe);

        // Flow particles
        this.flowParticles = [];
        const sphereGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true
        });

        for (let i = 0; i < 5; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
            sphere.position.x = -3 + i * 1.5;
            this.flowParticles.push(sphere);
            this.scene.add(sphere);
        }

        // Nodes at ends
        const nodeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        this.nodeStart = new THREE.Mesh(nodeGeometry, pipeMaterial.clone());
        this.nodeStart.position.x = -3.5;
        this.scene.add(this.nodeStart);

        this.nodeEnd = new THREE.Mesh(nodeGeometry, pipeMaterial.clone());
        this.nodeEnd.position.x = 3.5;
        this.scene.add(this.nodeEnd);
    }

    update() {
        const speed = 0.02;

        this.flowParticles.forEach(particle => {
            particle.position.x += speed;
            if (particle.position.x > 3.5) {
                particle.position.x = -3.5;
            }
            particle.rotation.x += 0.02;
            particle.rotation.y += 0.02;
        });

        this.nodeStart.rotation.y += 0.01;
        this.nodeEnd.rotation.y -= 0.01;
    }
}

// Export all animations
window.ProjectAnimations = {
    ParticleField,
    MachineryMesh,
    DocumentNodes,
    DNAHelix,
    ShieldBarrier,
    FlowPipeline
};

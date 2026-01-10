/**
 * 3D Animated Sphere - Bittensor-inspired visualization
 * Uses Three.js for WebGL rendering
 */

class AnimatedSphere {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) return;

    this.options = {
      color: options.color || 0x1a1a1a,
      wireframe: options.wireframe !== false,
      segments: options.segments || 32,
      radius: options.radius || 1.5,
      rotationSpeed: options.rotationSpeed || 0.001,
      mouseInfluence: options.mouseInfluence || 0.1,
      ...options
    };

    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 4;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Create sphere
    this.createSphere();

    // Events
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Start animation
    this.animate();
  }

  createSphere() {
    const geometry = new THREE.IcosahedronGeometry(this.options.radius, 2);

    const material = new THREE.MeshBasicMaterial({
      color: this.options.color,
      wireframe: this.options.wireframe,
      transparent: true,
      opacity: 0.8
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    // Add inner sphere for depth
    const innerGeometry = new THREE.IcosahedronGeometry(this.options.radius * 0.6, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: this.options.color,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    this.innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    this.scene.add(this.innerSphere);
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

    // Auto rotation
    this.sphere.rotation.y += this.options.rotationSpeed;
    this.sphere.rotation.x += this.options.rotationSpeed * 0.5;

    this.innerSphere.rotation.y -= this.options.rotationSpeed * 0.7;
    this.innerSphere.rotation.x -= this.options.rotationSpeed * 0.3;

    // Mouse influence
    this.targetRotation.x = this.mouse.y * this.options.mouseInfluence;
    this.targetRotation.y = this.mouse.x * this.options.mouseInfluence;

    this.sphere.rotation.x += (this.targetRotation.x - this.sphere.rotation.x) * 0.05;
    this.sphere.rotation.y += (this.targetRotation.y - this.sphere.rotation.y) * 0.05;

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Export for use
window.AnimatedSphere = AnimatedSphere;

/**
 * Neural Network 3D Animation - AI-themed visualization
 */
class NeuralNetwork {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) return;

    this.options = {
      nodeCount: options.nodeCount || 50,
      connectionDistance: options.connectionDistance || 2,
      nodeColor: options.nodeColor || 0x4f46e5,
      lineColor: options.lineColor || 0x8b5cf6,
      rotationSpeed: options.rotationSpeed || 0.0005,
      ...options
    };

    this.nodes = [];
    this.lines = [];

    // Skipping synchronous init to allow async init flow
  }

  init() {
    this.scene = new THREE.Scene();

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.createNetwork();

    window.addEventListener('resize', () => this.onResize());

    this.animate();
  }

  createNetwork() {
    // Create nodes (neurons)
    const nodeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: this.options.nodeColor,
      transparent: true,
      opacity: 0.9
    });

    this.nodeGroup = new THREE.Group();

    for (let i = 0; i < this.options.nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      node.position.x = (Math.random() - 0.5) * 4;
      node.position.y = (Math.random() - 0.5) * 4;
      node.position.z = (Math.random() - 0.5) * 4;
      node.userData.velocity = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      };
      this.nodes.push(node);
      this.nodeGroup.add(node);
    }

    this.scene.add(this.nodeGroup);

    // Create connections
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: this.options.lineColor,
      transparent: true,
      opacity: 0.3
    });

    this.lineGroup = new THREE.Group();
    this.scene.add(this.lineGroup);
  }

  updateConnections() {
    // Remove old lines
    while (this.lineGroup.children.length > 0) {
      this.lineGroup.remove(this.lineGroup.children[0]);
    }

    // Create new connections based on distance
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dist = this.nodes[i].position.distanceTo(this.nodes[j].position);
        if (dist < this.options.connectionDistance) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            this.nodes[i].position,
            this.nodes[j].position
          ]);
          const line = new THREE.Line(geometry, this.lineMaterial);
          this.lineGroup.add(line);
        }
      }
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Move nodes
    this.nodes.forEach(node => {
      node.position.x += node.userData.velocity.x;
      node.position.y += node.userData.velocity.y;
      node.position.z += node.userData.velocity.z;

      // Bounce off boundaries
      ['x', 'y', 'z'].forEach(axis => {
        if (Math.abs(node.position[axis]) > 2) {
          node.userData.velocity[axis] *= -1;
        }
      });
    });

    // Update connections every few frames
    if (Math.random() < 0.1) {
      this.updateConnections();
    }

    // Rotate the whole network
    this.nodeGroup.rotation.y += this.options.rotationSpeed;
    this.lineGroup.rotation.y += this.options.rotationSpeed;

    this.renderer.render(this.scene, this.camera);
  }
}

window.NeuralNetwork = NeuralNetwork;

/**
 * Data Cube 3D Animation - Portfolio visualization
 * Floating rotating cubes representing projects/data
 */
class DataCube {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) return;

    this.options = {
      cubeCount: options.cubeCount || 6,
      cubeColor: options.cubeColor || 0x4f46e5,
      rotationSpeed: options.rotationSpeed || 0.005,
      ...options
    };

    this.cubes = [];

    // Skipping synchronous init to allow async init flow
  }

  init() {
    this.scene = new THREE.Scene();

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 6;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.createCubes();

    window.addEventListener('resize', () => this.onResize());

    this.animate();
  }

  createCubes() {
    const colors = [0x4f46e5, 0x8b5cf6, 0x06b6d4, 0x10b981, 0xf59e0b, 0xef4444];

    for (let i = 0; i < this.options.cubeCount; i++) {
      const size = 0.3 + Math.random() * 0.4;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });

      const cube = new THREE.Mesh(geometry, material);

      // Position in a circular pattern
      const angle = (i / this.options.cubeCount) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      cube.position.x = Math.cos(angle) * radius;
      cube.position.y = (Math.random() - 0.5) * 2;
      cube.position.z = Math.sin(angle) * radius;

      cube.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02
      };
      cube.userData.floatOffset = Math.random() * Math.PI * 2;

      this.cubes.push(cube);
      this.scene.add(cube);
    }

    // Add central larger cube
    const centerGeometry = new THREE.IcosahedronGeometry(0.6, 1);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.centerCube = new THREE.Mesh(centerGeometry, centerMaterial);
    this.scene.add(this.centerCube);
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Animate cubes
    this.cubes.forEach((cube, i) => {
      cube.rotation.x += cube.userData.rotationSpeed.x;
      cube.rotation.y += cube.userData.rotationSpeed.y;

      // Floating motion
      cube.position.y += Math.sin(time + cube.userData.floatOffset) * 0.002;
    });

    // Rotate center
    this.centerCube.rotation.x += 0.003;
    this.centerCube.rotation.y += 0.005;

    // Rotate entire scene slowly
    this.scene.rotation.y += this.options.rotationSpeed;

    this.renderer.render(this.scene, this.camera);
  }
}

window.DataCube = DataCube;

/**
 * Geometric Animation - Generic 3D shape for Contact Page
 */
class GeometricAnimation {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) return;

    this.options = {
      color: options.color || 0x4f46e5,
      size: options.size || 1.5,
      mouseInfluence: options.mouseInfluence || 0.5,
      ...options
    };

    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Create Geometry (Torus Knot)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.options.color,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    this.animate();
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

    this.mesh.rotation.x += 0.003;
    this.mesh.rotation.y += 0.005;

    this.targetRotation.x = this.mouse.y * this.options.mouseInfluence;
    this.targetRotation.y = this.mouse.x * this.options.mouseInfluence;

    this.mesh.rotation.x += (this.targetRotation.x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.05;

    this.renderer.render(this.scene, this.camera);
  }
}

window.FaceAnimation = GeometricAnimation; // Keep alias for backward compatibility or easy switch
window.GeometricAnimation = GeometricAnimation;

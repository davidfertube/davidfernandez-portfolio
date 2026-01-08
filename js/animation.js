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

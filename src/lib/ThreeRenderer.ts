import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export class ThreeRendererManager {
  webglRenderer: THREE.WebGLRenderer;
  cssRenderer: CSS3DRenderer;
  
  constructor(container: HTMLElement, cssContainer: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    this.webglRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    
    this.webglRenderer.setSize(width, height);
    this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webglRenderer.outputColorSpace = THREE.SRGBColorSpace;
    this.webglRenderer.shadowMap.enabled = true;
    this.webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.webglRenderer.domElement.style.position = 'absolute';
    this.webglRenderer.domElement.style.top = '0';
    this.webglRenderer.domElement.style.left = '0';
    this.webglRenderer.domElement.style.zIndex = '1';
    this.webglRenderer.domElement.style.pointerEvents = 'auto';

    container.appendChild(this.webglRenderer.domElement);

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(width, height);
    
    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = '0';
    this.cssRenderer.domElement.style.left = '0';
    this.cssRenderer.domElement.style.zIndex = '2';
    this.cssRenderer.domElement.style.pointerEvents = 'none';

    cssContainer.appendChild(this.cssRenderer.domElement);
  }

  resize(width: number, height: number) {
    this.webglRenderer.setSize(width, height);
    this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.cssRenderer.setSize(width, height);
  }

  render(
    scene: THREE.Scene, 
    cssScene: THREE.Scene, 
    camera: THREE.Camera
  ) {
    this.webglRenderer.render(scene, camera);
    this.cssRenderer.render(cssScene, camera);
  }

  dispose() {
    this.webglRenderer.dispose();
    this.cssRenderer.domElement.remove();
  }
}


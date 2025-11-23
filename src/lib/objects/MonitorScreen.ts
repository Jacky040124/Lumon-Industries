import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CameraKey } from '@/models/three';

export class MonitorScreen {
  width: number = 650;  
  height: number = 530;

  position: THREE.Vector3 = new THREE.Vector3(0, 1.05, 0.1); 
  scale: number = 0.0022;
  
  iframeObject: CSS3DObject | null = null;
  wallpaperMesh: THREE.Mesh | null = null;

  constructor(parent: THREE.Object3D) {
    this.createScreen(parent);
  }

  createScreen(parent: THREE.Object3D) {
    // 1. Create iframe container (for close-up views)
    const container = document.createElement('div');
    container.style.width = `${this.width}px`;
    container.style.height = `${this.height}px`;
    container.style.opacity = '1';
    container.style.background = '#0a1628'; // Dark blue to match Lumon interface
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    
    const iframe = document.createElement('iframe');
    iframe.src = "https://passi.design/lab/lumon/";
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.pointerEvents = 'none';
    
    container.appendChild(iframe);

    this.iframeObject = new CSS3DObject(container);
    this.iframeObject.position.copy(this.position);
    this.iframeObject.scale.set(this.scale, this.scale, this.scale);
    this.iframeObject.visible = false; // Hidden by default
    
    parent.add(this.iframeObject);

    // 2. Create dark blue background (always visible to fill gaps)
    const backgroundMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0a1628, // Dark blue matching Lumon interface
      side: THREE.DoubleSide 
    });
    // Much larger to cover entire monitor bezel area
    const backgroundGeometry = new THREE.PlaneGeometry(this.width * 1.2, this.height * 1.3);
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    
    backgroundMesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z - 0.002 // Slightly behind other elements
    );
    backgroundMesh.scale.set(this.scale, this.scale, this.scale);
    parent.add(backgroundMesh);

    // 3. Create wallpaper mesh (for wide view)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/models/wallpaper.jpg', (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      const material = new THREE.MeshBasicMaterial({ map: texture });
      const geometry = new THREE.PlaneGeometry(this.width, this.height);
      this.wallpaperMesh = new THREE.Mesh(geometry, material);

      this.wallpaperMesh.position.copy(this.position);
      this.wallpaperMesh.scale.set(this.scale, this.scale, this.scale);
      this.wallpaperMesh.visible = true; // Visible by default
      
      parent.add(this.wallpaperMesh);
    });

    // 4. Create occlusion plane (WebGL)
    const occlusionMaterial = new THREE.MeshBasicMaterial({
      opacity: 0,
      color: 0x000000,
      blending: THREE.NoBlending,
      side: THREE.DoubleSide,
    });
    
    const occlusionGeometry = new THREE.PlaneGeometry(this.width, this.height);
    const occlusionMesh = new THREE.Mesh(occlusionGeometry, occlusionMaterial);
    
    occlusionMesh.position.copy(this.position);
    occlusionMesh.scale.set(this.scale, this.scale, this.scale);
    
    parent.add(occlusionMesh);
  }

  createBezel(parent: THREE.Object3D) {
    // Bezel parameters
    const bezelWidth = 40; // Width of the bezel frame
    const bezelDepth = 8; // How much it extrudes forward
    const screenWidth = this.width;
    const screenHeight = this.height;
    
    // Dark grey plastic material for bezel
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.1,
    });

    const bezelGroup = new THREE.Group();
    
    // Top bezel
    const topBezel = new THREE.Mesh(
      new THREE.BoxGeometry(screenWidth + bezelWidth * 2, bezelWidth, bezelDepth),
      bezelMaterial
    );
    topBezel.position.set(0, (screenHeight / 2) + (bezelWidth / 2), bezelDepth / 2);
    bezelGroup.add(topBezel);
    
    // Bottom bezel
    const bottomBezel = new THREE.Mesh(
      new THREE.BoxGeometry(screenWidth + bezelWidth * 2, bezelWidth, bezelDepth),
      bezelMaterial
    );
    bottomBezel.position.set(0, -(screenHeight / 2) - (bezelWidth / 2), bezelDepth / 2);
    bezelGroup.add(bottomBezel);
    
    // Left bezel
    const leftBezel = new THREE.Mesh(
      new THREE.BoxGeometry(bezelWidth, screenHeight, bezelDepth),
      bezelMaterial
    );
    leftBezel.position.set(-(screenWidth / 2) - (bezelWidth / 2), 0, bezelDepth / 2);
    bezelGroup.add(leftBezel);
    
    // Right bezel
    const rightBezel = new THREE.Mesh(
      new THREE.BoxGeometry(bezelWidth, screenHeight, bezelDepth),
      bezelMaterial
    );
    rightBezel.position.set((screenWidth / 2) + (bezelWidth / 2), 0, bezelDepth / 2);
    bezelGroup.add(rightBezel);
    
    // Position bezel group
    bezelGroup.position.copy(this.position);
    bezelGroup.position.z += 0.003; // Slightly in front of screen
    bezelGroup.scale.set(this.scale, this.scale, this.scale);
    
    // Enable shadows
    bezelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    parent.add(bezelGroup);
  }

  setViewMode(cameraKey: CameraKey) {
    const showIframe = cameraKey === CameraKey.BACK_WIDE || cameraKey === CameraKey.BACK_CLOSE;
    
    if (this.iframeObject) {
      this.iframeObject.visible = showIframe;
    }
    
    if (this.wallpaperMesh) {
      this.wallpaperMesh.visible = !showIframe;
    }
  }
}

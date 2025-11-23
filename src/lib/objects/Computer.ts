import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { COMPUTER_CONFIG } from '@/models/constants/scene';

export class Computer {
  model: THREE.Group | null = null;
  group: THREE.Group;

  constructor(parent: THREE.Object3D) {
    this.group = new THREE.Group();
    parent.add(this.group);
    this.load();
  }

  async load() {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    try {
      const texture = await textureLoader.loadAsync('/models/baked_computer.jpg');
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;

      const gltf = await loader.loadAsync('/models/computer_setup.glb');
      this.model = gltf.scene;
      
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({ map: texture });
        }
      });

      this.model.scale.set(
        COMPUTER_CONFIG.SCALE,
        COMPUTER_CONFIG.SCALE,
        COMPUTER_CONFIG.SCALE
      );
      this.model.position.set(
        COMPUTER_CONFIG.POSITION.X,
        COMPUTER_CONFIG.POSITION.Y,
        COMPUTER_CONFIG.POSITION.Z
      );
      this.model.rotation.y = 3 * Math.PI / 2;
      
      this.group.add(this.model);
    } catch (error) {
      console.error('Error loading computer model:', error);
    }
  }
}


import * as THREE from 'three';
import { CameraKey } from '@/models/three';
// import { Monkey } from '@/lib/objects/Monkey';
import { Computer } from '@/lib/objects/Computer';
import { SeveranceDeskHub } from '@/lib/objects/SeveranceDeskHub';

export class MonkeyScene {
  scene: THREE.Scene;
  // monkey!: Monkey;
  computer!: Computer;
  deskHub!: SeveranceDeskHub;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  async init() {
    this.createOffice();
    // this.monkey = new Monkey(this.scene);
  }


  createOffice() {
    const officeGroup = new THREE.Group();
    this.scene.add(officeGroup);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(30, 30, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x2d4635, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    officeGroup.add(floor);

    this.deskHub = new SeveranceDeskHub(officeGroup);
  }


  setViewMode(cameraKey: CameraKey) {
    // this.monkey.setViewMode(cameraKey);
    this.deskHub.setViewMode(cameraKey);
  }

  setIsTyping(isTyping: boolean) {
    // this.monkey.setIsTyping(isTyping);
  }

  update(elapsedTime: number) {
    // this.monkey.update(elapsedTime);
  }
}

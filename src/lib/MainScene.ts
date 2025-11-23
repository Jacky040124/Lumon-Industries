import * as THREE from 'three';
import { CameraKey } from '@/models/three';
// import { Monkey } from '@/lib/objects/Monkey';
import { Computer } from '@/lib/objects/Computer';
import { SeveranceDeskHub } from '@/lib/objects/SeveranceDeskHub';
import { SeveranceRoom } from '@/lib/objects/SeveranceRoom';

export class MonkeyScene {
  scene: THREE.Scene;
  // monkey!: Monkey;
  computer!: Computer;
  deskHub!: SeveranceDeskHub;
  room!: SeveranceRoom;

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

    // Create the full room environment
    this.room = new SeveranceRoom(officeGroup);

    // Create the desk hub
    this.deskHub = new SeveranceDeskHub(officeGroup);
  }


  setViewMode(cameraKey: CameraKey) {
    // this.monkey.setViewMode(cameraKey);
    this.deskHub.setViewMode(cameraKey);
  }

  setMonitorInteractivity(enabled: boolean) {
    this.deskHub.setMonitorInteractivity(enabled);
  }

  setMonitorHoverListener(handler: ((hovering: boolean) => void) | null) {
    this.deskHub.setMonitorHoverListener(handler);
  }

  setIsTyping(_isTyping: boolean) {
    // this.monkey.setIsTyping(isTyping);
  }

  update(_elapsedTime: number) {
    // this.monkey.update(elapsedTime);
  }
}

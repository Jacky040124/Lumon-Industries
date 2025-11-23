import * as THREE from 'three';

// Camera Keyframe Types
export const CameraKey = {
  FRONT: 'front',
  BACK_WIDE: 'backWide',
  BACK_CLOSE: 'backClose',
} as const;

export type CameraKey = typeof CameraKey[keyof typeof CameraKey];

export interface CameraKeyframe {
  position: THREE.Vector3;
  focalPoint: THREE.Vector3;
}

// Camera keyframe data
export const keyframes: { [key in CameraKey]: CameraKeyframe } = {
  // Front-of-desk hero shot facing the monkey/dog
  front: {
    position: new THREE.Vector3(0, 4.8, 8.5),
    focalPoint: new THREE.Vector3(0, 1.25, 1.4),
  },
  
  // Over-the-shoulder view from behind the monkey (mid distance)
  backWide: {
    position: new THREE.Vector3(0, 2.9, -2.2),
    focalPoint: new THREE.Vector3(0, 1.45, 1.6),
  },
  
  // Tight over-the-shoulder shot focused on the CRT screen
  backClose: {
    position: new THREE.Vector3(0, 2.1, -0.6),
    focalPoint: new THREE.Vector3(0, 1.5, 1.75),
  },
};

export class CameraKeyframeInstance {
  position: THREE.Vector3;
  focalPoint: THREE.Vector3;
  
  constructor(keyframe: CameraKeyframe) {
    this.position = keyframe.position.clone();
    this.focalPoint = keyframe.focalPoint.clone();
  }
  
  update(_deltaTime: number) {
    // Base class intentionally static - each view is a fixed angle
  }
}

export class FrontKeyframe extends CameraKeyframeInstance {
  constructor() {
    super(keyframes.front);
  }
}

export class BackWideKeyframe extends CameraKeyframeInstance {
  constructor() {
    super(keyframes.backWide);
  }
}

export class BackCloseKeyframe extends CameraKeyframeInstance {
  constructor() {
    super(keyframes.backClose);
  }
}

// Global type declarations
import { ThreeApp } from '@/lib/ThreeApp.tsx';

declare global {
  interface Window {
    threeApp: ThreeApp;
  }
}

export {};


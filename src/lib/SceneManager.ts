import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import { ThreeRendererManager } from '@/lib/ThreeRenderer';
import { MonkeyScene } from '@/lib/MainScene';
import { 
  CameraKey, 
  CameraKeyframeInstance,
  FrontKeyframe,
  BackWideKeyframe,
  BackCloseKeyframe
} from '@/models/three';

const CAMERA_UP = new THREE.Vector3(0, 1, 0);

export class ThreeSceneManager {
  rendererManager: ThreeRendererManager;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  cssScene: THREE.Scene;
  controls: OrbitControls;
  
  monkeyScene: MonkeyScene;
  
  currentKeyframe: CameraKey | undefined = CameraKey.FRONT;
  targetKeyframe: CameraKey | undefined = undefined;
  keyframeInstances: { [key in CameraKey]: CameraKeyframeInstance };
  cameraPosition: THREE.Vector3;
  cameraFocalPoint: THREE.Vector3;
  cameraOrientation: THREE.Quaternion;
  keyframeOrientations: { [key in CameraKey]: THREE.Quaternion };
  lookAtMatrix: THREE.Matrix4 = new THREE.Matrix4();
  
  devMode: boolean = true;
  pressedKeys: Set<string> = new Set();
  cameraMoveSpeed: number = 0.1;
  
  isRunning: boolean = false;
  clock: THREE.Clock;
  animationFrameId: number | null = null;

  constructor(
    container: HTMLElement, 
    cssContainer: HTMLElement
  ) {
    this.rendererManager = new ThreeRendererManager(container, cssContainer);
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f7f7f5');
    this.cssScene = new THREE.Scene();
    
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
    this.camera.up.copy(CAMERA_UP);
    
    this.keyframeInstances = {
      [CameraKey.FRONT]: new FrontKeyframe(),
      [CameraKey.BACK_WIDE]: new BackWideKeyframe(),
      [CameraKey.BACK_CLOSE]: new BackCloseKeyframe(),
    };

    this.keyframeOrientations = {
      [CameraKey.FRONT]: new THREE.Quaternion(),
      [CameraKey.BACK_WIDE]: new THREE.Quaternion(),
      [CameraKey.BACK_CLOSE]: new THREE.Quaternion(),
    };
    (Object.values(CameraKey) as CameraKey[]).forEach((key) => this.updateKeyframeOrientation(key));
    
    this.cameraPosition = this.keyframeInstances[CameraKey.FRONT].position.clone();
    this.cameraFocalPoint = this.keyframeInstances[CameraKey.FRONT].focalPoint.clone();
    this.cameraOrientation = this.keyframeOrientations[CameraKey.FRONT].clone();
    
    this.camera.position.copy(this.cameraPosition);
    this.camera.quaternion.copy(this.cameraOrientation);

    this.controls = new OrbitControls(this.camera, this.rendererManager.webglRenderer.domElement);
    this.controls.enabled = this.devMode;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    if (this.devMode) {
      this.controls.target.copy(this.cameraFocalPoint);
      this.controls.update();
    }
    
    this.setupLights();
    
    this.monkeyScene = new MonkeyScene(this.scene);
    this.monkeyScene.setViewMode(this.currentKeyframe || CameraKey.FRONT);
    
    this.setupEventListeners(container);
    
    this.clock = new THREE.Clock();
    this.start();
    
    window.addEventListener('resize', this.handleResize);
  }
  
  setupEventListeners(_container: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('#root')) {
        return;
      }
      
      if (this.devMode) {
        return;
      }
      
      event.preventDefault();
      console.log('Click detected, cycling view');
      this.cycleView();
    };
    
    document.addEventListener('mousedown', handleClick);
    this.handleClick = handleClick;
    this.setupKeyboardControls();
  }
  
  private handleClick?: (e: MouseEvent) => void;
  
  setupKeyboardControls() {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.devMode) return;
      
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (keys.includes(event.key)) {
        event.preventDefault();
        this.pressedKeys.add(event.key.toLowerCase());
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!this.devMode) return;
      
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (keys.includes(event.key)) {
        event.preventDefault();
        this.pressedKeys.delete(event.key.toLowerCase());
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    this.handleKeyDown = handleKeyDown;
    this.handleKeyUp = handleKeyUp;
  }
  
  private handleKeyDown?: (e: KeyboardEvent) => void;
  private handleKeyUp?: (e: KeyboardEvent) => void;
  
  updateCameraMovement() {
    if (!this.devMode) return;
    
    const moveVector = new THREE.Vector3();
    const speed = this.cameraMoveSpeed;
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    
    if (this.pressedKeys.has('arrowup') || this.pressedKeys.has('w')) {
      moveVector.add(forward.clone().multiplyScalar(speed));
    }
    if (this.pressedKeys.has('arrowdown') || this.pressedKeys.has('s')) {
      moveVector.add(forward.clone().multiplyScalar(-speed));
    }
    if (this.pressedKeys.has('arrowleft') || this.pressedKeys.has('a')) {
      moveVector.add(right.clone().multiplyScalar(-speed));
    }
    if (this.pressedKeys.has('arrowright') || this.pressedKeys.has('d')) {
      moveVector.add(right.clone().multiplyScalar(speed));
    }
    
    if (moveVector.length() > 0) {
      this.camera.position.add(moveVector);
      this.controls.target.add(moveVector);
      this.controls.update();
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.5);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);
  }

  private updateKeyframeOrientation(key: CameraKey) {
    const instance = this.keyframeInstances[key];
    const orientation = this.keyframeOrientations[key];
    this.lookAtMatrix.lookAt(instance.position, instance.focalPoint, CAMERA_UP);
    orientation.setFromRotationMatrix(this.lookAtMatrix);
  }

  transitionTo(key: CameraKey, duration: number = 1500) {
    if (this.currentKeyframe === key) {
      console.log(`Already at ${key}, skipping transition`);
      return;
    }
    
    const targetKeyframe = this.keyframeInstances[key];
    
    console.log(`[TRANSITION] Starting: ${this.currentKeyframe} → ${key}`);
    console.log(`[TRANSITION] Current pos:`, this.cameraPosition.toArray());
    console.log(`[TRANSITION] Target pos:`, targetKeyframe.position.toArray());
    
    if (this.targetKeyframe) {
      TWEEN.removeAll();
    }
    
    this.currentKeyframe = undefined;
    this.targetKeyframe = key;

    const startOrientation = this.cameraOrientation.clone();
    const targetOrientation = this.keyframeOrientations[key].clone();
    const orientationState = { t: 0 };
    
    const posTween = new TWEEN.Tween(this.cameraPosition)
      .to(targetKeyframe.position, duration)
      .easing(TWEEN.Easing.Quintic.InOut)
      .onComplete(() => {
        console.log(`[TRANSITION] Complete! Now at ${key}`);
        this.currentKeyframe = key;
        this.targetKeyframe = undefined;
        this.monkeyScene.setViewMode(key);
      });
    
    const focTween = new TWEEN.Tween(this.cameraFocalPoint)
      .to(targetKeyframe.focalPoint, duration)
      .easing(TWEEN.Easing.Quintic.InOut);

    const orientationTween = new TWEEN.Tween(orientationState)
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Quintic.InOut)
      .onUpdate(() => {
        this.cameraOrientation.copy(startOrientation).slerp(targetOrientation, orientationState.t);
      })
      .onComplete(() => {
        this.cameraOrientation.copy(targetOrientation);
      });
      
    posTween.start();
    focTween.start();
    orientationTween.start();
      
    console.log('[TRANSITION] Tweens started:', posTween, focTween, orientationTween);
  }
  
  cycleView() {
    if (this.devMode) {
      return;
    }
    
    const keyframeToUse = this.targetKeyframe || this.currentKeyframe || CameraKey.FRONT;
    
    const viewCycle = [CameraKey.FRONT, CameraKey.BACK_WIDE, CameraKey.BACK_CLOSE];
    const currentIndex = viewCycle.indexOf(keyframeToUse);
    const nextIndex = (currentIndex + 1) % viewCycle.length;
    console.log(`Camera transitioning: ${keyframeToUse} → ${viewCycle[nextIndex]}`);
    this.transitionTo(viewCycle[nextIndex]);
  }
  
  setDevMode(enabled: boolean) {
    this.devMode = enabled;
    this.controls.enabled = enabled;
    
    if (enabled) {
      this.controls.target.copy(this.cameraFocalPoint);
      this.controls.update();
      console.log('Dev mode enabled - free camera control (Arrow keys/WASD to move)');
    } else {
      this.pressedKeys.clear();
      
      if (this.currentKeyframe) {
        this.cameraPosition.copy(this.keyframeInstances[this.currentKeyframe].position);
        this.cameraFocalPoint.copy(this.keyframeInstances[this.currentKeyframe].focalPoint);
        this.cameraOrientation.copy(this.keyframeOrientations[this.currentKeyframe]);
        this.camera.position.copy(this.cameraPosition);
        this.camera.quaternion.copy(this.cameraOrientation);
      }
      console.log('Dev mode disabled - keyframe control restored');
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  animate = () => {
    if (!this.isRunning) {
      console.error('Animation loop stopped!');
      return;
    }

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    TWEEN.update();
    
    if (this.targetKeyframe && Math.random() < 0.05) {
      console.log('[ANIMATE] Transitioning to:', this.targetKeyframe);
      console.log('[ANIMATE] Camera pos:', this.cameraPosition.toArray());
    }

    for (const key in this.keyframeInstances) {
      const _key = key as CameraKey;
      this.keyframeInstances[_key].update(deltaTime);
      this.updateKeyframeOrientation(_key);
    }

    if (this.currentKeyframe) {
      this.cameraPosition.copy(this.keyframeInstances[this.currentKeyframe].position);
      this.cameraFocalPoint.copy(this.keyframeInstances[this.currentKeyframe].focalPoint);
      this.cameraOrientation.copy(this.keyframeOrientations[this.currentKeyframe]);
    }

    this.monkeyScene.update(elapsedTime);
    
    if (this.devMode) {
      this.updateCameraMovement();
      this.controls.update();
    } else {
      this.camera.position.copy(this.cameraPosition);
      this.camera.quaternion.copy(this.cameraOrientation);
      this.camera.up.copy(CAMERA_UP);
    }
    
    if (this.targetKeyframe && Math.random() < 0.05) {
      console.log('[ANIMATE] Camera actual pos:', this.camera.position.toArray());
    }

    this.rendererManager.render(this.scene, this.cssScene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  handleResize = () => {
    if (!this.rendererManager.webglRenderer.domElement.parentElement) return;
    
    const container = this.rendererManager.webglRenderer.domElement.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.rendererManager.resize(width, height);
  };

  dispose() {
    console.log('Disposing ThreeSceneManager...');
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    
    if (this.handleClick) {
      document.removeEventListener('mousedown', this.handleClick);
    }
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    if (this.handleKeyUp) {
      document.removeEventListener('keyup', this.handleKeyUp);
    }
    this.controls.dispose();
    this.rendererManager.dispose();
    TWEEN.removeAll();
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
    console.log('ThreeSceneManager disposed');
  }
}


import { createRoot } from 'react-dom/client';
import { ThreeSceneManager } from '@/lib/SceneManager';
import TypingOS from '@/components/typing/TypingOS';
import type { TypingState } from '@/models/typing';

export class ThreeApp {
  sceneManager: ThreeSceneManager | null = null;
  typingOSRoot: any = null;
  
  typingState: TypingState = {
    isTyping: false,
    typingStream: '',
    collection: [],
    elapsedTime: 0,
    highlightedRanges: [],
  };
  
  constructor() {
    this.init();
  }
  
  init() {
    const webglContainer = document.getElementById('three-webgl');
    const cssContainer = document.getElementById('three-css');
    const typingContainer = document.getElementById('three-typing-container');
    
    if (!webglContainer || !cssContainer || !typingContainer) {
      throw new Error('Element not found');
    }
    
    this.sceneManager = new ThreeSceneManager(
      webglContainer,
      cssContainer
    );
    
    this.renderTypingOS();
  }
  
  renderTypingOS() {
    const container = document.getElementById('three-typing-container');
    if (!container) return;
    
    if (!this.typingOSRoot) {
      this.typingOSRoot = createRoot(container);
    }
    
    this.typingOSRoot.render(
      <TypingOS 
        {...this.typingState}
        lines={[]}
        pageStart={0}
        charsPerLine={80}
      />
    );
  }
  
  updateTypingState(newState: Partial<TypingState>) {
    this.typingState = { ...this.typingState, ...newState };
    this.renderTypingOS();
    
    if (this.sceneManager) {
      this.sceneManager.monkeyScene.setIsTyping(this.typingState.isTyping);
    }
  }
  
  toggleDevMode() {
    if (this.sceneManager) {
      this.sceneManager.setDevMode(!this.sceneManager.devMode);
      return this.sceneManager.devMode;
    }
    return false;
  }
  
  getDevMode() {
    return this.sceneManager?.devMode ?? false;
  }
  
  destroy() {
    if (this.typingOSRoot) {
      this.typingOSRoot.unmount();
    }
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }
  }
}

let threeAppInstance: ThreeApp | null = null;

export function getThreeApp(): ThreeApp {
  if (!threeAppInstance) {
    threeAppInstance = new ThreeApp();
  }
  return threeAppInstance;
}


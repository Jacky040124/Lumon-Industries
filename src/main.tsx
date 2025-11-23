import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { getThreeApp } from '@/lib/ThreeApp.tsx'

// 1. Initialize Three.js app (vanilla) - matches portfolio pattern
const threeApp = getThreeApp();

// 2. Expose to window for React to access
declare global {
  interface Window {
    threeApp: ReturnType<typeof getThreeApp>;
  }
}
window.threeApp = threeApp;

// 3. Initialize React app (UI only)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

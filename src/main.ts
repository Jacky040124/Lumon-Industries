import './index.css'
import './App.css'
import { getThreeApp } from '@/lib/ThreeApp'
import { OverlayController } from '@/ui/OverlayController'

const threeApp = getThreeApp()

declare global {
  interface Window {
    threeApp: ReturnType<typeof getThreeApp>
  }
}
window.threeApp = threeApp

const root = document.getElementById('root')
if (!root) {
  throw new Error('#root element not found')
}

const overlay = new OverlayController(root, {
  threeApp,
  repoUrl: 'https://github.com/Jacky040124/typer-monkey',
  repoName: 'typer-monkey',
})
overlay.init()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    overlay.destroy()
  })
}

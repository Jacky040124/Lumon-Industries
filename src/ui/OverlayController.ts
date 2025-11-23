import { ThreeApp } from '@/lib/ThreeApp'
import { GitHubStarButton } from '@/ui/GitHubStarButton'
import { MusicPlayerWidget } from '@/ui/MusicPlayerWidget'

interface OverlayControllerOptions {
  threeApp: ThreeApp
  repoUrl: string
  repoName: string
}

export class OverlayController {
  private overlayElement: HTMLDivElement | null = null
  private headerElement: HTMLDivElement | null = null
  private devButton: HTMLButtonElement | null = null
  private devMode = false
  private musicPlayer = new MusicPlayerWidget()
  private gitHubButton: GitHubStarButton
  private mountNode: HTMLElement
  private options: OverlayControllerOptions

  constructor(mountNode: HTMLElement, options: OverlayControllerOptions) {
    this.mountNode = mountNode
    this.options = options
    this.gitHubButton = new GitHubStarButton(options.repoUrl, options.repoName)
  }

  init() {
    this.devMode = this.options.threeApp.getDevMode()
    this.render()
  }

  destroy() {
    this.musicPlayer.destroy()
    this.gitHubButton.destroy()

    if (this.overlayElement && this.overlayElement.parentElement === this.mountNode) {
      this.mountNode.removeChild(this.overlayElement)
    }

    this.overlayElement = null
    this.headerElement = null
    this.devButton = null
  }

  private render() {
    this.overlayElement = document.createElement('div')
    this.overlayElement.className = 'minimal-overlay'

    this.devButton = this.createDevButton()

    this.headerElement = document.createElement('div')
    this.headerElement.className = 'header-controls'
    this.headerElement.appendChild(this.gitHubButton.element)
    this.headerElement.appendChild(this.devButton)

    this.overlayElement.appendChild(this.musicPlayer.element)
    this.overlayElement.appendChild(this.headerElement)

    this.mountNode.replaceChildren(this.overlayElement)
    this.syncUiState()
  }

  private syncUiState() {
    this.musicPlayer.setEnabled(!this.devMode)
    if (this.devButton) {
      this.updateDevButtonStyle(this.devButton, this.devMode)
      this.devButton.textContent = this.devMode ? 'Dev Mode ON' : 'Dev Mode'
    }
  }

  private createDevButton() {
    const button = document.createElement('button')
    button.type = 'button'
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.handleToggleDevMode()
    })
    button.addEventListener('mouseenter', () => {
      if (!this.devMode) {
        button.style.background = '#f5f5f5'
        button.style.borderColor = '#d0d0d0'
      }
    })
    button.addEventListener('mouseleave', () => {
      if (!this.devMode) {
        button.style.background = '#fff'
        button.style.borderColor = '#e0e0e0'
      }
    })

    Object.assign(button.style, {
      padding: '0.5rem 0.875rem',
      fontSize: '0.875rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      fontFamily: 'inherit',
      height: '40px',
      lineHeight: '1',
      borderWidth: '1px',
      borderStyle: 'solid',
    } satisfies Partial<CSSStyleDeclaration>)

    return button
  }

  private updateDevButtonStyle(button: HTMLButtonElement, isDevMode: boolean) {
    if (isDevMode) {
      button.style.backgroundColor = '#4caf50'
      button.style.color = '#fff'
      button.style.borderColor = '#4caf50'
    } else {
      button.style.backgroundColor = '#fff'
      button.style.color = '#1a1a1a'
      button.style.borderColor = '#e0e0e0'
    }
  }

  private handleToggleDevMode() {
    const nextState = this.options.threeApp.toggleDevMode()
    this.devMode = nextState
    this.syncUiState()
  }
}

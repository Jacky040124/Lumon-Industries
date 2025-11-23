const applyStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, styles)
}

const AUDIO_SOURCE = '/background_music.mp3'

export class MusicPlayerWidget {
  readonly element: HTMLDivElement
  private audio: HTMLAudioElement
  private indicator: HTMLDivElement
  private statusText: HTMLSpanElement
  private toggleButton: HTMLButtonElement
  private errorLabel: HTMLSpanElement
  private isPlaying = true
  private isEnabled = true
  private interactionCleanup?: () => void

  constructor() {
    this.element = document.createElement('div')
    this.element.addEventListener('click', (event) => event.stopPropagation())
    this.element.addEventListener('mousedown', (event) => event.stopPropagation())
    this.element.addEventListener('touchstart', (event) => event.stopPropagation())
    applyStyles(this.element, {
      position: 'fixed',
      top: '12px',
      left: '12px',
      zIndex: '10000',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 16px',
      borderRadius: '8px',
      color: '#1a1a1a',
      backdropFilter: 'blur(8px)',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      pointerEvents: 'auto',
    })

    const statusWrapper = document.createElement('div')
    statusWrapper.style.display = 'flex'
    statusWrapper.style.alignItems = 'center'
    statusWrapper.style.gap = '8px'

    this.indicator = document.createElement('div')
    applyStyles(this.indicator, {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
    })

    this.statusText = document.createElement('span')
    applyStyles(this.statusText, {
      fontWeight: '500',
      fontSize: '13px',
    })

    statusWrapper.appendChild(this.indicator)
    statusWrapper.appendChild(this.statusText)

    this.audio = document.createElement('audio')
    this.audio.src = AUDIO_SOURCE
    this.audio.loop = true
    this.audio.preload = 'auto'

    this.errorLabel = document.createElement('span')
    this.errorLabel.style.color = '#d32f2f'
    this.errorLabel.style.fontSize = '12px'
    this.errorLabel.style.marginLeft = '8px'
    this.errorLabel.style.display = 'none'

    const divider = document.createElement('div')
    applyStyles(divider, {
      width: '1px',
      height: '16px',
      background: '#e0e0e0',
    })

    this.toggleButton = document.createElement('button')
    this.toggleButton.type = 'button'
    this.toggleButton.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.togglePlayback()
    })
    this.toggleButton.addEventListener('mouseenter', () => {
      this.toggleButton.style.background = '#f5f5f5'
    })
    this.toggleButton.addEventListener('mouseleave', () => {
      this.toggleButton.style.background = 'transparent'
    })
    applyStyles(this.toggleButton, {
      background: 'transparent',
      border: 'none',
      color: '#1a1a1a',
      cursor: 'pointer',
      fontSize: '13px',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      pointerEvents: 'auto',
      position: 'relative',
      zIndex: '10001',
    })

    this.element.appendChild(statusWrapper)
    this.element.appendChild(this.audio)
    this.element.appendChild(this.errorLabel)
    this.element.appendChild(divider)
    this.element.appendChild(this.toggleButton)

    this.bindAudioEvents()
    this.setupInteractionRetry()
    this.audio.load()
    this.applyPlaybackState()
  }

  setEnabled(enabled: boolean) {
    if (this.isEnabled === enabled) {
      return
    }
    this.isEnabled = enabled
    this.element.style.display = enabled ? 'flex' : 'none'
    this.applyPlaybackState()
  }

  private bindAudioEvents() {
    this.audio.addEventListener('canplay', this.handleAudioCanPlay)
    this.audio.addEventListener('error', this.handleAudioError)
  }

  private unbindAudioEvents() {
    this.audio.removeEventListener('canplay', this.handleAudioCanPlay)
    this.audio.removeEventListener('error', this.handleAudioError)
  }

  private handleAudioCanPlay = () => {
    this.errorLabel.style.display = 'none'
    this.errorLabel.textContent = ''
  }

  private handleAudioError = () => {
    const error = this.audio.error
    let errorMsg = 'Unknown error'

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMsg = 'Audio loading aborted'
          break
        case error.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error loading audio'
          break
        case error.MEDIA_ERR_DECODE:
          errorMsg = 'Audio decode error'
          break
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Audio format not supported or file not found'
          break
        default:
          errorMsg = 'Audio playback error'
      }
    }

    this.errorLabel.textContent = `Error: ${errorMsg}`
    this.errorLabel.style.display = 'inline'
    console.error('[MusicPlayer] Audio error:', errorMsg, error)
  }

  private setupInteractionRetry() {
    const handleInteraction = () => {
      if (this.isPlaying && this.audio.paused) {
        this.audio.play().catch((error) => {
          console.error('[MusicPlayer] Autoplay retry failed', error)
        })
      }
    }

    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('keydown', handleInteraction, { once: true })

    this.interactionCleanup = () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }

  private togglePlayback() {
    this.isPlaying = !this.isPlaying
    this.applyPlaybackState()
  }

  private applyPlaybackState() {
    this.updateUiState()

    if (!this.isEnabled) {
      this.audio.pause()
      this.audio.currentTime = 0
      return
    }

    if (this.isPlaying) {
      const playPromise = this.audio.play()
      if (playPromise) {
        playPromise.catch((error) => {
          console.error('[MusicPlayer] Audio play failed (likely autoplay policy):', error)
        })
      }
    } else {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  private updateUiState() {
    this.indicator.style.backgroundColor = this.isPlaying ? '#4caf50' : '#e0e0e0'
    this.indicator.style.boxShadow = this.isPlaying ? '0 0 8px #4caf50' : 'none'
    this.statusText.textContent = this.isPlaying ? 'Playing' : 'Paused'
    this.toggleButton.textContent = this.isPlaying ? 'Stop' : 'Play'
  }

  destroy() {
    this.unbindAudioEvents()
    this.interactionCleanup?.()
    this.audio.pause()
    this.audio.currentTime = 0
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element)
    }
  }
}

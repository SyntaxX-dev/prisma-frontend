// YouTube IFrame Player API Type Definitions
// https://developers.google.com/youtube/iframe_api_reference

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    controls?: 0 | 1
    enablejsapi?: 0 | 1
    fs?: 0 | 1
    modestbranding?: 0 | 1
    rel?: 0 | 1
    showinfo?: 0 | 1
    start?: number
    end?: number
    mute?: 0 | 1
    loop?: 0 | 1
    playlist?: string
  }

  interface PlayerOptions {
    width?: string | number
    height?: string | number
    videoId?: string
    playerVars?: PlayerVars
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onPlaybackQualityChange?: (event: PlayerEvent) => void
      onPlaybackRateChange?: (event: PlayerEvent) => void
      onError?: (event: OnErrorEvent) => void
      onApiChange?: (event: PlayerEvent) => void
    }
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: PlayerState
  }

  interface OnErrorEvent extends PlayerEvent {
    data: number
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)

    // Playback controls
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    clearVideo(): void

    // Playback status
    getPlayerState(): PlayerState
    getCurrentTime(): number
    getDuration(): number
    getVideoUrl(): string
    getVideoEmbedCode(): string

    // Playback rate
    getPlaybackRate(): number
    setPlaybackRate(suggestedRate: number): void
    getAvailablePlaybackRates(): number[]

    // Volume
    mute(): void
    unMute(): void
    isMuted(): boolean
    setVolume(volume: number): void
    getVolume(): number

    // Video information
    getVideoLoadedFraction(): number
    getPlaylist(): string[]
    getPlaylistIndex(): number

    // Playlist controls
    nextVideo(): void
    previousVideo(): void
    playVideoAt(index: number): void

    // Video loading
    cueVideoById(videoId: string, startSeconds?: number): void
    loadVideoById(videoId: string, startSeconds?: number): void
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number): void
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number): void

    // Player sizing
    setSize(width: number, height: number): void

    // Player destruction
    destroy(): void
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady?: () => void
}

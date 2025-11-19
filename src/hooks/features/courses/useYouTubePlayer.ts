'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { saveVideoTimestamp } from '@/api/progress/save-video-timestamp'
import { getInProgressVideos } from '@/api/progress/get-in-progress-videos'

interface UseYouTubePlayerProps {
  youtubeId: string
  videoId: string
  containerId: string
  onVideoEnd?: () => void
  onPlay?: () => void
  onPause?: () => void
}

export function useYouTubePlayer({
  youtubeId,
  videoId,
  containerId,
  onVideoEnd,
  onPlay,
  onPause,
}: UseYouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedTimeRef = useRef(0)

  // Debug: Log dos parâmetros recebidos
  useEffect(() => {
    // Parâmetros recebidos
  }, [youtubeId, videoId, containerId])

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      return
    }

    // Load script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  // Fetch saved progress and initialize player
  useEffect(() => {
    if (!youtubeId || !videoId) return

    let mounted = true

    const initPlayer = async () => {
      try {
        // Fetch saved progress
        const response = await getInProgressVideos()
        const savedProgress = response.data.videos.find(
          (v) => v.videoId === youtubeId,
        )
        const startSeconds = savedProgress?.currentTimestamp || 0

        // Wait for YT API to be ready
        const waitForYT = () => {
          return new Promise<void>((resolve) => {
            if (window.YT && window.YT.Player) {
              resolve()
            } else {
              window.onYouTubeIframeAPIReady = () => {
                resolve()
              }
            }
          })
        }

        await waitForYT()

        if (!mounted) return

        // Destroy existing player
        if (playerRef.current) {
          playerRef.current.destroy()
        }

        // Create new player
        playerRef.current = new YT.Player(containerId, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            start: Math.floor(startSeconds),
          },
          events: {
            onReady: handlePlayerReady,
            onStateChange: handleStateChange,
            onError: handleError,
          },
        })
      } catch (error) {
      }
    }

    initPlayer()

    return () => {
      mounted = false
      stopProgressTracking()
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [youtubeId, videoId, containerId])

  // Player event handlers
  const handlePlayerReady = useCallback((event: YT.PlayerEvent) => {
    setIsReady(true)
    setDuration(event.target.getDuration())
  }, [])

  const handleStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      const state = event.data

      switch (state) {
        case YT.PlayerState.PLAYING:
          setIsPlaying(true)
          startProgressTracking()
          onPlay?.()
          break

        case YT.PlayerState.PAUSED:
          setIsPlaying(false)
          stopProgressTracking()
          saveCurrentProgress()
          onPause?.()
          break

        case YT.PlayerState.ENDED:
          setIsPlaying(false)
          stopProgressTracking()
          onVideoEnd?.()
          break

        case YT.PlayerState.BUFFERING:
          break
      }
    },
    [onPlay, onPause, onVideoEnd],
  )

  const handleError = useCallback((event: YT.OnErrorEvent) => {
  }, [])

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Save progress every 5 seconds
    progressIntervalRef.current = setInterval(() => {
      saveCurrentProgress()
    }, 5000)

  }, [])

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const saveCurrentProgress = useCallback(async () => {
    if (!playerRef.current || !videoId) {
      return
    }

    try {
      const currentTime = Math.floor(playerRef.current.getCurrentTime())
      const duration = Math.floor(playerRef.current.getDuration())

      // Avoid saving if time hasn't changed significantly
      if (Math.abs(currentTime - lastSavedTimeRef.current) < 3) {
        return
      }

      // Don't save if at the very end (will be marked as completed instead)
      if (duration > 0 && currentTime >= duration - 2) {
        return
      }

      await saveVideoTimestamp({
        videoId: youtubeId,
        timestamp: currentTime,
      })

      lastSavedTimeRef.current = currentTime
      setCurrentTime(currentTime)
    } catch (error) {
    }
  }, [videoId, youtubeId])

  // Save progress before leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        playerRef.current &&
        playerRef.current.getPlayerState() === YT.PlayerState.PLAYING
      ) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime())

        // Use sendBeacon to ensure request is sent
        const blob = new Blob(
          [JSON.stringify({ videoId: youtubeId, timestamp: currentTime })],
          { type: 'application/json' },
        )

        const token = localStorage.getItem('auth_token')
        const url = `${process.env.NEXT_PUBLIC_API_URL}/progress/video/timestamp`

        navigator.sendBeacon(url, blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [youtubeId])

  // Public controls
  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
  }, [])

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return

    const state = playerRef.current.getPlayerState()
    if (state === YT.PlayerState.PLAYING) {
      pause()
    } else {
      play()
    }
  }, [play, pause])

  return {
    player: playerRef.current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    togglePlay,
  }
}

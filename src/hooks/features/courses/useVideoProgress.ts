'use client'

import { useEffect, useRef } from 'react'
import { saveVideoTimestamp } from '@/api/progress/save-video-timestamp'

interface UseVideoProgressProps {
  youtubeId: string | undefined
  isPlaying: boolean
}

export function useVideoProgress({ youtubeId, isPlaying }: UseVideoProgressProps) {
  const playerRef = useRef<any>(null)
  const lastSavedTimeRef = useRef(0)

  // Inicializar YouTube IFrame API
  useEffect(() => {
    if (!youtubeId) return

    // Resetar player ref ao trocar de vídeo
    playerRef.current = null

    // Carregar YouTube IFrame API se ainda não foi carregado
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Aguardar API estar pronta e encontrar o iframe
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const iframeId = document.querySelector('iframe[data-video-iframe]') as HTMLIFrameElement

        if (iframeId) {
          try {
            playerRef.current = new window.YT.Player(iframeId, {
              events: {
                onReady: () => {},
                onStateChange: () => {}
              }
            })
          } catch (error) {
          }
        }
      }
    }

    // Tentar várias vezes até conectar
    let attempts = 0
    const maxAttempts = 5
    const interval = setInterval(() => {
      attempts++

      if (playerRef.current || attempts >= maxAttempts) {
        clearInterval(interval)
      } else {
        initPlayer()
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [youtubeId])

  // Salvar ao pausar (quando isPlaying muda de true para false)
  const prevIsPlayingRef = useRef(false)
  useEffect(() => {
    if (prevIsPlayingRef.current && !isPlaying) {
      saveProgress()
    }
    prevIsPlayingRef.current = isPlaying
  }, [isPlaying])

  // Salvar ao sair da página (troca de aba, fechar aba/navegador)
  useEffect(() => {
    if (!youtubeId) return

    const saveBeforeLeave = () => {
      if (!playerRef.current) return

      try {
        if (typeof playerRef.current.getCurrentTime !== 'function') return

        const currentTime = Math.floor(playerRef.current.getCurrentTime())
        const duration = Math.floor(playerRef.current.getDuration())

        if (Math.abs(currentTime - lastSavedTimeRef.current) < 3) return
        if (duration > 0 && currentTime >= duration - 2) return

        const token = localStorage.getItem('auth_token')
        const url = `${process.env.NEXT_PUBLIC_API_URL}/progress/video/timestamp`

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ videoId: youtubeId, timestamp: currentTime }),
          keepalive: true,
        }).catch(() => {})

        lastSavedTimeRef.current = currentTime
      } catch {
        // Player pode já ter sido destruído
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveBeforeLeave()
      }
    }

    const handleBeforeUnload = () => {
      saveBeforeLeave()
    }

    const handlePageHide = () => {
      saveBeforeLeave()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [youtubeId])

  const saveProgress = async () => {
    if (!youtubeId) return
    if (!playerRef.current) return

    try {
      if (typeof playerRef.current.getCurrentTime !== 'function') return

      let currentTime = 0
      let duration = 0

      try {
        currentTime = Math.floor(playerRef.current.getCurrentTime())
        duration = Math.floor(playerRef.current.getDuration())
      } catch (e) {
        return
      }

      if (currentTime === 0 && duration > 0) return
      if (currentTime > 0 && Math.abs(currentTime - lastSavedTimeRef.current) < 3) return
      if (duration > 0 && currentTime >= duration - 2) return

      await saveVideoTimestamp({
        videoId: youtubeId,
        timestamp: currentTime,
      })

      lastSavedTimeRef.current = currentTime
    } catch (error) {
    }
  }

  return {
    saveProgress,
  }
}

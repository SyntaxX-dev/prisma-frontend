'use client'

import { useEffect, useRef } from 'react'
import { saveVideoTimestamp } from '@/api/progress/save-video-timestamp'

interface UseVideoProgressProps {
  youtubeId: string | undefined
  isPlaying: boolean
}

export function useVideoProgress({ youtubeId, isPlaying }: UseVideoProgressProps) {
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
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
        // Encontrar o iframe do YouTube pelo ID
        const iframeId = document.querySelector('iframe[data-video-iframe]') as HTMLIFrameElement

        if (iframeId) {
          try {
            // Criar referência ao player usando o iframe existente
            playerRef.current = new window.YT.Player(iframeId, {
              events: {
                onReady: (event: any) => {
                },
                onStateChange: (event: any) => {
                }
              }
            })
          } catch (error) {
          }
        } else {
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
        if (!playerRef.current) {
        }
      } else {
        initPlayer()
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [youtubeId])

  // Controlar salvamento de progresso
  useEffect(() => {
    if (!youtubeId || !isPlaying) {
      stopProgressTracking()
      return
    }

    startProgressTracking()

    return () => {
      stopProgressTracking()
    }
  }, [youtubeId, isPlaying])

  const startProgressTracking = () => {
    // Limpar interval anterior
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Salvar progresso a cada 5 segundos
    progressIntervalRef.current = setInterval(() => {
      saveProgress()
    }, 5000)

  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const saveProgress = async () => {
    if (!youtubeId) {
      return
    }

    if (!playerRef.current) {
      return
    }

    try {
      // Verificar se o player tem os métodos necessários
      if (typeof playerRef.current.getCurrentTime !== 'function') {
        return
      }

      // Obter tempo atual do player
      let currentTime = 0
      let duration = 0

      try {
        currentTime = Math.floor(playerRef.current.getCurrentTime())
        duration = Math.floor(playerRef.current.getDuration())
      } catch (e) {
        return
      }

      // Se tempo ainda é 0, pode ser que o vídeo não tenha iniciado ainda
      if (currentTime === 0 && duration > 0) {
        return
      }

      // Verificar se mudou significativamente
      if (currentTime > 0 && Math.abs(currentTime - lastSavedTimeRef.current) < 3) {
        return
      }

      // Não salvar se estiver no final
      if (duration > 0 && currentTime >= duration - 2) {
        return
      }

      // Salvar no backend
      const response = await saveVideoTimestamp({
        videoId: youtubeId,
        timestamp: currentTime,
      })


      lastSavedTimeRef.current = currentTime

      const progressPercent: string = duration > 0 ? ((currentTime / duration) * 100).toFixed(1) : '0'
    } catch (error) {
    }
  }

  return {
    saveProgress, // Expor para poder chamar manualmente
  }
}

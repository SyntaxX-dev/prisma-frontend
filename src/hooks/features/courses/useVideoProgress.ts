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

    console.log('[Video Progress] 🎬 Inicializando para vídeo:', youtubeId)

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
                  console.log('[Video Progress] ✅ Player pronto!')
                },
                onStateChange: (event: any) => {
                  console.log('[Video Progress] 🔄 Estado mudou:', event.data)
                }
              }
            })
            console.log('[Video Progress] ✅ Player conectado ao iframe existente')
          } catch (error) {
            console.error('[Video Progress] ❌ Erro ao conectar player:', error)
          }
        } else {
          console.warn('[Video Progress] ⚠️ Iframe não encontrado')
        }
      }
    }

    // Tentar várias vezes até conectar
    let attempts = 0
    const maxAttempts = 5
    const interval = setInterval(() => {
      attempts++
      console.log(`[Video Progress] 🔍 Tentativa ${attempts}/${maxAttempts}`)

      if (playerRef.current || attempts >= maxAttempts) {
        clearInterval(interval)
        if (!playerRef.current) {
          console.error('[Video Progress] ❌ Falhou ao conectar após', maxAttempts, 'tentativas')
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

    console.log('[Video Progress] ▶️ Vídeo tocando, iniciando rastreamento')
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

    console.log('[Video Progress] 🔄 Rastreamento iniciado (5s)')
  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
      console.log('[Video Progress] ⏹️ Rastreamento pausado')
    }
  }

  const saveProgress = async () => {
    if (!youtubeId) {
      console.log('[Video Progress] ⚠️ youtubeId ausente')
      return
    }

    if (!playerRef.current) {
      console.log('[Video Progress] ⚠️ Player ausente')
      return
    }

    try {
      // Verificar se o player tem os métodos necessários
      if (typeof playerRef.current.getCurrentTime !== 'function') {
        console.error('[Video Progress] ❌ Player não tem getCurrentTime()')
        return
      }

      // Obter tempo atual do player
      let currentTime = 0
      let duration = 0

      try {
        currentTime = Math.floor(playerRef.current.getCurrentTime())
        duration = Math.floor(playerRef.current.getDuration())
      } catch (e) {
        console.error('[Video Progress] ❌ Erro ao obter tempo:', e)
        return
      }

      console.log('[Video Progress] 📊 Tempo atual:', {
        currentTime,
        duration,
        lastSaved: lastSavedTimeRef.current,
        diff: Math.abs(currentTime - lastSavedTimeRef.current),
      })

      // Se tempo ainda é 0, pode ser que o vídeo não tenha iniciado ainda
      if (currentTime === 0 && duration > 0) {
        console.log('[Video Progress] ⏭️ Vídeo não iniciou ainda (tempo = 0)')
        return
      }

      // Verificar se mudou significativamente
      if (currentTime > 0 && Math.abs(currentTime - lastSavedTimeRef.current) < 3) {
        console.log('[Video Progress] ⏭️ Pulando - tempo não mudou significativamente')
        return
      }

      // Não salvar se estiver no final
      if (duration > 0 && currentTime >= duration - 2) {
        console.log('[Video Progress] ⏭️ Pulando - vídeo no fim')
        return
      }

      // Salvar no backend
      console.log('[Video Progress] 🚀 Salvando:', {
        videoId: youtubeId,
        timestamp: currentTime,
      })

      const response = await saveVideoTimestamp({
        videoId: youtubeId,
        timestamp: currentTime,
      })

      console.log('[Video Progress] ✅ Resposta da API:', response)

      lastSavedTimeRef.current = currentTime

      const progressPercent = duration > 0 ? ((currentTime / duration) * 100).toFixed(1) : '0'
      console.log(
        `[Video Progress] 💾 Salvo com sucesso: ${currentTime}s / ${duration}s (${progressPercent}%)`,
      )
    } catch (error) {
      console.error('[Video Progress] ❌ Erro ao salvar:', error)
    }
  }

  return {
    saveProgress, // Expor para poder chamar manualmente
  }
}

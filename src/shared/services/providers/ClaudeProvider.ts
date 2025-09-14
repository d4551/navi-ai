import BaseAIProvider from './BaseAIProvider'
import { AIProvider, ModalityType, MultiModalRequest, MultiModalResponse, StreamCallbacks } from '@/shared/types/ai'
import { logger } from '@/shared/utils/logger'

export default class ClaudeProvider extends BaseAIProvider {
  private apiKey: string | null = null
  private baseUrl = 'https://api.anthropic.com/v1/messages'

  constructor() {
    super(AIProvider.CLAUDE, [ModalityType.TEXT])
  }

  async initialize(config: any): Promise<void> {
    await super.initialize(config)
    
    if (!config.apiKey) {
      throw new Error('Claude API key is required')
    }

    this.apiKey = config.apiKey
    logger.info('Claude provider initialized successfully')
  }

  async execute(request: MultiModalRequest): Promise<MultiModalResponse> {
    const start = Date.now()
    const id = `${this.provider}_${Date.now()}`
    if (!this.apiKey) {
      throw new Error('Claude provider not initialized')
    }

    try {
      // Extract text content
      const textContent = request.content.find(c => c.type === ModalityType.TEXT)
      const prompt = textContent?.data || ''

      if (!prompt) {
        throw new Error('No text content found in request')
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.currentModel || 'claude-3-haiku-20240307',
          max_tokens: request.options?.maxTokens || 4000,
          temperature: request.options?.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Claude API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const text = data.content?.[0]?.text || ''

      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || 'claude-3-haiku-20240307',
        success: true,
        content: { text },
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          imagesGenerated: 0,
          audioDuration: 0,
          videoDuration: 0,
          cost: 0 // Calculate based on pricing if needed
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start
        }
      }
    } catch (error) {
      logger.error('Claude execution error:', error)
      return {
        id,
        requestId: request.id,
        provider: this.provider,
        model: this.currentModel || 'claude-3-haiku-20240307',
        success: false,
        content: {},
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          imagesGenerated: 0,
          audioDuration: 0,
          videoDuration: 0,
          cost: 0
        },
        timing: {
          startedAt: start,
          completedAt: Date.now(),
          totalTime: Date.now() - start,
          processingTime: Date.now() - start
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  stream(request: MultiModalRequest, callbacks: StreamCallbacks) {
    const session = {
      id: `${this.provider}_${Date.now()}`,
      provider: this.provider,
      modality: ModalityType.TEXT,
      startTime: Date.now(),
      chunkCount: 0
    }

    callbacks.onStart?.(session)
    if (!this.apiKey) {
      const error = new Error('Claude provider not initialized')
      callbacks.onError?.(error)
      return null
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        // Extract text content
        const textContent = request.content.find(c => c.type === ModalityType.TEXT)
        const prompt = textContent?.data || ''

        if (!prompt) {
          throw new Error('No text content found in request')
        }

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.currentModel || 'claude-3-haiku-20240307',
            max_tokens: request.options?.maxTokens || 4000,
            temperature: request.options?.temperature || 0.7,
            stream: true,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        })

        if (!response.ok || !response.body) {
          throw new Error(`Claude API error: ${response.status} - ${await response.text()}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let fullText = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue
            
            const data = trimmed.replace(/^data:\s*/, '')
            if (data === '[DONE]') {
              reader.cancel()
              break
            }

            try {
              const json = JSON.parse(data)
              if (json.type === 'content_block_delta' && json.delta?.text) {
                const chunk = json.delta.text
                fullText += chunk
                session.chunkCount++
                callbacks.onChunk?.(chunk)
              }
            } catch (e) {
              logger.debug('Failed to parse Claude stream chunk', e)
            }
          }
        }

        callbacks.onComplete?.({
          id: session.id,
          requestId: request.id,
          provider: this.provider,
          model: this.currentModel || 'claude-3-haiku-20240307',
          success: true,
          content: { text: fullText },
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            imagesGenerated: 0,
            audioDuration: 0,
            videoDuration: 0,
            cost: 0
          },
          timing: {
            startedAt: session.startTime,
            completedAt: Date.now(),
            totalTime: Date.now() - session.startTime,
            processingTime: Date.now() - session.startTime
          }
        })
      } catch (error) {
        logger.error('Claude streaming error:', error)
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    })()

    return controller
  }
}


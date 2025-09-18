/**
 * MULTIMODAL LIVE CLIENT
 * ======================
 *
 * Unified client for Google's Multimodal Live API with Vue 3 integration
 * Features: WebSocket streaming, audio processing, real-time communication
 * Security: Electron-safe with proper IPC handling
 */

import { EventEmitter } from 'eventemitter3'
import { logger } from '@/shared/utils/logger'
import type {
  LiveConfig,
  LiveOutgoingMessage,
  LiveIncomingMessage,
  StreamingLog,
  MultimodalClientEvents,
  MultimodalClientConfig,
  ServerContent,
  ToolCallMessage,
  ToolCallCancellationMessage,
} from '@/shared/types/multimodal-live'

export class MultimodalLiveClient extends EventEmitter<MultimodalClientEvents> {
  private ws: WebSocket | null = null
  private config: MultimodalClientConfig
  private reconnectAttempts = 0
  private isConnected = false
  private logs: StreamingLog[] = []
  private currentSession: LiveConfig | null = null

  constructor(config: MultimodalClientConfig) {
    super()
    this.config = {
      baseUrl:
        'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
      debug: false,
      autoReconnect: true,
      maxReconnectAttempts: 3,
      ...config,
    }
  }

  /**
   * Connect to the Multimodal Live API WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        const url = `${this.config.baseUrl}?key=${this.config.apiKey}`
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          this.log('connection', 'Connected to Multimodal Live API')
          this.emit('open')
          resolve()
        }

        this.ws.onclose = event => {
          this.isConnected = false
          this.log(
            'connection',
            `Connection closed: ${event.code} - ${event.reason}`
          )
          this.emit('close', event.code, event.reason)

          if (
            this.config.autoReconnect &&
            this.reconnectAttempts < (this.config.maxReconnectAttempts || 3)
          ) {
            this.reconnectAttempts++
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts)
          }
        }

        this.ws.onmessage = event => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = error => {
          this.log('error', `WebSocket error: ${error}`)
          this.emit('error', new Error(`WebSocket connection failed`))
          reject(new Error('WebSocket connection failed'))
        }
      } catch (error) {
        this.log('error', `Connection error: ${error}`)
        reject(error)
      }
    })
  }

  /**
   * Set up a new live session with configuration
   */
  async setup(config: LiveConfig): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }

    this.currentSession = config
    const setupMessage: LiveOutgoingMessage = { setup: config }
    this.send(setupMessage)
    this.log('setup', 'Session setup sent', config)
  }

  /**
   * Send client content (text, conversation turns)
   */
  sendClientContent(turns: any[], turnComplete = true): void {
    const message: LiveOutgoingMessage = {
      clientContent: {
        turns,
        turnComplete,
      },
    }
    this.send(message)
    this.log('client_content', 'Client content sent', { turns, turnComplete })
  }

  /**
   * Send real-time input (audio chunks)
   */
  sendRealtimeInput(chunks: Array<{ mimeType: string; data: string }>): void {
    const message: LiveOutgoingMessage = {
      realtimeInput: {
        mediaChunks: chunks,
      },
    }
    this.send(message)
    this.log('realtime_input', 'Realtime input sent', { chunks: chunks.length })
  }

  /**
   * Send tool response
   */
  sendToolResponse(response: any): void {
    const message: LiveOutgoingMessage = {
      toolResponse: response,
    }
    this.send(message)
    this.log('tool_response', 'Tool response sent', response)
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected')
      this.ws = null
    }
    this.isConnected = false
    this.currentSession = null
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get current session configuration
   */
  get session(): LiveConfig | null {
    return this.currentSession
  }

  /**
   * Get logs
   */
  get sessionLogs(): StreamingLog[] {
    return [...this.logs]
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Private: Send message to WebSocket
   */
  private send(message: LiveOutgoingMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }

    try {
      this.ws.send(JSON.stringify(message))
      // Debug logging handled by logger when debug mode is enabled
    } catch (error) {
      this.log('error', 'Failed to send message', error)
      throw error
    }
  }

  /**
   * Private: Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const message: LiveIncomingMessage = JSON.parse(_data)
      // Debug logging handled by logger when debug mode is enabled

      // Handle different message types
      if ('setupComplete' in message) {
        this.log('setup_complete', 'Setup complete')
        this.emit('setupcomplete')
      } else if ('serverContent' in message) {
        const content = message.serverContent
        this.handleServerContent(content)
      } else if ('toolCall' in message) {
        this.log('tool_call', 'Tool call received', message.toolCall)
        this.emit('toolcall', message.toolCall)
      } else if ('toolCallCancellation' in message) {
        this.log(
          'tool_call_cancellation',
          'Tool call cancelled',
          message.toolCallCancellation
        )
        this.emit('toolcallcancellation', message.toolCallCancellation)
      }
    } catch (error) {
      this.log('error', 'Failed to parse message', { error, data })
      this.emit(
        'error',
        new Error(`Failed to parse incoming message: ${error}`)
      )
    }
  }

  /**
   * Private: Handle server content
   */
  private handleServerContent(content: ServerContent): void {
    this.emit('content', content)

    if ('interrupted' in content) {
      this.log('interrupted', 'Conversation interrupted')
      this.emit('interrupted')
    } else if ('turnComplete' in content) {
      this.log('turn_complete', 'Turn complete')
      this.emit('turncomplete')
    } else if ('modelTurn' in content) {
      this.log('model_turn', 'Model response received', content.modelTurn)
      // Additional processing for model turns can be added here
    }
  }

  /**
   * Private: Log with structured format
   */
  private log(type: string, message: string, data?: any): void {
    const logEntry: StreamingLog = {
      date: new Date(),
      type,
      message: data ? { message, data } : message,
    }

    this.logs.push(logEntry)
    this.emit('log', logEntry)

    if (this.config.debug) {
      logger.info(`[MultimodalLiveClient:${type}]`, logEntry.message)
    }

    // Keep logs manageable (last 1000 entries)
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }
  }
}

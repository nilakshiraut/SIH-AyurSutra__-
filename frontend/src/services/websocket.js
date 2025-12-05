/**
 * WebSocket Service for real-time chat communication
 */
class WebSocketService {
  constructor() {
    this.ws = null
    this.sessionId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.listeners = new Map()
    this.messageQueue = []
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  connect(sessionId = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket service: Already connected, reusing connection');
      return Promise.resolve()
    }

    // Reuse existing session ID if we have one, otherwise generate new
    if (!this.sessionId) {
      this.sessionId = sessionId || this.generateSessionId()
    }
    console.log('WebSocket service: Using session ID:', this.sessionId)
    // Use environment variables for production URLs
    let baseUrl
    if (typeof __WS_URL__ !== 'undefined') {
      baseUrl = __WS_URL__ + '/ws'
    } else if (import.meta.env.VITE_WS_URL) {
      baseUrl = import.meta.env.VITE_WS_URL
    } else {
      // Development fallback with Vite proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      baseUrl = `${protocol}//${window.location.host}/ws`
    }
    const wsUrl = `${baseUrl}/chat?session_id=${this.sessionId}`
    
    console.log('Connecting to WebSocket:', wsUrl)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.flushMessageQueue()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Received WebSocket message:', data)
            this.emit('message', data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
            console.error('Raw message:', event.data)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          console.error('WebSocket URL was:', wsUrl)
          this.emit('error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.emit('disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.connect(this.sessionId)
      }, this.reconnectDelay)
    } else {
      this.emit('reconnect_failed')
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = { message }
      console.log('Sending WebSocket message:', payload)
      this.ws.send(JSON.stringify(payload))
    } else {
      console.warn('WebSocket not open, queueing message. State:', this.ws?.readyState)
      this.messageQueue.push(message)
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.messageQueue = []
  }

  getSessionId() {
    return this.sessionId
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

export default new WebSocketService()


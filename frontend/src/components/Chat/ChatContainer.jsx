import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import TypingIndicator from './TypingIndicator'
import useChatStore from '../../store/chatStore'
import websocketService from '../../services/websocket'
import './ChatContainer.css'

const ChatContainer = () => {
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const {
    messages,
    isConnected,
    isTyping,
    assessmentProgress,
    addMessage,
    setConnected,
    setTyping,
    setAssessmentProgress,
    setDoshaResults,
    setPanchakarmaRecs,
    setAssessmentComplete
  } = useChatStore()

  // ✅ KEEP ONLY THIS SCROLL FUNCTION
  useEffect(() => {
    // Auto-scroll to bottom when component mounts or messages change
    const messagesContainer = containerRef.current?.querySelector('.chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect()

    // Set up message listener
    const handleMessage = (data) => {
      if (data.type === 'typing') {
        setTyping(true)
        setTimeout(() => setTyping(false), 2000)
        return
      }

      if (data.type === 'message') {
        // Only add bot messages (user messages are added optimistically)
        if (data.sender === 'bot') {
          addMessage({
            text: data.text,
            sender: data.sender,
            timestamp: data.timestamp
          })
        }
        setTyping(false)
      }

      if (data.type === 'question') {
        addMessage({
          text: data.text,
          sender: 'bot',
          timestamp: data.timestamp,
          questionId: data.question_id,
          options: data.options,
          isQuestion: true
        })
        setAssessmentProgress(data.progress)
        setTyping(false)
      }

      if (data.type === 'assessment_complete') {
        setDoshaResults(data.dosha_results)
        setPanchakarmaRecs(data.panchakarma_recs)
        setAssessmentComplete(true)
        addMessage({
          text: 'Assessment complete! Check your results below.',
          sender: 'bot',
          timestamp: data.timestamp,
          isComplete: true
        })
        setTyping(false)
      }
    }

    const handleConnected = () => {
      console.log('WebSocket connected successfully!')
      setConnected(true)
    }

    const handleDisconnected = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }

    const handleError = (error) => {
      console.error('WebSocket connection error:', error)
      setConnected(false)
    }

    const handleReconnectFailed = () => {
      console.error('WebSocket reconnection failed')
      setConnected(false)
    }

    websocketService.on('message', handleMessage)
    websocketService.on('connected', handleConnected)
    websocketService.on('disconnected', handleDisconnected)
    websocketService.on('error', handleError)
    websocketService.on('reconnect_failed', handleReconnectFailed)

    return () => {
      websocketService.off('message', handleMessage)
      websocketService.off('connected', handleConnected)
      websocketService.off('disconnected', handleDisconnected)
      websocketService.off('error', handleError)
      websocketService.off('reconnect_failed', handleReconnectFailed)
    }
  }, [])

  const handleSendMessage = (message) => {
    // Add user message immediately to UI (optimistic update)
    addMessage({
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    })
    
    // Send to backend
    if (!isConnected) {
      console.log('Not connected, attempting to connect...')
      websocketService.connect().then(() => {
        websocketService.send(message)
      }).catch((error) => {
        console.error('Failed to connect:', error)
      })
    } else {
      websocketService.send(message)
    }
  }

  return (
    <div className="chat-container" ref={containerRef}>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-avatar">🌿</div>
            <h2>Welcome to AyurSutra</h2>
            <p>Your Ayurvedic wellness journey begins here</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onOptionSelect={handleSendMessage} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      {assessmentProgress && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(assessmentProgress.current / assessmentProgress.total) * 100}%` }}
          />
          <span className="progress-text">
            Question {assessmentProgress.current} of {assessmentProgress.total}
          </span>
        </div>
      )}
      {!isConnected && (
        <div className="connection-status">
          <span className="status-indicator">●</span>
          <span>Connecting to AyurSutra Bot...</span>
        </div>
      )}
      <InputBox onSend={handleSendMessage} disabled={!isConnected} />
    </div>
  )
}

export default ChatContainer
import React, { useEffect, useRef, useCallback, useState } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import TypingIndicator from './TypingIndicator'
import useChatStore from '../../store/chatStore'
import websocketService from '../../services/websocket'
import './ChatContainer.css'

const ChatContainer = () => {
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const chatMessagesRef = useRef(null)
  const connectionAttemptedRef = useRef(false)
  const lastMessageHashRef = useRef('')
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  // AUTO-SCROLL
  useEffect(() => {
    const messagesContainer = containerRef.current?.querySelector('.chat-messages');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages, isTyping]);

  // LISTEN FOR ASSESSMENT COMPLETION
  useEffect(() => {
    const unsubscribe = useChatStore.subscribe(
      (state) => state.assessmentComplete,
      (isComplete) => {
        setIsAssessmentComplete(isComplete);
      }
    );
    return () => unsubscribe();
  }, []);

  // HANDLE INCOMING WS MESSAGE
  const handleMessage = useCallback((data) => {
    const messageHash = `${data.type}-${data.sender}-${data.text || ''}`;
    if (messageHash === lastMessageHashRef.current) return;
    lastMessageHashRef.current = messageHash;

    if (data.type === 'typing') {
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
      return;
    }

    if (data.type === 'message') {
      addMessage({
        text: data.text,
        sender: data.sender,
        timestamp: data.timestamp
      });
      setTyping(false);
    }

    if (data.type === 'question') {
      addMessage({
        text: data.text,
        sender: 'bot',
        timestamp: data.timestamp,
        questionId: data.question_id,
        options: data.options,
        isQuestion: true
      });
      setAssessmentProgress(data.progress);
      setTyping(false);
      setIsAssessmentComplete(false);  // move chat back down if new questions start
    }

    if (data.type === 'assessment_complete') {
      setDoshaResults(data.dosha_results);
      setPanchakarmaRecs(data.panchakarma_recs);
      setAssessmentComplete(true);
      addMessage({
        text: 'Assessment complete! Check your results below.',
        sender: 'bot',
        timestamp: data.timestamp,
        isComplete: true
      });
    }
  }, []);

  // INITIALIZE WEBSOCKET
  useEffect(() => {
    // Only connect once per component lifecycle
    if (connectionAttemptedRef.current || websocketService.isConnected()) {
      console.log('WebSocket already connected or connection attempted, skipping');
      return;
    }

    connectionAttemptedRef.current = true;
    console.log('Attempting WebSocket connection...');
    websocketService.connect();

    websocketService.on('connected', () => {
      setConnected(true);
      lastMessageHashRef.current = '';
    });

    websocketService.on('disconnected', () => setConnected(false));
    websocketService.on('error', () => setConnected(false));
    websocketService.on('message', handleMessage);

    return () => {
      websocketService.off('message', handleMessage);
      connectionAttemptedRef.current = false;
    };
  }, []);

  // SEND MESSAGE
  const handleSendMessage = useCallback((message) => {
    addMessage({
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
    websocketService.send(message);
  }, []);

  // REFRESH CHAT
  const handleRefresh = useCallback(() => {
    // Reset chat state and reconnect websocket
    window.location.reload();
  }, []);

  // TOGGLE FULLSCREEN
  const handleFullscreenToggle = useCallback(() => {
    const chatContainer = containerRef.current;
    if (!isFullscreen) {
      if (chatContainer.requestFullscreen) {
        chatContainer.requestFullscreen();
      } else if (chatContainer.webkitRequestFullscreen) {
        chatContainer.webkitRequestFullscreen();
      } else if (chatContainer.msRequestFullscreen) {
        chatContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // CLOSE CHAT
  const handleClose = useCallback(() => {
    // Navigate back or close the chat
    window.history.back();
  }, []);

  // LISTEN FOR FULLSCREEN CHANGES
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      className={`chat-container ${isAssessmentComplete ? 'assessment-complete' : ''}`}
      ref={containerRef}
    >
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="bot-icon">🌿</div>
          <h3 className="bot-name">AyurSutra Assistant</h3>
        </div>
        <div className="header-right">
          <button
            className="header-button refresh-button"
            onClick={handleRefresh}
            title="Refresh Chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
          </button>
          <button
            className="header-button fullscreen-button"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8,3v3a2,2,0,0,1-2,2H3m18,0h-3a2,2,0,0,1-2-2V3m0,18v-3a2,2,0,0,0,2-2h3M3,16h3a2,2,0,0,0,2,2v3"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15,3h6v6M9,21H3v-6M21,3l-7,7M3,21l7-7"></path>
              </svg>
            )}
          </button>
          <button
            className="header-button close-button"
            onClick={handleClose}
            title="Close Chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} onOptionSelect={handleSendMessage} />
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

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
    if (connectionAttemptedRef.current) return;
    connectionAttemptedRef.current = true;

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

  return (
    <div
      className={`chat-container ${isAssessmentComplete ? 'assessment-complete' : ''}`}
      ref={containerRef}
    >
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

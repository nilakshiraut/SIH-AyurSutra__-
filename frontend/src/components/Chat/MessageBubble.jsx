import React from 'react'
import Avatar from '../UI/Avatar'
import './MessageBubble.css'

const MessageBubble = ({ message, onOptionSelect }) => {
  const isBot = message.sender === 'bot'
  const isQuestion = message.isQuestion && message.options

  const handleOptionClick = (option) => {
    if (onOptionSelect) {
      onOptionSelect(option)
    }
  }

  return (
    <div className={`message ${isBot ? 'message-bot' : 'message-user'}`}>
      {isBot && <Avatar type="bot" />}
      <div className="message-content">
        <div className={`message-bubble ${isBot ? 'bubble-bot' : 'bubble-user'}`}>
          <p className="message-text">{message.text}</p>
          {isQuestion && (
            <div className="message-options">
              {message.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        {message.timestamp && (
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      {!isBot && <Avatar type="user" />}
    </div>
  )
}

export default MessageBubble



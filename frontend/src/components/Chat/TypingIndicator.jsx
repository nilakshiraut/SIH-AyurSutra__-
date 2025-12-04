import React from 'react'
import Avatar from '../UI/Avatar'
import './TypingIndicator.css'

const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <Avatar type="bot" />
      <div className="typing-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  )
}

export default TypingIndicator



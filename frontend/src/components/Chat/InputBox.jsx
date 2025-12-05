import React, { useState, useRef, useEffect } from 'react'
import './InputBox.css'

const InputBox = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="input-box" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder={disabled ? "Connecting..." : "Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || disabled}
          aria-label="Send message"
        >
          <span className="send-icon">🌿</span>
        </button>
      </div>
    </form>
  )
}

export default InputBox


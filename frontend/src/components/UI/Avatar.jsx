import React from 'react'
import './Avatar.css'

const Avatar = ({ type = 'bot' }) => {
  return (
    <div className={`avatar avatar-${type}`}>
      {type === 'bot' ? '🌿' : '👤'}
    </div>
  )
}

export default Avatar



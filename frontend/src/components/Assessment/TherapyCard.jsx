import React from 'react'
import './TherapyCard.css'

const TherapyCard = ({ therapy }) => {
  if (!therapy) return null

  return (
    <div className="therapy-card">
      <div className="therapy-header">
        <h3 className="therapy-name">{therapy.name}</h3>
        <span className="therapy-badge">Primary</span>
      </div>
      <p className="therapy-description">{therapy.description}</p>
      <div className="therapy-details">
        <div className="detail-item">
          <span className="detail-label">⏱️ Duration:</span>
          <span className="detail-value">{therapy.duration}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">✨ Benefits:</span>
          <span className="detail-value">{therapy.benefits}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">⚠️ Precautions:</span>
          <span className="detail-value">{therapy.precautions}</span>
        </div>
      </div>
    </div>
  )
}

export default TherapyCard



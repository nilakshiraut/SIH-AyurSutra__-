import React from 'react'
import './DoshaResult.css'

const DoshaResult = ({ doshaResults }) => {
  if (!doshaResults) return null

  const { percentages, dominant_dosha, secondary_dosha } = doshaResults

  const doshaColors = {
    vata: '#8B5CF6',
    pitta: '#F59E0B',
    kapha: '#10B981'
  }

  const doshaNames = {
    vata: 'Vata',
    pitta: 'Pitta',
    kapha: 'Kapha'
  }

  const doshaDescriptions = {
    vata: 'Air & Ether - Creative, quick, light',
    pitta: 'Fire & Water - Intense, ambitious, sharp',
    kapha: 'Earth & Water - Calm, stable, grounded'
  }

  return (
    <div className="dosha-result">
      <h2 className="result-title">Your Dosha Assessment</h2>
      <div className="dosha-chart">
        {Object.entries(percentages).map(([dosha, percentage]) => (
          <div key={dosha} className="dosha-item">
            <div className="dosha-circle-container">
              <svg className="dosha-circle" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={doshaColors[dosha]}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="dosha-progress"
                />
              </svg>
              <div className="dosha-percentage">{percentage}%</div>
            </div>
            <h3 className={`dosha-name ${dosha === dominant_dosha ? 'dominant' : ''}`}>
              {doshaNames[dosha]}
              {dosha === dominant_dosha && ' ⭐'}
            </h3>
            <p className="dosha-description">{doshaDescriptions[dosha]}</p>
          </div>
        ))}
      </div>
      <div className="dosha-summary">
        <p className="summary-text">
          <strong>Dominant Dosha:</strong> {doshaNames[dominant_dosha]}
        </p>
        {secondary_dosha && (
          <p className="summary-text">
            <strong>Secondary Dosha:</strong> {doshaNames[secondary_dosha]}
          </p>
        )}
      </div>
    </div>
  )
}

export default DoshaResult



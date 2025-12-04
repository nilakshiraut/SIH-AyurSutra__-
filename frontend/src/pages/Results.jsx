import React from 'react'
import { useNavigate } from 'react-router-dom'
import DoshaResult from '../components/Assessment/DoshaResult'
import TherapyCard from '../components/Assessment/TherapyCard'
import useChatStore from '../store/chatStore'
import './Results.css'

const Results = () => {
  const navigate = useNavigate()
  const { doshaResults, panchakarmaRecs } = useChatStore()

  if (!doshaResults) {
    return (
      <div className="results-page">
        <main className="results-main">
          <div className="no-results">
            <h2>No assessment results found</h2>
            <p>Please complete the assessment first.</p>
            <button onClick={() => navigate('/chat')} className="cta-button">
              Start Assessment
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="results-page">
    
      <main className="results-main">
        <DoshaResult doshaResults={doshaResults} />
        {panchakarmaRecs && (
          <div className="therapies-section">
            <h2 className="therapies-title">Recommended Panchakarma Therapies</h2>
            {panchakarmaRecs.therapy_details?.map((therapy, index) => (
              <TherapyCard key={index} therapy={therapy} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Results



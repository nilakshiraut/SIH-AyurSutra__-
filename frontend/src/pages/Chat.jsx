import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ChatContainer from '../components/Chat/ChatContainer'
import DoshaResult from '../components/Assessment/DoshaResult'
import TherapyCard from '../components/Assessment/TherapyCard'
import useChatStore from '../store/chatStore'
import './Chat.css'

const Chat = () => {
  const navigate = useNavigate()
  const { doshaResults, panchakarmaRecs, assessmentComplete, resetChat } = useChatStore()

  useEffect(() => {
    // Reset chat when component unmounts
    return () => {
      // Don't reset on unmount to preserve state
    }
  }, [])

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_data: {},
          dosha_results: doshaResults,
          panchakarma_recs: panchakarmaRecs
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ayursutra_assessment_report.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  return (
    <div className="chat-page">
      <Header />
      <main className="chat-main">
        <div className="chat-wrapper">
          {assessmentComplete && (
            <div className="results-section">
              <DoshaResult doshaResults={doshaResults} />
              <div className="therapies-section">
                <h2 className="therapies-title">Recommended Panchakarma Therapies</h2>
                {panchakarmaRecs?.therapy_details?.map((therapy, index) => (
                  <TherapyCard key={index} therapy={therapy} />
                ))}
                {panchakarmaRecs?.dietary && (
                  <div className="dietary-section">
                    <h3 className="section-title">Dietary Recommendations</h3>
                    <div className="dietary-content">
                      <div className="dietary-list">
                        <h4>Foods to Favor</h4>
                        <ul>
                          {panchakarmaRecs.dietary.favor?.map((food, index) => (
                            <li key={index}>{food}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="dietary-list">
                        <h4>Foods to Avoid</h4>
                        <ul>
                          {panchakarmaRecs.dietary.avoid?.map((food, index) => (
                            <li key={index}>{food}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {panchakarmaRecs?.lifestyle && (
                  <div className="lifestyle-section">
                    <h3 className="section-title">Lifestyle Modifications</h3>
                    <div className="lifestyle-content">
                      <p><strong>Daily Routine:</strong> {panchakarmaRecs.lifestyle.routine}</p>
                      <p><strong>Yoga Practices:</strong> {panchakarmaRecs.lifestyle.yoga}</p>
                      <p><strong>Pranayama:</strong> {panchakarmaRecs.lifestyle.pranayama}</p>
                    </div>
                  </div>
                )}
                <button className="download-pdf-button" onClick={handleDownloadPDF}>
                  📥 Download PDF Report
                </button>
              </div>
            </div>
          )}
          <ChatContainer />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Chat


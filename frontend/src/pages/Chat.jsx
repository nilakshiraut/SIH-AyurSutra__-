import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  // Auto-scroll to results when assessment is complete
  useEffect(() => {
    if (assessmentComplete) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 500)
    }
  }, [assessmentComplete])

  const handleDownloadPDF = async () => {
    try {
      console.log('Download PDF clicked')
      console.log('Dosha results:', doshaResults)
      console.log('Panchakarma recs:', panchakarmaRecs)

      const apiUrl = import.meta.env.VITE_API_URL || __API_URL__;
      const requestUrl = `${apiUrl}/api/pdf/generate`
      console.log('Making request to:', requestUrl)

      const response = await fetch(requestUrl, {
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

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (response.ok) {
        try {
          const blob = await response.blob()
          console.log('Blob size:', blob.size)
          if (blob.size > 100) { // Check if we actually got a PDF
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'ayursutra_assessment_report.pdf'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            console.log('PDF download initiated')
          } else {
            // If blob is too small, might be an error response
            const text = await blob.text()
            console.error('Received small blob, might be error:', text)
            alert('PDF generation is currently unavailable. Please try again later or contact support.')
          }
        } catch (blobError) {
          console.error('Error processing blob:', blobError)
          alert('Error processing PDF download. Please try again.')
        }
      } else {
        const errorText = await response.text()
        console.error('PDF generation failed:', response.status, errorText)

        // Provide helpful error message
        if (response.status === 500 && errorText.includes('PDF')) {
          alert('PDF generation service is temporarily unavailable. The assessment data is saved. Please try again later.')
        } else {
          alert(`Failed to download PDF: ${errorText}`)
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  return (
    <div className="chat-page">
    
      <main className="chat-main">
        <div className="chat-wrapper">
          <ChatContainer />
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
                    Download PDF Report
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    
    </div>
  )
}

export default Chat



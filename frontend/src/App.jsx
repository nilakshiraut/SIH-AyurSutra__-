import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Chat from './pages/Chat'
import Results from './pages/Results'

// Debug environment variables
console.log('🚀 AyurSutra App Loading...')
console.log('Environment Variables:')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('__API_URL__:', typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'undefined')
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL)
console.log('__WS_URL__:', typeof __WS_URL__ !== 'undefined' ? __WS_URL__ : 'undefined')

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to chat */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        
        {/* Chat page */}
        <Route path="/chat" element={<Chat />} />
        
        {/* Results page */}
        <Route path="/results" element={<Results />} />
        
        {/* Catch-all redirect to chat */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  )
}

export default App

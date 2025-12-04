import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Chat from './pages/Chat'
import Results from './pages/Results'

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

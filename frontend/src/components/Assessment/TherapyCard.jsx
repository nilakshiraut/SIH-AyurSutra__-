// src/components/Assessment/TherapyCard.jsx
import React from 'react'
import './TherapyCard.css'

// Correct import paths - go up two levels from Assessment folder
import bastiImage from '../../Images/Basti.png'
import nasyaImage from '../../Images/Nasya.png'
import raktamokshanaImage from '../../Images/Raktamokshana.png'
import vamanaImage from '../../Images/vamana.png'
import virechanaImage from '../../Images/Virechana.png'
import abhyangaImage from '../../Images/Abhyanga.png' // Added Abhyanga image

// Map therapy names to their images
const therapyImages = {
  'Basti': bastiImage,
  'Nasya': nasyaImage,
  'Rakta Mokshana': raktamokshanaImage,
  'Raktamokshana': raktamokshanaImage,
  'Vamana': vamanaImage,
  'Virechana': virechanaImage,
  'Abhyanga': abhyangaImage, // Added Abhyanga
}

// Function to get the correct image for a therapy
const getTherapyImage = (therapyName) => {
  if (therapyImages[therapyName]) {
    return therapyImages[therapyName]
  }
  
  const lowerCaseName = therapyName.toLowerCase()
  for (const [key, image] of Object.entries(therapyImages)) {
    if (key.toLowerCase() === lowerCaseName) {
      return image
    }
  }
  
  const nameWords = therapyName.toLowerCase().split(' ')
  for (const [key, image] of Object.entries(therapyImages)) {
    const keyLower = key.toLowerCase()
    if (nameWords.some(word => keyLower.includes(word)) || 
        keyLower.split(' ').some(word => therapyName.toLowerCase().includes(word))) {
      return image
    }
  }
  
  return Object.values(therapyImages)[0] || null
}

const TherapyCard = ({ therapy }) => {
  if (!therapy) return null

  const therapyImage = getTherapyImage(therapy.name)
  
  return (
    <div className="therapy-card">
      {/* Image section */}
      {therapyImage ? (
        <div className="therapy-image-container">
          <img 
            src={therapyImage} 
            alt={`${therapy.name} - Ayurvedic Panchakarma Therapy`}
            className="therapy-image"
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load image for ${therapy.name}`)
              e.target.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.className = 'image-fallback'
              fallback.innerHTML = `
                <span class="fallback-icon">🌿</span>
                <span class="fallback-text">${therapy.name}</span>
              `
              e.target.parentElement.appendChild(fallback)
            }}
          />
          <div className="image-overlay"></div>
        </div>
      ) : (
        <div className="image-fallback">
          <span className="fallback-icon">🌿</span>
          <span className="fallback-text">{therapy.name}</span>
        </div>
      )}
      
      <div className="therapy-content">
        <div className="therapy-header">
          <h3 className="therapy-name">
            <span className="therapy-icon">🌿</span>
            {therapy.name}
          </h3>
          <span className={`therapy-badge ${therapy.category || 'primary'}`}>
            {therapy.category === 'secondary' ? 'Secondary' : 'Primary'}
          </span>
        </div>
        
        <p className="therapy-description">{therapy.description}</p>
        
        <div className="therapy-details">
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">⏱️</span>
              Duration
            </span>
            <span className="detail-value">{therapy.duration}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">
              <span className="detail-icon">✨</span>
              Benefits
            </span>
            <span className="detail-value">{therapy.benefits}</span>
          </div>
          
          {therapy.dosha && (
            <div className="detail-item">
              <span className="detail-label">
                <span className="detail-icon">🎯</span>
                Balances
              </span>
              <span className="detail-value">
                <span className={`dosha-tag ${therapy.dosha.toLowerCase()}`}>
                  {therapy.dosha}
                </span>
              </span>
            </div>
          )}
          
          {therapy.precautions && (
            <div className="detail-item">
              <span className="detail-label">
                <span className="detail-icon">⚠️</span>
                Precautions
              </span>
              <span className="detail-value precautions-text">{therapy.precautions}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TherapyCard
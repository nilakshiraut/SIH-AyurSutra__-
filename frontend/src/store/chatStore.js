import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  messages: [],
  isConnected: false,
  isTyping: false,
  assessmentProgress: null,
  doshaResults: null,
  panchakarmaRecs: null,
  assessmentComplete: false,

// In your store/chatStore.js
addMessage: (message) => set((state) => {
  // Create a unique identifier for this message
  const messageId = message.messageId || `${message.sender}-${message.text}-${message.timestamp}`;
  
  // Check if this message already exists
  const isDuplicate = state.messages.some(msg => 
    (msg.messageId && msg.messageId === messageId) || 
    (msg.sender === message.sender && 
     msg.text === message.text && 
     msg.timestamp === message.timestamp)
  );
  
  if (isDuplicate) {
    console.log('Store: Duplicate message prevented:', message.text?.substring(0, 50));
    return state; // Don't update state if duplicate
  }
  
  return {
    messages: [...state.messages, {
      ...message,
      id: Date.now() + Math.random(),
      messageId: messageId // Ensure messageId is stored
    }]
  };
}),
  setConnected: (status) => set({ isConnected: status }),

  setTyping: (status) => set({ isTyping: status }),

  setAssessmentProgress: (progress) => set({ assessmentProgress: progress }),

  setDoshaResults: (results) => set({ doshaResults: results }),

  setPanchakarmaRecs: (recs) => set({ panchakarmaRecs: recs }),

  setAssessmentComplete: (complete) => set({ assessmentComplete: complete }),

  resetChat: () => set({
    messages: [],
    isConnected: false,
    isTyping: false,
    assessmentProgress: null,
    doshaResults: null,
    panchakarmaRecs: null,
    assessmentComplete: false
  })
}))

export default useChatStore



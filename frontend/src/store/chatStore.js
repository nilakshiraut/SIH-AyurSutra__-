import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  messages: [],
  isConnected: false,
  isTyping: false,
  assessmentProgress: null,
  doshaResults: null,
  panchakarmaRecs: null,
  assessmentComplete: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now() + Math.random()
    }]
  })),

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



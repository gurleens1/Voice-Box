import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import FeedbackScreen from './components/FeedbackScreen'
import UserDetailsScreen from './components/UserDetailsScreen'
import SuccessModal from './components/SuccessModal'
import { submitAnonymousFeedback, submitNamedFeedback } from './api'

export default function App() {
  const [screen, setScreen] = useState('welcome')   // welcome | feedback | details
  const [mode, setMode] = useState(null)             // 'anonymous' | 'named'
  const [pendingFeedbacks, setPendingFeedbacks] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  // ── Step 1 → 2 ──────────────────────────────────────────────────
  const handleWelcomeNext = (selectedMode) => {
    setMode(selectedMode)
    setScreen('feedback')
  }

  // ── Step 2 → 3 or Submit ─────────────────────────────────────────
  const handleFeedbackNext = async (feedbacks) => {
    setPendingFeedbacks(feedbacks)

    if (mode === 'anonymous') {
      setIsSubmitting(true)
      setGlobalError('')
      try {
        await submitAnonymousFeedback(feedbacks)
        setShowSuccess(true)
      } catch (err) {
        const msg = err.response?.data?.detail || 'Submission failed. Please try again.'
        setGlobalError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Named: go to details screen
      setScreen('details')
    }
  }

  // ── Step 3 → Submit ───────────────────────────────────────────────
  const handleDetailsSubmit = async (employeeDetails) => {
    setIsSubmitting(true)
    setGlobalError('')
    try {
      await submitNamedFeedback(employeeDetails, pendingFeedbacks)
      setShowSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Submission failed. Please try again.'
      setGlobalError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success → Reset ────────────────────────────────────────────────
  const handleReset = () => {
    setShowSuccess(false)
    setScreen('welcome')
    setMode(null)
    setPendingFeedbacks([])
    setGlobalError('')
  }

  return (
    <div className="app-shell">
      {/* ── Navigation Bar ── */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="nav-brand">Voice Box</div>
            <div className="nav-tagline">Your feedback, safely heard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--success)', boxShadow: '0 0 0 3px var(--success-light)'
          }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>Confidential</span>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="main-content">
        <div style={{ width: '100%' }}>
          {/* Global error outside card */}
          {globalError && (
            <div className="alert alert-error" style={{ marginBottom: 16, margin: '0 auto 16px' }}>
              <span>⚠</span> {globalError}
            </div>
          )}

          {screen === 'welcome' && (
            <WelcomeScreen onNext={handleWelcomeNext} />
          )}

          {screen === 'feedback' && (
            <FeedbackScreen
              mode={mode}
              onPrev={() => setScreen('welcome')}
              onNext={handleFeedbackNext}
              isSubmitting={isSubmitting}
            />
          )}

          {screen === 'details' && (
            <UserDetailsScreen
              onPrev={() => setScreen('feedback')}
              onSubmit={handleDetailsSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>

      {/* ── Success Modal ── */}
      {showSuccess && <SuccessModal onClose={handleReset} />}
    </div>
  )
}

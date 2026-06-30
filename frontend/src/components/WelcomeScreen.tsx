import { useState } from 'react'

const STEPS = ['Welcome', 'Feedback', 'Details']

function ProgressDots({ current }) {
  return (
    <div className="progress-steps">
      {STEPS.map((label, i) => (
        <div key={label} className="step">
          <div
            className={`step-dot ${i === current ? 'active' : i < current ? 'done' : ''}`}
            title={label}
          />
          {i < STEPS.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  )
}

export default function WelcomeScreen({ onNext }) {
  const [selected, setSelected] = useState(null) // 'anonymous' | 'named'

  const options = [
    {
      id: 'anonymous',
      icon: '🎭',
      title: 'Stay Anonymous',
      desc: 'Your identity stays private. We hear your voice without knowing who you are.',
    },
    {
      id: 'named',
      icon: '👤',
      title: 'Share with My Name',
      desc: 'Your name is shared with the feedback. We may follow up with you if needed.',
    },
  ]

  return (
    <div className="card screen-enter">
      <div className="card-header">
        <img src="/damco-logo.svg" alt="Damco Logo" className="header-logo" />
        <ProgressDots current={0} />
        <div style={{ marginTop: 20 }}>
          <div className="screen-badge">
            <svg viewBox="0 0 10 10" fill="currentColor">
              <circle cx="5" cy="5" r="3" />
            </svg>
            Step 1 of 3
          </div>
          <h1 className="card-title">Welcome to Voice Box</h1>
          <p className="card-subtitle">
            This is your space to share what's on your mind — ideas, concerns, or
            suggestions. Big or small, every voice matters here.
          </p>
        </div>
      </div>

      <div className="card-body">
        <p style={{ fontSize: '0.85rem', color: 'var(--slate)', marginBottom: '16px', fontWeight: 500 }}>
          Choose how you'd like to share your feedback:
        </p>

        <div className="option-cards">
          {options.map((opt) => (
            <label key={opt.id} className={`option-card ${selected === opt.id ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
              />
              <div className="option-card-icon">{opt.icon}</div>
              <div className="option-card-text">
                <div className="option-card-title">{opt.title}</div>
                <div className="option-card-desc">{opt.desc}</div>
              </div>
              <div className="option-card-check">
                {selected === opt.id && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            🔒 Your response is confidential and handled with care. Anonymous submissions
            are completely unlinked from your identity.
          </p>
        </div>
      </div>

      <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
        <button
          className="btn btn-accent"
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export { ProgressDots }

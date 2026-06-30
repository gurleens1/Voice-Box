import { useState, useEffect } from 'react'
import { getCategories } from '../api'
import { ProgressDots } from './WelcomeScreen'

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function PreviewModal({ rows, onClose }) {
  const filled = rows.filter(r => r.category || r.text)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="card-header" style={{ padding: '24px 28px 20px' }}>
          <h2 className="card-title" style={{ fontSize: '1.2rem' }}>Feedback Preview</h2>
          <p className="card-subtitle" style={{ fontSize: '0.82rem' }}>Review your entries before submitting.</p>
        </div>
        <div style={{ padding: '20px 28px', maxHeight: 360, overflowY: 'auto' }}>
          {filled.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No feedback entered yet.
            </p>
          ) : (
            filled.map((row, i) => (
              <div key={i} className="preview-item">
                <div className="preview-category">{row.category || '—'}</div>
                <div className="preview-text">{row.text || <em style={{ color: 'var(--muted)' }}>No text entered</em>}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '16px 28px 24px' }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  )
}

const createRow = () => ({ id: Date.now() + Math.random(), category: '', text: '' })

export default function FeedbackScreen({ mode, onPrev, onNext }) {
  const [rows, setRows] = useState([createRow()])
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([
        "IT Infrastructure",
        "Workplace Relationships",
        "Work-life Balance",
        "Leave and Attendance",
        "Performance Management",
        "L&D",
        "R&R",
        "Admin & Facilities",
        "Organization Policies",
        "Top Management",
        "Finance",
        "Compensation & Benefits",
        "Recruitment",
        "Onboarding",
        "Internal Communication",
        "Diversity & Inclusion",
        "Health & Safety",
        "Employee Engagement",
        "Career Progression",
        "Mental Health & Wellbeing",
        "Manager Behavior",
        "Project/Work Alignment",
        "Social Impact",
        "N&B"
      ]))
  }, [])

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    setErrors(prev => ({ ...prev, [`${id}-${field}`]: '' }))
    setApiError('')
  }

  const addRow = () => setRows(prev => [...prev, createRow()])

  const deleteRow = (id) => {
    if (rows.length === 1) return
    setRows(prev => prev.filter(r => r.id !== id))
    setErrors(prev => {
      const next = { ...prev }
      delete next[`${id}-category`]
      delete next[`${id}-text`]
      return next
    })
  }

  const validate = () => {
    const errs = {}
    rows.forEach(row => {
      if (!row.category) errs[`${row.id}-category`] = 'Please select a category.'
      if (!row.text.trim()) errs[`${row.id}-text`] = 'Please enter your feedback.'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const feedbacks = rows.map(r => ({ category: r.category, text: r.text.trim() }))
    onNext(feedbacks)
  }

  return (
    <>
      <div className="card screen-enter">
        <div className="card-header">
          <img src="/damco-logo.svg" alt="Damco Logo" className="header-logo" />
          <ProgressDots current={1} />
          <div style={{ marginTop: 20 }}>
            <div className="screen-badge">
              <svg viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="3" /></svg>
              Step 2 of {mode === 'named' ? '3' : '2'}
            </div>
            <h1 className="card-title">Share your thoughts</h1>
            <p className="card-subtitle">
              Pick a category and drop in your feedback. You can add multiple entries.
            </p>
          </div>
        </div>

        <div className="card-body">
          {apiError && (
            <div className="alert alert-error">
              <span>⚠</span> {apiError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Feedback Entries ({rows.length})
            </span>
            <button className="btn btn-icon" onClick={() => setShowPreview(true)} title="Preview all feedback">
              <EyeIcon /> <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Preview</span>
            </button>
          </div>

          <div className="feedback-rows">
            {rows.map((row, idx) => (
              <div key={row.id} className="feedback-row">
                <div className="feedback-row-header">
                  <span className="row-number">Entry {idx + 1}</span>
                  <div className="row-actions">
                    <button
                      className="btn btn-icon"
                      onClick={() => setShowPreview(true)}
                      title="Preview this entry"
                    >
                      <EyeIcon />
                    </button>
                    {rows.length > 1 && (
                      <button className="btn btn-danger" onClick={() => deleteRow(row.id)} title="Delete row">
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    className={`form-control ${errors[`${row.id}-category`] ? 'error' : ''}`}
                    value={row.category}
                    onChange={e => updateRow(row.id, 'category', e.target.value)}
                  >
                    <option value="">Choose your category…</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors[`${row.id}-category`] && (
                    <p className="form-error">⚠ {errors[`${row.id}-category`]}</p>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Feedback <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors[`${row.id}-text`] ? 'error' : ''}`}
                    placeholder="Share your thoughts, ideas, or concerns…"
                    value={row.text}
                    onChange={e => updateRow(row.id, 'text', e.target.value)}
                    rows={3}
                  />
                  {errors[`${row.id}-text`] && (
                    <p className="form-error">⚠ {errors[`${row.id}-text`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="add-row-btn" onClick={addRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add another feedback entry
          </button>
        </div>

        <div className="card-footer">
          <button className="btn btn-ghost" onClick={onPrev}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Previous
          </button>
          <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {mode === 'anonymous' ? 'Submit Feedback' : 'Next'}
            {!loading && mode === 'named' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showPreview && <PreviewModal rows={rows} onClose={() => setShowPreview(false)} />}
    </>
  )
}

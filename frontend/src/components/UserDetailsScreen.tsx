import { useState, useEffect } from 'react'
import { getEmployee } from '../api'
import { ProgressDots } from './WelcomeScreen'

const FIELD_CONFIG = [
  { key: 'email', label: 'Email Address', required: true, colSpan: 2 },
  { key: 'name', label: 'Full Name', required: true },
  { key: 'employee_code', label: 'Employee Code', required: false },
  { key: 'designation', label: 'Designation', required: false },
  { key: 'division', label: 'Division', required: false },
  { key: 'joining_date', label: 'Joining Date', required: false },
  { key: 'feedback_source', label: 'Feedback Source', required: false },
  { key: 'feedback_collection_date', label: 'Feedback Collection Date', required: false, colSpan: 2 },
]

function InfoField({ config, value, onChange, disabled }) {
  const hasValue = Boolean(value)
  return (
    <div className={`form-group`} style={{ gridColumn: config.colSpan === 2 ? 'span 2' : undefined, marginBottom: 0 }}>
      <label className="form-label">
        {config.label}
        {config.required && <span className="required"> *</span>}
        {hasValue && !config.required && (
          <span style={{ marginLeft: 6, color: 'var(--success)', fontSize: '0.7rem' }}>✓ Auto-filled</span>
        )}
      </label>
      <input
        type="text"
        className="form-control"
        value={value || ''}
        onChange={e => onChange(config.key, e.target.value)}
        disabled={disabled && hasValue}
        placeholder={config.required ? `Enter your ${config.label.toLowerCase()}` : '—'}
      />
    </div>
  )
}

export default function UserDetailsScreen({ onPrev, onSubmit, isSubmitting }) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [details, setDetails] = useState({
    email: '',
    name: '',
    employee_code: '',
    designation: '',
    division: '',
    joining_date: '',
    feedback_source: 'Voice Box',
    feedback_collection_date: new Date().toLocaleDateString('en-GB'),
  })
  const [lookupDone, setLookupDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleEmailLookup = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError('')
    setLookupLoading(true)
    try {
      const emp = await getEmployee(email.trim())
      setDetails({
        email: emp.email || email.trim(),
        name: '',
        employee_code: '',
        designation: '',
        division: '',
        joining_date: '',
        feedback_source: emp.feedback_source || 'Voice Box',
        feedback_collection_date: new Date().toLocaleDateString('en-GB'),
      })
      setLookupDone(true)
    } catch (err) {
      if (err.response?.status === 404) {
        // Allow manual entry
        setDetails(prev => ({ ...prev, email: email.trim() }))
        setLookupDone(true)
      } else {
        setEmailError('Failed to fetch employee details. Please try again.')
      }
    } finally {
      setLookupLoading(false)
    }
  }

  const updateField = (key, value) => {
    setDetails(prev => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    if (!details.name.trim()) {
      setSubmitError('Full Name is required.')
      return false
    }
    if (!details.email.trim()) {
      setSubmitError('Email is required.')
      return false
    }
    return true
  }

  const handleSubmit = () => {
    setSubmitError('')
    if (!validate()) return
    onSubmit(details)
  }

  return (
    <div className="card screen-enter">
      <div className="card-header">
        <img src="/damco-logo.svg" alt="Damco Logo" className="header-logo" />
        <ProgressDots current={2} />
        <div style={{ marginTop: 20 }}>
          <div className="screen-badge">
            <svg viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="3" /></svg>
            Step 3 of 3
          </div>
          <h1 className="card-title">Review your details</h1>
          <p className="card-subtitle">
            We'll attribute this feedback to your name. Verify the details below before submitting.
          </p>
        </div>
      </div>

      <div className="card-body">
        {submitError && (
          <div className="alert alert-error">
            <span>⚠</span> {submitError}
          </div>
        )}

        {/* Email Lookup */}
        {!lookupDone && (
          <div style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">
                Work Email <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  className={`form-control ${emailError ? 'error' : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  placeholder="you@company.com"
                  onKeyDown={e => e.key === 'Enter' && handleEmailLookup()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleEmailLookup}
                  disabled={lookupLoading}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {lookupLoading ? <span className="spinner" /> : 'Look up'}
                </button>
              </div>
              {emailError && <p className="form-error">⚠ {emailError}</p>}
            </div>
            <div className="alert alert-warning" style={{ marginBottom: 0 }}>
              <span>ℹ</span>
              <span>Enter your work email to auto-fill your profile, or proceed to enter details manually.</span>
            </div>
          </div>
        )}

        {lookupDone && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                ✓ Details loaded for <strong>{details.email}</strong>
              </p>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => { setLookupDone(false); setDetails({ email:'',name:'',employee_code:'',designation:'',division:'',joining_date:'',feedback_source:'Voice Box',feedback_collection_date:new Date().toLocaleDateString('en-GB') }) }}
              >
                Change email
              </button>
            </div>

            <div className="info-grid">
              {FIELD_CONFIG.map(cfg => (
                <InfoField
                  key={cfg.key}
                  config={cfg}
                  value={details[cfg.key]}
                  onChange={updateField}
                  disabled={cfg.key === 'feedback_source' || cfg.key === 'feedback_collection_date'}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card-footer">
        <button className="btn btn-ghost" onClick={onPrev}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>
        <button
          className="btn btn-accent"
          onClick={handleSubmit}
          disabled={!lookupDone || isSubmitting}
        >
          {isSubmitting ? <span className="spinner" /> : null}
          {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
          {!isSubmitting && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

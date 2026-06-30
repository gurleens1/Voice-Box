export default function SuccessModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-body">
          <div className="success-icon">✓</div>
          <h2 className="modal-title">Feedback Submitted!</h2>
          <p className="modal-message">
            Thank you for sharing your thoughts. Your feedback has been received and will
            be reviewed by the Culture Team. Every voice counts in making our workplace better.
          </p>
          <div className="modal-contact">
            For urgent matters, reach us at{' '}
            <a href="mailto:wehearyou@damcogroup.com">wehearyou@damcogroup.com</a>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-accent btn-full" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

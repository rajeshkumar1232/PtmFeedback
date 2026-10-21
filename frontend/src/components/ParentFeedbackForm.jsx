import React, { useState } from 'react';

const INITIAL_FORM = {
  studentName: '',
  classSection: '4/A',
  parentName: '',
  mobileNumber: '',
  feedbackComment: '',
  needsAttention: false,
  attentionComment: ''
};

export default function ParentFeedbackForm({ classSections }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'needsAttention') {
      setFormData((prev) => ({
        ...prev,
        needsAttention: checked,
        attentionComment: checked ? prev.attentionComment : ''
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.studentName.trim()) {
      setErrorMessage('Please enter the student name.');
      return;
    }

    if (!formData.classSection) {
      setErrorMessage('Please select the student class and section.');
      return;
    }

    if (!formData.feedbackComment.trim()) {
      setErrorMessage('Please enter your PTM feedback comment.');
      return;
    }

    if (formData.needsAttention && !formData.attentionComment.trim()) {
      setErrorMessage('Please enter the comment for Principal / Admin attention.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          classSection: formData.classSection,
          parentName: formData.parentName.trim() || null,
          mobileNumber: formData.mobileNumber.trim() || null,
          feedbackComment: formData.feedbackComment.trim(),
          needsAttention: formData.needsAttention,
          attentionComment: formData.needsAttention
            ? formData.attentionComment.trim()
            : null
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit feedback. Please try again.');
      }

      setSubmittedRecord(data);
    } catch (err) {
      setErrorMessage(err.message || 'Network error while submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrorMessage('');
    setSubmittedRecord(null);
  };

  if (submittedRecord) {
    return (
      <div className="card form-card">
        <div className="alert alert-success">
          Thank you! Your PTM feedback has been recorded successfully.
        </div>

        <div style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          <p>
            <strong>Student Name:</strong> {submittedRecord.studentName}
          </p>
          <p>
            <strong>Class / Section:</strong> {submittedRecord.classSection}
          </p>
          {submittedRecord.parentName && (
            <p>
              <strong>Parent Name:</strong> {submittedRecord.parentName}
            </p>
          )}
          {submittedRecord.needsAttention && (
            <p style={{ color: '#b45309', marginTop: '0.35rem', fontWeight: 600 }}>
              Flagged for Principal / Admin Attention
            </p>
          )}
        </div>

        <button type="button" className="btn btn-primary" onClick={handleReset}>
          Submit Another Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <h1 className="card-title">Parent PTM Feedback Form</h1>
        <p className="card-description">
          Welcome! No login or password is required for parents. Please share your feedback below.
        </p>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentName" className="form-label">
              Student Name <span className="required-star">*</span>
            </label>
            <input
              id="studentName"
              name="studentName"
              type="text"
              className="form-control"
              placeholder="Enter student's full name"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="classSection" className="form-label">
              Class &amp; Section <span className="required-star">*</span>
            </label>
            <select
              id="classSection"
              name="classSection"
              className="form-control"
              value={formData.classSection}
              onChange={handleChange}
              required
            >
              {classSections.map((cs) => (
                <option key={cs} value={cs}>
                  {cs}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="parentName" className="form-label">
              Parent Name <span className="optional-tag">(Optional)</span>
            </label>
            <input
              id="parentName"
              name="parentName"
              type="text"
              className="form-control"
              placeholder="Enter parent/guardian name"
              value={formData.parentName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber" className="form-label">
              Mobile Number <span className="optional-tag">(Optional)</span>
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              className="form-control"
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedbackComment" className="form-label">
            PTM Feedback / Comments <span className="required-star">*</span>
          </label>
          <textarea
            id="feedbackComment"
            name="feedbackComment"
            className="form-control"
            placeholder="Share your experience and feedback regarding the Parent-Teacher Meeting..."
            value={formData.feedbackComment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="attention-box">
          <label className="checkbox-label" htmlFor="needsAttention">
            <input
              id="needsAttention"
              name="needsAttention"
              type="checkbox"
              checked={formData.needsAttention}
              onChange={handleChange}
            />
            <span>
              Does this comment need Principal or Admin attention?
            </span>
          </label>

          {formData.needsAttention && (
            <div className="attention-Conditional">
              <label htmlFor="attentionComment" className="form-label" style={{ color: '#92400e' }}>
                Comment for Principal / Admin Attention <span className="required-star">*</span>
              </label>
              <textarea
                id="attentionComment"
                name="attentionComment"
                className="form-control"
                placeholder="Please describe the specific matter that requires Principal or Admin attention..."
                value={formData.attentionComment}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting Feedback...' : 'Submit PTM Feedback'}
        </button>
      </form>
    </div>
  );
}

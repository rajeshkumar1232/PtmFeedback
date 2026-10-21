import React, { useEffect, useState, useCallback } from 'react';

export default function FacultyDashboard({ session, classSections, onUnauthorized }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedClass) {
        params.set('classSection', selectedClass);
      }
      if (attentionOnly) {
        params.set('needsAttention', 'true');
      }

      const queryString = params.toString();
      const url = `/api/v1/feedback${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      });

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load feedback records.');
      }

      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to fetch feedback records.');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, attentionOnly, session.token, onUnauthorized]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const attentionCount = feedbackList.filter((item) => item.needsAttention).length;

  return (
    <div>
      <div className="dashboard-toolbar">
        <div>
          <h1 className="card-title">
            {session.displayName} PTM Feedback Dashboard
          </h1>
          <p className="card-description">
            View and filter parent feedback submitted across classes 1/A to 10/D.
          </p>
        </div>

        <div className="filter-controls">
          <div className="filter-item">
            <label htmlFor="filterClassSection" className="form-label">
              Filter by Class / Section
            </label>
            <select
              id="filterClassSection"
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes (1/A - 10/D)</option>
              {classSections.map((cs) => (
                <option key={cs} value={cs}>
                  {cs}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item" style={{ paddingBottom: '0.45rem' }}>
            <label className="checkbox-label" htmlFor="filterAttentionOnly">
              <input
                id="filterAttentionOnly"
                type="checkbox"
                checked={attentionOnly}
                onChange={(e) => setAttentionOnly(e.target.checked)}
              />
              <span>Needs Principal / Admin Attention Only</span>
            </label>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchFeedback}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Matching Feedback Entries</div>
          <div className="stat-value">{feedbackList.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Flagged for Principal / Admin</div>
          <div className="stat-value" style={{ color: '#b45309' }}>
            {attentionCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Class Filter</div>
          <div className="stat-value" style={{ color: '#1e40af' }}>
            {selectedClass || 'All'}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          Loading PTM feedback records...
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#475569' }}>
          No PTM feedback records found for the selected filter criteria.
        </div>
      ) : (
        <div className="feedback-list">
          {feedbackList.map((item) => (
            <div
              key={item.id}
              className={`feedback-item ${item.needsAttention ? 'attention-highlight' : ''}`}
            >
              <div className="feedback-meta">
                <div className="student-badge-group">
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {item.studentName}
                  </span>
                  <span className="class-badge">Class {item.classSection}</span>
                  {item.needsAttention && (
                    <span className="attention-badge">
                      Needs Principal / Admin Attention
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : ''}
                </span>
              </div>

              <div className="parent-details">
                <span>
                  <strong>Parent Name:</strong> {item.parentName || 'Not provided'}
                </span>
                <span>
                  <strong>Mobile:</strong> {item.mobileNumber || 'Not provided'}
                </span>
              </div>

              <div className="comment-block">
                <strong>PTM Feedback:</strong>
                <div style={{ marginTop: '0.25rem' }}>{item.feedbackComment}</div>
              </div>

              {item.needsAttention && item.attentionComment && (
                <div className="attention-comment-block">
                  <strong>Principal / Admin Attention Note:</strong>
                  <div style={{ marginTop: '0.25rem' }}>{item.attentionComment}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

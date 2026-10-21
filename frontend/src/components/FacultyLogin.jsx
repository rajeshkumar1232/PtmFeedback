import React, { useState } from 'react';

export default function FacultyLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('classteacher');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Invalid faculty credentials.');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Unable to log in. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-card">
      <div className="card-header">
        <h1 className="card-title">Faculty Login</h1>
        <p className="card-description">
          Sign in as Class Teacher, Principal, or Admin to view PTM feedback.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="facultyRoleUser" className="form-label">
            Faculty Role / Username
          </label>
          <select
            id="facultyRoleUser"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            <option value="classteacher">Class Teacher (classteacher)</option>
            <option value="principal">Principal (principal)</option>
            <option value="admin">Admin (admin)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="facultyPassword" className="form-label">
            Password
          </label>
          <input
            id="facultyPassword"
            type="password"
            className="form-control"
            placeholder="Enter faculty password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Login to Dashboard'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Back to Parent Form
          </button>
        </div>
      </form>
    </div>
  );
}

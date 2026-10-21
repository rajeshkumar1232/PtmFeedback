import React, { useState } from 'react';
import ParentFeedbackForm from './components/ParentFeedbackForm.jsx';
import FacultyLogin from './components/FacultyLogin.jsx';
import FacultyDashboard from './components/FacultyDashboard.jsx';

export const CLASS_SECTIONS = (() => {
  const sections = ['A', 'B', 'C', 'D'];
  const list = [];
  for (let grade = 1; grade <= 10; grade++) {
    for (const sec of sections) {
      list.push(`${grade}/${sec}`);
    }
  }
  return list;
})();

export default function App() {
  const [view, setView] = useState('parent'); // 'parent' | 'login' | 'dashboard'
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ptm_faculty_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (sessionData) => {
    sessionStorage.setItem('ptm_faculty_session', JSON.stringify(sessionData));
    setSession(sessionData);
    setView('dashboard');
  };

  const handleLogout = async () => {
    if (session?.token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` }
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    sessionStorage.removeItem('ptm_faculty_session');
    setSession(null);
    setView('parent');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <div className="brand-title">PTM Feedback Portal</div>
            <div className="brand-subtitle">
              Parent-Teacher Meeting Automated Feedback System (v1.1)
            </div>
          </div>

          <div className="nav-actions">
            {session ? (
              <>
                <span className="role-badge">{session.displayName}</span>
                {view !== 'dashboard' && (
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setView('dashboard')}
                  >
                    Faculty Dashboard
                  </button>
                )}
                {view !== 'parent' && (
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setView('parent')}
                  >
                    Parent Form
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {view === 'parent' ? (
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setView('login')}
                  >
                    Faculty Login
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setView('parent')}
                  >
                    Back to Parent Form
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'parent' && <ParentFeedbackForm classSections={CLASS_SECTIONS} />}
        {view === 'login' && (
          <FacultyLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setView('parent')}
          />
        )}
        {view === 'dashboard' && session && (
          <FacultyDashboard
            session={session}
            classSections={CLASS_SECTIONS}
            onUnauthorized={handleLogout}
          />
        )}
      </main>

      <footer className="app-footer">
        PTM Feedback Automation System &bull; Version 1.1 &bull; Accessible on Mobile &amp; Desktop
      </footer>
    </div>
  );
}

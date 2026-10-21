(function () {
  'use strict';

  // If opened directly as a local file or on another port, point to localhost:8080
  const API_BASE =
    window.location.protocol === 'file:' || (window.location.port && window.location.port !== '8080')
      ? 'http://localhost:8080/api/v1'
      : '/api/v1';

  // Generate 1/A, 1/B, 1/C, 1/D ... 10/A, 10/B, 10/C, 10/D
  const CLASS_SECTIONS = [];
  const SECTIONS = ['A', 'B', 'C', 'D'];
  for (let grade = 1; grade <= 10; grade++) {
    for (let i = 0; i < SECTIONS.length; i++) {
      CLASS_SECTIONS.push(grade + '/' + SECTIONS[i]);
    }
  }

  // State
  let currentView = 'parent'; // 'parent' | 'success' | 'login' | 'dashboard'
  let session = loadSession();

  // DOM Elements
  const roleBadge = document.getElementById('roleBadge');
  const btnNavDashboard = document.getElementById('btnNavDashboard');
  const btnNavParent = document.getElementById('btnNavParent');
  const btnNavLogin = document.getElementById('btnNavLogin');
  const btnNavLogout = document.getElementById('btnNavLogout');

  const viewParentForm = document.getElementById('viewParentForm');
  const viewParentSuccess = document.getElementById('viewParentSuccess');
  const viewFacultyLogin = document.getElementById('viewFacultyLogin');
  const viewFacultyDashboard = document.getElementById('viewFacultyDashboard');

  // Parent Form Elements
  const parentFeedbackForm = document.getElementById('parentFeedbackForm');
  const studentNameInput = document.getElementById('studentName');
  const classSectionSelect = document.getElementById('classSection');
  const parentNameInput = document.getElementById('parentName');
  const mobileNumberInput = document.getElementById('mobileNumber');
  const feedbackCommentInput = document.getElementById('feedbackComment');
  const needsAttentionCheckbox = document.getElementById('needsAttention');
  const attentionCommentSection = document.getElementById('attentionCommentSection');
  const attentionCommentInput = document.getElementById('attentionComment');
  const parentErrorAlert = document.getElementById('parentErrorAlert');
  const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
  const submittedSummary = document.getElementById('submittedSummary');
  const btnSubmitAnother = document.getElementById('btnSubmitAnother');

  // Login Elements
  const facultyLoginForm = document.getElementById('facultyLoginForm');
  const facultyUsernameInput = document.getElementById('facultyUsername');
  const facultyPasswordInput = document.getElementById('facultyPassword');
  const loginErrorAlert = document.getElementById('loginErrorAlert');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');
  const btnLoginCancel = document.getElementById('btnLoginCancel');

  // Dashboard Elements
  const dashboardTitle = document.getElementById('dashboardTitle');
  const filterClassSection = document.getElementById('filterClassSection');
  const filterAttentionOnly = document.getElementById('filterAttentionOnly');
  const btnRefreshDashboard = document.getElementById('btnRefreshDashboard');
  const statTotal = document.getElementById('statTotal');
  const statAttention = document.getElementById('statAttention');
  const statClassFilter = document.getElementById('statClassFilter');
  const dashboardErrorAlert = document.getElementById('dashboardErrorAlert');
  const dashboardListContainer = document.getElementById('dashboardListContainer');

  function loadSession() {
    try {
      const raw = sessionStorage.getItem('ptm_faculty_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(data) {
    session = data;
    if (data) {
      sessionStorage.setItem('ptm_faculty_session', JSON.stringify(data));
    } else {
      sessionStorage.removeItem('ptm_faculty_session');
    }
  }

  function populateClassDropdowns() {
    classSectionSelect.innerHTML = '';
    filterClassSection.innerHTML = '<option value="">All Classes (1/A - 10/D)</option>';

    CLASS_SECTIONS.forEach(function (cs) {
      const opt1 = document.createElement('option');
      opt1.value = cs;
      opt1.textContent = cs;
      if (cs === '4/A') {
        opt1.selected = true;
      }
      classSectionSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = cs;
      opt2.textContent = cs;
      filterClassSection.appendChild(opt2);
    });
  }

  function switchView(viewName) {
    currentView = viewName;

    viewParentForm.classList.toggle('hidden', viewName !== 'parent');
    viewParentSuccess.classList.toggle('hidden', viewName !== 'success');
    viewFacultyLogin.classList.toggle('hidden', viewName !== 'login');
    viewFacultyDashboard.classList.toggle('hidden', viewName !== 'dashboard');

    updateNavHeader();

    if (viewName === 'dashboard' && session) {
      dashboardTitle.textContent = session.displayName + ' PTM Feedback Dashboard';
      fetchFeedbackList();
    }
  }

  function updateNavHeader() {
    if (session) {
      roleBadge.textContent = session.displayName;
      roleBadge.classList.remove('hidden');
      btnNavLogout.classList.remove('hidden');
      btnNavLogin.classList.add('hidden');

      btnNavDashboard.classList.toggle('hidden', currentView === 'dashboard');
      btnNavParent.classList.toggle('hidden', currentView === 'parent' || currentView === 'success');
    } else {
      roleBadge.classList.add('hidden');
      btnNavLogout.classList.add('hidden');
      btnNavDashboard.classList.add('hidden');

      if (currentView === 'login') {
        btnNavLogin.classList.add('hidden');
        btnNavParent.classList.remove('hidden');
      } else {
        btnNavLogin.classList.remove('hidden');
        btnNavParent.classList.add('hidden');
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Toggle conditional Principal/Admin attention textbox
  needsAttentionCheckbox.addEventListener('change', function () {
    const checked = needsAttentionCheckbox.checked;
    attentionCommentSection.classList.toggle('hidden', !checked);
    if (!checked) {
      attentionCommentInput.value = '';
    }
  });

  // Submit Parent Feedback
  parentFeedbackForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    parentErrorAlert.classList.add('hidden');

    const studentName = studentNameInput.value.trim();
    const classSection = classSectionSelect.value;
    const parentName = parentNameInput.value.trim();
    const mobileNumber = mobileNumberInput.value.trim();
    const feedbackComment = feedbackCommentInput.value.trim();
    const needsAttention = needsAttentionCheckbox.checked;
    const attentionComment = attentionCommentInput.value.trim();

    if (!studentName) {
      showError(parentErrorAlert, 'Please enter the student name.');
      return;
    }
    if (!classSection) {
      showError(parentErrorAlert, 'Please select the student class and section.');
      return;
    }
    if (!feedbackComment) {
      showError(parentErrorAlert, 'Please enter your PTM feedback comment.');
      return;
    }
    if (needsAttention && !attentionComment) {
      showError(parentErrorAlert, 'Please enter the comment for Principal / Admin attention.');
      return;
    }

    btnSubmitFeedback.disabled = true;
    btnSubmitFeedback.textContent = 'Submitting Feedback...';

    try {
      const response = await fetch(API_BASE + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName,
          classSection: classSection,
          parentName: parentName || null,
          mobileNumber: mobileNumber || null,
          feedbackComment: feedbackComment,
          needsAttention: needsAttention,
          attentionComment: needsAttention ? attentionComment : null
        })
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit feedback. Please try again.');
      }

      renderSubmittedSummary(data);
      switchView('success');
    } catch (err) {
      showError(parentErrorAlert, err.message || 'Network error while submitting feedback.');
    } finally {
      btnSubmitFeedback.disabled = false;
      btnSubmitFeedback.textContent = 'Submit PTM Feedback';
    }
  });

  function renderSubmittedSummary(record) {
    let html =
      '<p><strong>Student Name:</strong> ' + escapeHtml(record.studentName) + '</p>' +
      '<p><strong>Class / Section:</strong> ' + escapeHtml(record.classSection) + '</p>';

    if (record.parentName) {
      html += '<p><strong>Parent Name:</strong> ' + escapeHtml(record.parentName) + '</p>';
    }
    if (record.needsAttention) {
      html +=
        '<p style="color:#b45309;font-weight:600;margin-top:0.35rem;">Flagged for Principal / Admin Attention</p>';
    }
    submittedSummary.innerHTML = html;
  }

  btnSubmitAnother.addEventListener('click', function () {
    parentFeedbackForm.reset();
    classSectionSelect.value = '4/A';
    attentionCommentSection.classList.add('hidden');
    parentErrorAlert.classList.add('hidden');
    switchView('parent');
  });

  // Faculty Login
  facultyLoginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginErrorAlert.classList.add('hidden');

    const username = facultyUsernameInput.value.trim();
    const password = facultyPasswordInput.value;

    if (!username || !password) {
      showError(loginErrorAlert, 'Please enter both username and password.');
      return;
    }

    btnLoginSubmit.disabled = true;
    btnLoginSubmit.textContent = 'Signing In...';

    try {
      const response = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.message || 'Invalid faculty credentials.');
      }

      facultyPasswordInput.value = '';
      saveSession(data);
      switchView('dashboard');
    } catch (err) {
      showError(loginErrorAlert, err.message || 'Unable to log in. Verify backend is running.');
    } finally {
      btnLoginSubmit.disabled = false;
      btnLoginSubmit.textContent = 'Login to Dashboard';
    }
  });

  // Fetch Dashboard Feedback
  async function fetchFeedbackList() {
    if (!session) return;

    dashboardErrorAlert.classList.add('hidden');
    btnRefreshDashboard.disabled = true;
    btnRefreshDashboard.textContent = 'Refreshing...';
    dashboardListContainer.innerHTML =
      '<div class="card empty-state-card">Loading PTM feedback records...</div>';

    const selectedClass = filterClassSection.value;
    const attentionOnly = filterAttentionOnly.checked;
    statClassFilter.textContent = selectedClass || 'All';

    const params = new URLSearchParams();
    if (selectedClass) params.set('classSection', selectedClass);
    if (attentionOnly) params.set('needsAttention', 'true');

    const query = params.toString();
    const url = API_BASE + '/feedback' + (query ? '?' + query : '');

    try {
      const response = await fetch(url, {
        headers: { Authorization: 'Bearer ' + session.token }
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const items = await response.json().catch(function () {
        return [];
      });

      if (!response.ok) {
        throw new Error(items.message || 'Failed to load feedback records.');
      }

      renderDashboardItems(Array.isArray(items) ? items : []);
    } catch (err) {
      showError(dashboardErrorAlert, err.message || 'Unable to fetch feedback records.');
      dashboardListContainer.innerHTML = '';
    } finally {
      btnRefreshDashboard.disabled = false;
      btnRefreshDashboard.textContent = 'Refresh';
    }
  }

  function renderDashboardItems(items) {
    const attentionCount = items.filter(function (i) {
      return i.needsAttention;
    }).length;

    statTotal.textContent = String(items.length);
    statAttention.textContent = String(attentionCount);

    if (items.length === 0) {
      dashboardListContainer.innerHTML =
        '<div class="card empty-state-card">No PTM feedback records found for the selected filter criteria.</div>';
      return;
    }

    const html = items
      .map(function (item) {
        const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
        const highlightClass = item.needsAttention ? 'attention-highlight' : '';
        const attentionBadgeHtml = item.needsAttention
          ? '<span class="attention-badge">Needs Principal / Admin Attention</span>'
          : '';
        const attentionNoteHtml =
          item.needsAttention && item.attentionComment
            ? '<div class="attention-comment-block"><strong>Principal / Admin Attention Note:</strong><div style="margin-top:0.25rem;">' +
              escapeHtml(item.attentionComment) +
              '</div></div>'
            : '';

        return (
          '<div class="feedback-item ' +
          highlightClass +
          '">' +
          '<div class="feedback-meta">' +
          '<div class="student-badge-group">' +
          '<span style="font-weight:700;font-size:1.05rem;">' +
          escapeHtml(item.studentName) +
          '</span>' +
          '<span class="class-badge">Class ' +
          escapeHtml(item.classSection) +
          '</span>' +
          attentionBadgeHtml +
          '</div>' +
          '<span style="font-size:0.82rem;color:#64748b;">' +
          escapeHtml(createdDate) +
          '</span>' +
          '</div>' +
          '<div class="parent-details">' +
          '<span><strong>Parent Name:</strong> ' +
          escapeHtml(item.parentName || 'Not provided') +
          '</span>' +
          '<span><strong>Mobile:</strong> ' +
          escapeHtml(item.mobileNumber || 'Not provided') +
          '</span>' +
          '</div>' +
          '<div class="comment-block"><strong>PTM Feedback:</strong><div style="margin-top:0.25rem;">' +
          escapeHtml(item.feedbackComment) +
          '</div></div>' +
          attentionNoteHtml +
          '</div>'
        );
      })
      .join('');

    dashboardListContainer.innerHTML = html;
  }

  async function handleLogout() {
    if (session && session.token) {
      try {
        await fetch(API_BASE + '/auth/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + session.token }
        });
      } catch (e) {
        // ignore network error
      }
    }
    saveSession(null);
    switchView('parent');
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
  }

  // Navigation Listeners
  btnNavLogin.addEventListener('click', function () {
    loginErrorAlert.classList.add('hidden');
    switchView('login');
  });

  btnLoginCancel.addEventListener('click', function () {
    switchView('parent');
  });

  btnNavParent.addEventListener('click', function () {
    switchView('parent');
  });

  btnNavDashboard.addEventListener('click', function () {
    switchView('dashboard');
  });

  btnNavLogout.addEventListener('click', handleLogout);

  filterClassSection.addEventListener('change', fetchFeedbackList);
  filterAttentionOnly.addEventListener('change', fetchFeedbackList);
  btnRefreshDashboard.addEventListener('click', fetchFeedbackList);

  // Initialize
  populateClassDropdowns();
  switchView('parent');
})();

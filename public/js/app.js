/**
 * Frontend Application Logic for College Complaint Management System (CMS)
 */

let currentUser = null;
let currentComplaints = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCurrentUser();
  
  // Listen for hash changes or set initial view
  const hash = window.location.hash.replace('#', '') || 'profile';
  navigate(hash);

  // Setup sidebar toggle
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar.style.display === 'none') {
        sidebar.style.display = 'flex';
      } else {
        sidebar.style.display = 'none';
      }
    });
  }
});

// Fetch current user from server session
async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/me');
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      renderUserData(currentUser);
    } else {
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('Failed to load student profile:', err);
  }
}

// Render user info across UI
function renderUserData(user) {
  // Sidebar
  document.getElementById('sidebarUserName').textContent = user.fullName || 'Student';
  document.getElementById('sidebarUserUSN').textContent = `USN: ${user.usn}`;

  // Profile Form (Exact match with screenshot)
  document.getElementById('profileCardTitle').textContent = `${user.fullName}'s Profile`;
  document.getElementById('profileUsnTag').textContent = `USN: ${user.usn}`;
  document.getElementById('profileLastUpdated').textContent = user.lastUpdated || user.regDate || '2026-10-17 10:00:00';
  document.getElementById('profFullName').value = user.fullName || '';
  document.getElementById('profEmail').value = user.userEmail || '';
  document.getElementById('profContact').value = user.contact || '';
  document.getElementById('profAddress').value = user.address || '';
  if (user.state) document.getElementById('profState').value = user.state;
  document.getElementById('profCountry').value = user.country || 'India';
  document.getElementById('profPincode').value = user.pincode || '';
  document.getElementById('profRegDate').value = user.regDate || '';

  // Lodge complaint form prefill
  document.getElementById('lodgeUsnTag').textContent = `Logged as USN: ${user.usn}`;
  document.getElementById('complaintUsn').value = user.usn;
  document.getElementById('complaintStudentName').value = user.fullName;
  document.getElementById('cmpDept').value = user.department || 'Computer Science & Engineering';

  // Dashboard banner
  document.getElementById('dashStudentName').textContent = user.fullName;
  document.getElementById('dashStudentUSN').textContent = user.usn;
}

// Navigation router
function navigate(viewName) {
  // Hide all views
  const views = ['profile', 'lodge-complaint', 'complaint-history', 'dashboard'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const navLink = document.getElementById(`nav-${v}`);
    if (el) el.style.display = 'none';
    if (navLink) navLink.classList.remove('active');
  });

  // Activate selected
  const activeView = document.getElementById(`view-${viewName}`) || document.getElementById('view-profile');
  const activeNav = document.getElementById(`nav-${viewName}`) || document.getElementById('nav-profile');
  if (activeView) activeView.style.display = 'block';
  if (activeNav) activeNav.classList.add('active');

  // Update Breadcrumb text
  const breadcrumbEl = document.getElementById('breadcrumbText');
  switch (viewName) {
    case 'dashboard':
      breadcrumbEl.textContent = 'Dashboard';
      loadDashboardStats();
      break;
    case 'lodge-complaint':
      breadcrumbEl.textContent = 'Lodge Complaint';
      break;
    case 'complaint-history':
      breadcrumbEl.textContent = 'Complaint History';
      loadComplaintHistory();
      break;
    case 'profile':
    default:
      breadcrumbEl.textContent = 'Profile info';
      break;
  }

  window.location.hash = viewName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Notification banner
function showPageNotification(msg, isSuccess = true) {
  const note = document.getElementById('pageNotification');
  note.textContent = msg;
  note.className = 'alert-box ' + (isSuccess ? 'alert-success' : 'alert-danger');
  note.style.display = 'block';
  setTimeout(() => {
    note.style.display = 'none';
  }, 4500);
}

// Save Profile handler (matching exact screenshot form)
async function handleProfileSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('profFullName').value.trim();
  const userEmail = document.getElementById('profEmail').value.trim();
  const contact = document.getElementById('profContact').value.trim();
  const address = document.getElementById('profAddress').value.trim();
  const state = document.getElementById('profState').value;
  const country = document.getElementById('profCountry').value.trim();
  const pincode = document.getElementById('profPincode').value.trim();

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, userEmail, contact, address, state, country, pincode })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      renderUserData(currentUser);
      showPageNotification('Profile updated successfully!', true);
    } else {
      showPageNotification(data.message || 'Failed to update profile.', false);
    }
  } catch (err) {
    showPageNotification('Network error while saving profile.', false);
  }
}

// Category change helper
function handleCategoryChange() {
  const cat = document.getElementById('cmpCategory').value;
  const deptInput = document.getElementById('cmpDept');
  if (cat.includes('Hostel')) {
    deptInput.value = 'Hostel Administration / Warden Office';
  } else if (cat.includes('Library')) {
    deptInput.value = 'Central Library Wing';
  } else if (cat.includes('Wi-Fi') || cat.includes('Internet')) {
    deptInput.value = 'Campus Network & IT Infrastructure';
  } else if (cat.includes('Mess') || cat.includes('Canteen')) {
    deptInput.value = 'Food & Canteen Committee';
  } else if (cat.includes('Accounts')) {
    deptInput.value = 'Accounts & Finance Section';
  } else if (cat.includes('Anti-Ragging')) {
    deptInput.value = 'Anti-Ragging & Disciplinary Squad';
  } else if (currentUser && currentUser.department) {
    deptInput.value = currentUser.department;
  }
}

// Lodge Complaint Handler
async function handleLodgeComplaint(e) {
  e.preventDefault();
  const category = document.getElementById('cmpCategory').value;
  const complaintType = document.getElementById('cmpType').value;
  const department = document.getElementById('cmpDept').value.trim();
  const priority = document.getElementById('cmpPriority').value;
  const location = document.getElementById('cmpLocation').value.trim();
  const subject = document.getElementById('cmpSubject').value.trim();
  const description = document.getElementById('cmpDescription').value.trim();

  if (!category || !subject || !description) {
    showPageNotification('Please fill in Category, Subject and Complaint Description.', false);
    return;
  }

  const payload = {
    category,
    complaintType,
    department,
    priority,
    location,
    subject,
    description
  };

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showPageNotification(`Complaint #${data.complaint.id} registered under USN ${currentUser.usn}!`, true);
      document.getElementById('lodgeComplaintForm').reset();
      // Re-populate fixed fields
      renderUserData(currentUser);
      setTimeout(() => {
        navigate('complaint-history');
      }, 900);
    } else {
      showPageNotification(data.message || 'Error submitting complaint.', false);
    }
  } catch (err) {
    showPageNotification('Error lodging complaint. Please try again.', false);
  }
}

// Load Complaint History
async function loadComplaintHistory() {
  try {
    const res = await fetch('/api/complaints');
    const data = await res.json();
    if (data.success) {
      currentComplaints = data.complaints;
      renderComplaintsTable(currentComplaints);
    }
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

// Render Table
function renderComplaintsTable(complaintList) {
  const tbody = document.getElementById('complaintsTableBody');
  if (!complaintList || complaintList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: #888;">
          No complaints registered under USN <strong>${currentUser ? currentUser.usn : ''}</strong> yet.<br>
          <button class="btn-primary-cms" style="margin-top: 12px; padding: 6px 18px;" onclick="navigate('lodge-complaint')">Lodge Your First Complaint</button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = complaintList.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td>${c.category}</td>
      <td style="max-width: 260px; font-weight: 500;">${c.subject}</td>
      <td style="color: #666; font-size: 12.5px;">${c.regDate}</td>
      <td>
        <span class="badge badge-priority-${c.priority.toLowerCase()}">${c.priority}</span>
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span>
      </td>
      <td style="text-align: center;">
        <button class="btn-sm-action" onclick="viewComplaintTicket('${c.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Details
        </button>
      </td>
    </tr>
  `).join('');
}

// Status badge helper
function getStatusBadgeClass(status) {
  if (status === 'Resolved') return 'badge-resolved';
  if (status === 'In Process') return 'badge-in-process';
  return 'badge-pending';
}

// Filter History Table
function filterHistoryTable() {
  const q = document.getElementById('historySearch').value.toLowerCase();
  const statusFilter = document.getElementById('historyStatusFilter').value;

  const filtered = currentComplaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(q) ||
                          c.subject.toLowerCase().includes(q) ||
                          c.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  renderComplaintsTable(filtered);
}

// View Complaint Modal Details
function viewComplaintTicket(id) {
  const c = currentComplaints.find(item => item.id === id);
  if (!c) return;

  document.getElementById('modalTitle').textContent = `Complaint Ticket #${c.id}`;
  const modalContent = document.getElementById('modalContent');

  modalContent.innerHTML = `
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Tracking Number:</div>
      <div class="ticket-detail-val"><strong>${c.id}</strong></div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Registered USN:</div>
      <div class="ticket-detail-val"><span class="user-usn-badge" style="background-color: #337ab7; color: #fff;">${c.usn}</span></div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Student Name:</div>
      <div class="ticket-detail-val">${c.studentName}</div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Category:</div>
      <div class="ticket-detail-val">${c.category} (${c.complaintType || 'Complaint'})</div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Department / Wing:</div>
      <div class="ticket-detail-val">${c.department || 'General'}</div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Location / Room:</div>
      <div class="ticket-detail-val">${c.location || 'Campus'}</div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Registration Date:</div>
      <div class="ticket-detail-val">${c.regDate}</div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Priority:</div>
      <div class="ticket-detail-val">
        <span class="badge badge-priority-${c.priority.toLowerCase()}">${c.priority}</span>
      </div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Current Status:</div>
      <div class="ticket-detail-val">
        <span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span>
      </div>
    </div>
    <div class="ticket-detail-row">
      <div class="ticket-detail-label">Subject:</div>
      <div class="ticket-detail-val"><strong>${c.subject}</strong></div>
    </div>
    <div class="ticket-detail-row" style="flex-direction: column; gap: 6px;">
      <div class="ticket-detail-label" style="width: 100%;">Complaint Description:</div>
      <div class="ticket-detail-val" style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0; line-height: 1.5;">
        ${c.description}
      </div>
    </div>
    <div class="ticket-detail-row" style="flex-direction: column; gap: 6px; border-bottom: none;">
      <div class="ticket-detail-label" style="width: 100%;">Administrative Action & Remarks:</div>
      <div class="ticket-detail-val" style="background: #eff6ff; padding: 12px; border-radius: 4px; border: 1px solid #bfdbfe; color: #1e40af; line-height: 1.5;">
        ${c.adminRemarks || 'Assigned to department coordinator for immediate review.'}
      </div>
    </div>
  `;

  document.getElementById('ticketModal').classList.add('show');
}

function closeModal() {
  document.getElementById('ticketModal').classList.remove('show');
}

// Load Dashboard statistics
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      const stats = data.stats;
      document.getElementById('statTotal').textContent = stats.total;
      document.getElementById('statPending').textContent = stats.pending;
      document.getElementById('statInProcess').textContent = stats.inProcess;
      document.getElementById('statResolved').textContent = stats.resolved;

      // Recent complaints
      const recentTbody = document.getElementById('dashboardRecentTableBody');
      if (!data.recent || data.recent.length === 0) {
        recentTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 20px; color: #888;">
              No complaints filed yet.
            </td>
          </tr>
        `;
      } else {
        recentTbody.innerHTML = data.recent.map(c => `
          <tr>
            <td><strong>${c.id}</strong></td>
            <td>${c.category}</td>
            <td style="font-weight: 500;">${c.subject}</td>
            <td style="color: #666; font-size: 12.5px;">${c.regDate}</td>
            <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
            <td>
              <button class="btn-sm-action" onclick="viewComplaintTicket('${c.id}')">View</button>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

// Logout
async function handleLogout() {
  if (confirm('Are you sure you want to log out from CMS?')) {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  }
}

const express = require('express');
const session = require('express-session');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'college-cms-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Auth guard middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(401).json({ success: false, message: 'Please log in with your USN and Date of Birth.' });
  }
  return res.redirect('/login');
}

const PUBLIC_DIR = path.join(__dirname, 'public');

// ----------------- Page Routes ----------------- //

// Root
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile('login.html', { root: PUBLIC_DIR });
});

// App Pages (protected)
app.get(['/dashboard', '/profile', '/lodge-complaint', '/complaint-history'], requireAuth, (req, res) => {
  res.sendFile('index.html', { root: PUBLIC_DIR });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirect: '/login' });
  });
});

// ----------------- API Endpoints ----------------- //

// 1. Login with USN and DOB
app.post('/api/login', (req, res) => {
  const { usn, dob } = req.body;
  if (!usn || !dob) {
    return res.status(400).json({ success: false, message: 'Please provide both USN and Date of Birth.' });
  }

  const result = store.verifyUserLogin(usn, dob);
  if (!result.success) {
    return res.status(401).json(result);
  }

  req.session.user = {
    usn: result.user.usn,
    fullName: result.user.fullName
  };

  res.json({
    success: true,
    message: 'Login successful',
    user: result.user,
    redirect: '/dashboard'
  });
});

// 2. Register New Student
app.post('/api/register', (req, res) => {
  const result = store.registerUser(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }

  req.session.user = {
    usn: result.user.usn,
    fullName: result.user.fullName
  };

  res.status(201).json({
    success: true,
    message: 'Student registered successfully',
    user: result.user,
    redirect: '/dashboard'
  });
});

// 3. Get Current Logged-in User Profile
app.get('/api/me', requireAuth, (req, res) => {
  const user = store.findUserByUSN(req.session.user.usn);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found in system array.' });
  }
  res.json({ success: true, user });
});

// 4. Update Profile
app.put('/api/profile', requireAuth, (req, res) => {
  const result = store.updateUserProfile(req.session.user.usn, req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  req.session.user.fullName = result.user.fullName;
  res.json({ success: true, message: 'Profile updated successfully!', user: result.user });
});

// 5. Get Complaints for Current Logged-in Student
app.get('/api/complaints', requireAuth, (req, res) => {
  const userComplaints = store.getComplaintsByUSN(req.session.user.usn);
  res.json({ success: true, complaints: userComplaints });
});

// 6. Lodge a New Complaint
app.post('/api/complaints', requireAuth, (req, res) => {
  const { category, complaintType, nature, subject, department, location, priority, description } = req.body;
  
  if (!category || !subject || !description) {
    return res.status(400).json({
      success: false,
      message: 'Category, Subject, and Description are required to lodge a complaint.'
    });
  }

  // Register complaint associated with current student's USN
  const result = store.addComplaint({
    usn: req.session.user.usn,
    category,
    complaintType: complaintType || 'Complaint',
    nature: nature || 'General',
    subject,
    department,
    location,
    priority: priority || 'Normal',
    description
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json({
    success: true,
    message: `Complaint #${result.complaint.id} lodged successfully under USN ${req.session.user.usn}!`,
    complaint: result.complaint
  });
});

// 7. Get Single Complaint Details
app.get('/api/complaints/:id', requireAuth, (req, res) => {
  const complaint = store.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }
  // Check that the complaint belongs to this student
  if (complaint.usn.toUpperCase() !== req.session.user.usn.toUpperCase()) {
    return res.status(403).json({ success: false, message: 'Unauthorized access to complaint ticket.' });
  }
  res.json({ success: true, complaint });
});

// 8. Stats for Current Student Dashboard
app.get('/api/stats', requireAuth, (req, res) => {
  const userComplaints = store.getComplaintsByUSN(req.session.user.usn);
  const total = userComplaints.length;
  const pending = userComplaints.filter(c => c.status === 'Pending').length;
  const inProcess = userComplaints.filter(c => c.status === 'In Process').length;
  const resolved = userComplaints.filter(c => c.status === 'Resolved').length;

  res.json({
    success: true,
    stats: {
      total,
      pending,
      inProcess,
      resolved
    },
    recent: userComplaints.slice(0, 5)
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`College Complaint Management System is running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`In-memory Array Storage Active (No MongoDB)`);
  console.log(`Default Demo USN: 1MS21CS001 | DOB: 2002-05-15 (John Smith)`);
  console.log(`====================================================`);
});

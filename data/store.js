/**
 * In-memory Array Store for College Complaint Registration System
 * User requested: "dont use mongo db use array for storing history complaint and user login"
 */

// Users Array (In-Memory)
const users = [
  {
    usn: '1MS21CS001',
    dob: '2002-05-15',
    fullName: 'John Smith',
    userEmail: 'john@gmail.com',
    contact: '9999999999',
    address: 'Room 304, Kaveri Boys Hostel, Campus Block B',
    state: 'Karnataka',
    country: 'India',
    pincode: '560054',
    regDate: '2020-05-08 22:10:50',
    lastUpdated: '2026-10-15 18:24:10',
    department: 'Computer Science & Engineering',
    semester: '6th Semester'
  },
  {
    usn: '1RV22EC045',
    dob: '2003-08-20',
    fullName: 'Priya Sharma',
    userEmail: 'priya.sharma@college.edu',
    contact: '9876543210',
    address: 'Flat 202, Ganga Girls Hostel, College Campus',
    state: 'Karnataka',
    country: 'India',
    pincode: '560054',
    regDate: '2022-09-12 10:15:00',
    lastUpdated: '2026-10-12 14:00:00',
    department: 'Electronics & Communication',
    semester: '4th Semester'
  },
  {
    usn: '1PE21ME088',
    dob: '2002-11-10',
    fullName: 'Rahul Verma',
    userEmail: 'rahul.verma@college.edu',
    contact: '9123456780',
    address: 'House #45, 2nd Cross, College Road',
    state: 'Karnataka',
    country: 'India',
    pincode: '560054',
    regDate: '2021-08-20 09:45:00',
    lastUpdated: '2026-09-30 11:20:00',
    department: 'Mechanical Engineering',
    semester: '6th Semester'
  }
];

// Complaints Array (In-Memory)
const complaints = [
  {
    id: 'CMP-2026-001',
    usn: '1MS21CS001',
    studentName: 'John Smith',
    category: 'Infrastructure & Maintenance',
    complaintType: 'Complaint',
    nature: 'Lab Equipment',
    subject: 'AC not cooling in Computer Lab 3',
    department: 'Computer Science & Engineering',
    location: 'Lab 3, 2nd Floor, Main Tech Block',
    priority: 'Medium',
    description: 'The split AC unit on the north wall of Computer Lab 3 is making loud humming noises and not cooling properly during afternoon lab sessions.',
    status: 'In Process',
    regDate: '2026-10-10 11:30:00',
    adminRemarks: 'Technician dispatched for coil servicing. Parts requested.'
  },
  {
    id: 'CMP-2026-002',
    usn: '1MS21CS001',
    studentName: 'John Smith',
    category: 'Hostel & Accommodation',
    complaintType: 'Complaint',
    nature: 'Plumbing',
    subject: 'Water leakage in 3rd floor washroom',
    department: 'Hostel Maintenance',
    location: 'Room 304 washroom, Kaveri Block',
    priority: 'High',
    description: 'The washbasin supply pipe has an active leak causing water accumulation on the bathroom floor. Needs urgent plumbing fix.',
    status: 'Pending',
    regDate: '2026-10-15 09:15:22',
    adminRemarks: 'Assigned to hostel maintenance supervisor.'
  },
  {
    id: 'CMP-2026-003',
    usn: '1MS21CS001',
    studentName: 'John Smith',
    category: 'Academic & Library',
    complaintType: 'Grievance',
    nature: 'Book Availability',
    subject: 'Insufficient copies of Database Systems textbook in Central Library',
    department: 'Central Library',
    location: 'Stack Section 4, Central Library',
    priority: 'Normal',
    description: 'Database System Concepts by Silberschatz only has 3 reference copies, all of which are permanently issued. Need additional copies for semester project work.',
    status: 'Resolved',
    regDate: '2026-09-28 14:20:10',
    adminRemarks: 'Procured 8 additional copies. Available at circulation counter.'
  },
  {
    id: 'CMP-2026-004',
    usn: '1RV22EC045',
    studentName: 'Priya Sharma',
    category: 'Campus Wi-Fi & Internet',
    complaintType: 'Complaint',
    nature: 'Network Connectivity',
    subject: 'Wi-Fi disconnects frequently in Girls Hostel Block',
    department: 'IT Infrastructure',
    location: 'Ganga Girls Hostel, 2nd Floor corridor',
    priority: 'High',
    description: 'Access point signal drops intermittently every 15-20 minutes during study hours (8 PM - 11 PM).',
    status: 'In Process',
    regDate: '2026-10-14 16:40:00',
    adminRemarks: 'Access Point 204 firmware update scheduled.'
  }
];

let complaintCounter = 5;

// Helper date formatter
function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// User helper functions
function findUserByUSN(usn) {
  if (!usn) return null;
  return users.find(u => u.usn.trim().toUpperCase() === usn.trim().toUpperCase()) || null;
}

function verifyUserLogin(usn, dob) {
  if (!usn || !dob) return { success: false, message: 'USN and Date of Birth are required.' };
  
  const user = findUserByUSN(usn);
  if (!user) {
    return { success: false, message: `No student found with USN "${usn}". Please check your USN or register.` };
  }
  
  // Normalize DOB string (YYYY-MM-DD or DD-MM-YYYY)
  const normInputDob = dob.trim();
  const normUserDob = user.dob.trim();
  
  if (normInputDob !== normUserDob) {
    return { success: false, message: 'Incorrect Date of Birth for this USN. Please verify.' };
  }
  
  return { success: true, user };
}

function registerUser(userData) {
  const { usn, dob, fullName, userEmail, contact, address, state, country, pincode, department, semester } = userData;
  
  if (!usn || !dob || !fullName) {
    return { success: false, message: 'USN, Date of Birth, and Full Name are required.' };
  }
  
  const cleanUSN = usn.trim().toUpperCase();
  if (findUserByUSN(cleanUSN)) {
    return { success: false, message: `Student with USN ${cleanUSN} already exists. Please log in.` };
  }
  
  const now = formatTimestamp();
  const newUser = {
    usn: cleanUSN,
    dob: dob.trim(),
    fullName: fullName.trim(),
    userEmail: userEmail ? userEmail.trim() : `${cleanUSN.toLowerCase()}@college.edu`,
    contact: contact ? contact.trim() : '9999999999',
    address: address ? address.trim() : 'College Hostel / Campus',
    state: state ? state.trim() : 'Karnataka',
    country: country ? country.trim() : 'India',
    pincode: pincode ? pincode.trim() : '560054',
    regDate: now,
    lastUpdated: now,
    department: department ? department.trim() : 'General',
    semester: semester ? semester.trim() : '1st Semester'
  };
  
  users.push(newUser);
  return { success: true, user: newUser };
}

function updateUserProfile(usn, updatedData) {
  const user = findUserByUSN(usn);
  if (!user) return { success: false, message: 'User not found' };
  
  if (updatedData.fullName) user.fullName = updatedData.fullName.trim();
  if (updatedData.userEmail) user.userEmail = updatedData.userEmail.trim();
  if (updatedData.contact) user.contact = updatedData.contact.trim();
  if (updatedData.address) user.address = updatedData.address.trim();
  if (updatedData.state) user.state = updatedData.state.trim();
  if (updatedData.country) user.country = updatedData.country.trim();
  if (updatedData.pincode) user.pincode = updatedData.pincode.trim();
  if (updatedData.department) user.department = updatedData.department.trim();
  if (updatedData.semester) user.semester = updatedData.semester.trim();
  
  user.lastUpdated = formatTimestamp();
  return { success: true, user };
}

// Complaint helper functions
function getComplaintsByUSN(usn) {
  if (!usn) return [];
  const cleanUSN = usn.trim().toUpperCase();
  return complaints.filter(c => c.usn.toUpperCase() === cleanUSN);
}

function getAllComplaints() {
  return complaints;
}

function getComplaintById(id) {
  return complaints.find(c => c.id === id) || null;
}

function addComplaint(complaintData) {
  const { usn, category, complaintType, nature, subject, department, location, priority, description } = complaintData;
  
  if (!usn || !category || !subject || !description) {
    return { success: false, message: 'USN, Category, Subject, and Description are required.' };
  }
  
  const cleanUSN = usn.trim().toUpperCase();
  const user = findUserByUSN(cleanUSN);
  const studentName = user ? user.fullName : 'Student';
  
  const idStr = String(complaintCounter++).padStart(3, '0');
  const complaintId = `CMP-${new Date().getFullYear()}-${idStr}`;
  
  const newComplaint = {
    id: complaintId,
    usn: cleanUSN,
    studentName,
    category: category.trim(),
    complaintType: complaintType ? complaintType.trim() : 'Complaint',
    nature: nature ? nature.trim() : 'General',
    subject: subject.trim(),
    department: department ? department.trim() : (user ? user.department : 'General'),
    location: location ? location.trim() : 'Campus',
    priority: priority ? priority.trim() : 'Normal',
    description: description.trim(),
    status: 'Pending',
    regDate: formatTimestamp(),
    adminRemarks: 'Complaint registered successfully. Assigned to department coordinator.'
  };
  
  complaints.unshift(newComplaint); // Add at beginning so newest comes first
  return { success: true, complaint: newComplaint };
}

module.exports = {
  users,
  complaints,
  findUserByUSN,
  verifyUserLogin,
  registerUser,
  updateUserProfile,
  getComplaintsByUSN,
  getAllComplaints,
  getComplaintById,
  addComplaint,
  formatTimestamp
};

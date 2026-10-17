# College Complaint Management System (CMS)

A full-featured College Complaint Management System built with **Node.js** and **Express.js**.

> 💡 **Design & Architecture Highlights:**
> - **Exact UI recreation** based on the provided reference design:
>   - Mustard yellow header bar (`COMPLAINT MANAGEMENT SYSTEM`) with Cyan `Logout` button
>   - Dark slate sidebar with circular avatar and profile name
>   - Breadcrumb navigation (`> Profile info`, `> Lodge Complaint`, `> Complaint History`, `> Dashboard`)
>   - Two-column profile form with centered blue `Submit` button
>   - Cyan bottom footer (`© 2026 CMS All rights reserved.`)
> - **In-memory Array Storage** (No MongoDB): Stores users and complaint history in JavaScript array structures.
> - **Student Authentication via USN & DOB**: Students log in using their University Seat Number (USN) and Date of Birth (DOB).
> - **Automatic USN Complaint Tagging**: Every registered complaint is permanently associated with the logged-in student's USN and tracking ticket ID.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or
node server.js
```

### 3. Open in Browser
Open: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Pre-seeded Demo Credentials

You can log in directly using any of the following pre-seeded student accounts (or click any of the 1-click demo chips on the login page):

| Student Name | USN | Date of Birth (DOB) | Department |
| :--- | :--- | :--- | :--- |
| **John Smith** (from reference image) | `1MS21CS001` | `2002-05-15` | Computer Science & Engineering |
| **Priya Sharma** | `1RV22EC045` | `2003-08-20` | Electronics & Communication |
| **Rahul Verma** | `1PE21ME088` | `2002-11-10` | Mechanical Engineering |

*You can also register any new student directly via the "New Student Register" tab!*

---

## 📂 Project Structure

```
college-complaint-system/
├── data/
│   └── store.js         # In-memory array store (users, complaints, CRUD methods)
├── public/
│   ├── css/
│   │   └── style.css    # Styling faithful to the provided UI
│   ├── js/
│   │   └── app.js       # Client routing, form handling, API integration
│   ├── index.html       # Main CMS portal (Dashboard, Profile, Lodge, History)
│   └── login.html       # Student login with USN + DOB & registration
├── server.js            # Express server, session auth & REST APIs
└── package.json
```

---

## 📡 API Endpoints

- `POST /api/login` - Authenticate student using USN and DOB
- `POST /api/register` - Register a new student into the in-memory array
- `POST /api/logout` - Clear student session
- `GET /api/me` - Fetch profile of currently logged-in student
- `PUT /api/profile` - Update student profile fields
- `GET /api/complaints` - Fetch complaint history for current student's USN
- `POST /api/complaints` - Register a new complaint tagged with current student's USN
- `GET /api/complaints/:id` - View complete complaint ticket details
- `GET /api/stats` - Summary statistics for the student dashboard
# college-complaint-registration

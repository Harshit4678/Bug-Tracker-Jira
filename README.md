# Bug-Tracker-Jira

**Live demo:** [bug-tracker-jira.vercel.app](https://bug-tracker-jira.vercel.app)  
**Repo:** [github.com/Harshit4678/Bug-Tracker-Jira](https://github.com/Harshit4678/Bug-Tracker-Jira)

A full-featured **Bug Reporting & Tracking System** with secure authentication (Email OTP + Google OAuth), role-based access (Admin / Reporter), filters, analytics, and responsive dashboards.

> Built as a professional assignment project with **React + Vite + Tailwind + Framer Motion + Zustand (frontend)** and **Node.js + Express + MongoDB Atlas (backend)**.  
> Deployment: **Frontend on Vercel** | **Backend on Render**.

---

## 🔑 Demo Credentials

- **Admin**  
  Email: `admin@bugtracker.com`  
  Password: `Admin@123`

_(Admin can see/manage all bugs, reporters can only manage their own.)_

---

## ✨ Features

- **Authentication**
  - Email OTP verification on register
  - Google OAuth
  - Secure password hashing (bcrypt)
  - Forgot-password via email OTP
- **Role-based dashboard**
  - **Admin**: View/manage all bugs, change statuses, see bug stats & activity feed
  - **Reporter**: Manage only own bugs (create, update, change status, filter/search)
- **Bug Management**
  - Create / Update / Track bugs
  - Status flow: `Open → In Progress → Closed`
  - Severity levels
- **Activity Tracking**
  - Every bug change/activity stored
  - Activities can be fetched with pagination (`/api/activities?limit=12&skip=0`)
- **Filters & Search**
  - Filter by status, severity
  - Search by bug title
- **Modern UI**
  - Responsive design
  - Framer Motion animations
  - Clean dashboard layout

---

## 🛠 Tech Stack

**Frontend**

- React (Vite)
- Tailwind CSS
- Framer Motion
- Zustand (state management)

**Backend**

- Node.js
- Express
- MongoDB Atlas
- JWT Auth + Email/Google login

**Deployment**

- Frontend → Vercel
- Backend → Render

---

## 📂 File Structure (short)

```
Bug-Tracker-Jira/
├── backend/                  # Express + MongoDB server
│   ├── routes/               # auth.js, bugs.js, activity.js
│   ├── controllers/          # business logic
│   ├── middleware/           # auth middleware
│   ├── models/               # Mongoose schemas
│   └── server.js             # entrypoint
│
├── bug-tracker-frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Login, Register, Dashboard, etc.
│   │   ├── components/       # UI components
│   │   ├── api.js            # frontend API layer
│   │   └── App.jsx
│
└── README.md
```

---

## 🚀 Quick Setup (Local)

### 1. Clone repo

```bash
git clone https://github.com/Harshit4678/Bug-Tracker-Jira.git
cd Bug-Tracker-Jira
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=some_long_secret
EMAIL_SERVICE=...
EMAIL_USER=...
EMAIL_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend

```bash
cd ../bug-tracker-frontend
npm install
npm run dev
```

Default: http://localhost:5173

---

## 📡 API Routes (summary)

### Auth (`/api/auth`)

- `POST /register` → Register with email/otp
- `POST /verify` → Verify OTP
- `POST /login` → Login with email/password
- `POST /google` → Google login
- `POST /forgot` → Forgot password (send OTP)
- `POST /verify-reset-code` → Verify reset OTP
- `POST /reset` → Reset password

### Bugs (`/api/bugs`)

- `POST /` → Create bug (reporter/admin)
- `GET /` → Get bugs (all for admin, own for reporter)
- `PUT /:id` → Update bug (own if reporter, any if admin)
- `GET /stats` → Get bug stats

### Activities (`/api/activities`)

- `GET /?limit=12&skip=0` → Paginated activities feed

---

## 🔒 Security

- JWT-based auth with role-based middleware
- OTP-based verification and password reset
- Secure password hashing (bcrypt)
- Protected routes (frontend checks + backend middleware)
- Clean separation of concerns (controllers, routes, middleware)

---

## 📝 Notes

- Built with assignment spec + extra polish
- Frontend responsive with professional UX
- Backend structured for scalability
- AI (ChatGPT) used for **debugging assistance, planning, and research**

---

## 📊 Future Improvements

- Unit & integration tests
- HttpOnly cookies instead of localStorage for JWT
- Bug history timeline with comments
- Enhanced analytics dashboard

---

## 👨‍💻 Author

**Harshit K**  
Full-stack Developer (MERN)  
GitHub: [@Harshit4678](https://github.com/Harshit4678)  
Email: harshitkumar2045@gmail.com  
Website: [www.harshitdev.space](http://www.harshitdev.space)

---

👉 Ready-to-run live demo: [bug-tracker-jira.vercel.app](https://bug-tracker-jira.vercel.app)

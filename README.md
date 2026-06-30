# 🎙️ Voice Box — Employee Feedback Platform

An internal feedback system where employees can submit feedback anonymously or with their name, triggering backend storage and email notifications.

---

## 📁 Project Structure

```
voicebox/
├── backend/
│   ├── main.py              ← FastAPI app & route handlers
│   ├── database.py          ← SQLAlchemy engine + session
│   ├── models.py            ← Database table definitions
│   ├── schemas.py           ← Pydantic request/response models
│   ├── email_service.py     ← Email notification logic
│   ├── seed.py              ← Initial categories & test employees
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx     ← Screen 1: Mode selection
│   │   │   ├── FeedbackScreen.jsx    ← Screen 2: Feedback entry
│   │   │   ├── UserDetailsScreen.jsx ← Screen 3: Employee details
│   │   │   └── SuccessModal.jsx      ← Post-submit confirmation
│   │   ├── App.jsx           ← Screen router + submission logic
│   │   ├── api.js            ← Axios API client
│   │   ├── index.css         ← Design system & global styles
│   │   └── main.jsx          ← React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App is live at **http://localhost:5173**

> The Vite proxy automatically routes `/api/*` → `http://localhost:8000/*`  
> so you don't need to configure CORS manually in development.

---

## ⚙️ Environment Variables

### Backend (optional — create `.env` or set in shell)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./voicebox.db` | DB connection string |
| `EMAIL_ENABLED` | `false` | Set to `true` to enable real emails |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port (TLS) |
| `SMTP_USER` | _(empty)_ | SMTP username / Gmail address |
| `SMTP_PASSWORD` | _(empty)_ | SMTP password / App password |
| `ADMIN_EMAIL` | `wehearyou@damcogroup.com` | Admin notification recipient |
| `FROM_EMAIL` | `SMTP_USER` | Sender address |

### Frontend (optional — create `frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Backend base URL (for production deploys) |

---

## 📧 Email Configuration

To enable real email sending:

1. Set `EMAIL_ENABLED=true`
2. Configure SMTP credentials (Gmail example):
   - Use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)
   - Set `SMTP_USER=you@gmail.com` and `SMTP_PASSWORD=your-app-password`

When `EMAIL_ENABLED=false` (default), email sends are **logged** but not actually sent — safe for development.

---

## 🗄️ Database

By default, SQLite is used (`voicebox.db` is created in the `backend/` directory on first run).

**To use PostgreSQL:**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/voicebox"
pip install psycopg2-binary
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/categories` | List all feedback categories |
| `GET` | `/employee?email=` | Fetch employee details by email |
| `POST` | `/feedback/anonymous` | Submit anonymous feedback |
| `POST` | `/feedback/named` | Submit named (attributed) feedback |
| `GET` | `/feedback` | Admin: list all feedback (paginated) |

---

## 🧪 Test Employees (seeded)

| Email | Name | Code | Division |
|---|---|---|---|
| john.doe@damcogroup.com | John Doe | EMP001 | Technology |
| jane.smith@damcogroup.com | Jane Smith | EMP002 | Product |
| alex.kumar@damcogroup.com | Alex Kumar | EMP003 | Human Resources |
| priya.sharma@damcogroup.com | Priya Sharma | EMP004 | Operations |

---

## 🎯 User Flow

```
Welcome Screen
  ├─ Anonymous selected → Feedback Screen → [Submit] → Success
  └─ Named selected → Feedback Screen → User Details Screen → [Submit] → Success
```

1. **Welcome Screen** — Choose anonymous or named submission
2. **Feedback Screen** — Add one or more feedback entries (category + text)
   - Add (+) button creates a new row
   - Delete button removes a row
   - Eye icon previews all entries
3. **User Details Screen** (named only) — Enter email to auto-fill profile
4. **Success Popup** — Confirmation with contact email

---

## 🏗️ Production Build

```bash
# Frontend
cd frontend && npm run build
# Outputs to frontend/dist/

# Serve backend in production
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

To serve the React frontend from FastAPI, copy `frontend/dist` to backend and add:
```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="dist", html=True), name="static")
```

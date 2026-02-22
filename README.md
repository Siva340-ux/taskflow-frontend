# TaskFlow Frontend

A modern, production-grade React frontend for the TaskFlow Spring Boot backend — featuring JWT authentication, a responsive dark-mode dashboard, and full task CRUD.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Your Spring Boot backend running on `http://localhost:8080`

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL (already set to localhost:8080)
# Edit .env if your backend is on a different port/host
REACT_APP_API_URL=http://localhost:8080/api

# 3. Start development server
npm start
```

App opens at **http://localhost:3000**

---

## 📂 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Auth.module.css       # Shared auth styles
│   │   └── ProtectedRoute.js     # JWT-guarded route wrapper
│   └── layout/
│       ├── DashboardLayout.js    # Shell with sidebar + content
│       ├── Sidebar.js            # Collapsible nav + logout
│       └── *.module.css
├── context/
│   └── AuthContext.js            # Global auth state + JWT logic
├── pages/
│   ├── Login.js                  # Sign-in with validation
│   ├── Signup.js                 # Registration with validation
│   ├── Dashboard.js              # Stats, progress, recent tasks
│   ├── Tasks.js                  # Full CRUD + search/filter
│   └── Profile.js                # View & edit profile
├── services/
│   └── api.js                    # Axios instance + all API calls
├── App.js                        # Router + route config
└── index.css                     # CSS variables design system
```

---

## 🔌 API Endpoints Expected (Spring Boot)

| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| POST   | `/api/auth/signup`   | Register user         |
| POST   | `/api/auth/login`    | Login → returns JWT   |
| GET    | `/api/user/profile`  | Get current user      |
| PUT    | `/api/user/profile`  | Update profile        |
| GET    | `/api/tasks`         | List tasks (+ filter) |
| POST   | `/api/tasks`         | Create task           |
| PUT    | `/api/tasks/:id`     | Update task           |
| DELETE | `/api/tasks/:id`     | Delete task           |

### Login response format expected:
```json
{
  "token": "eyJhbGci...",
  "username": "john",
  "email": "john@example.com",
  "role": "USER"
}
```

### Task object format expected:
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Optional details",
  "status": "TODO",
  "priority": "HIGH",
  "createdAt": "2024-01-15T10:00:00"
}
```

---

## 🎨 Design System

- **Theme**: Dark mode — `#080c14` base
- **Fonts**: Syne (display) + DM Sans (body)
- **Colors**: Blue `#3b82f6`, Violet `#8b5cf6`, Emerald `#10b981`
- **All values via CSS variables** in `index.css`

---

## 🔒 Security

- JWT stored in `localStorage` (standard for SPAs)
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests
- 401 responses automatically redirect to `/login`
- All forms have client-side + server-side error handling

---

## 📈 Production Scale Notes

1. **State Management**: For large apps, replace Context API with Zustand or Redux Toolkit
2. **API Layer**: Add React Query for caching, background refresh, optimistic updates
3. **Auth**: Move JWT to `httpOnly` cookies to prevent XSS in high-security contexts
4. **Code Splitting**: Use `React.lazy()` per route for smaller initial bundle
5. **Error Boundaries**: Add route-level error boundaries for resilience
6. **Testing**: Add Jest + React Testing Library for component tests

---

## 🏗️ Build for Production

```bash
npm run build
```

Output in `/build` — deploy to Nginx, Vercel, Netlify, or any static host.

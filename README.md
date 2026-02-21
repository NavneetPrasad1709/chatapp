# Nexus Chat

> A production-grade real-time chat application — built to demonstrate full-stack engineering with modern tooling, clean architecture, and a polished UI/UX.

**Live Demo:** [nexus-chat.vercel.app](https://nexus-chat.vercel.app) &nbsp;·&nbsp; **Backend API:** [nexus-chat-api.onrender.com](https://nexus-chat-api.onrender.com)

---

## What This Project Demonstrates

This isn't a tutorial clone. Nexus Chat was designed and built from scratch to show real-world engineering decisions:

- **WebSocket architecture** — bidirectional real-time communication with Socket.IO, room-based event routing, and presence tracking
- **JWT auth flow** — stateless authentication with protected REST endpoints and socket middleware
- **State management** — Zustand stores with clean separation between auth, chat, and UI state
- **Component design** — reusable, prop-driven React components with no UI library dependencies
- **Responsive UI** — fully custom CSS with a consistent design system (variables, animations, dark theme)
- **Production mindset** — environment-based config, CORS handling, error boundaries, and deployment-ready structure

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite | Fast HMR, modern JSX, optimized builds |
| State | Zustand | Lightweight, no boilerplate, composable |
| Styling | Pure CSS + CSS Variables | Full control, zero runtime cost |
| Backend | Node.js + Express | Minimal, flexible, industry standard |
| Real-time | Socket.IO | Reliable WS with fallback + room support |
| Database | MongoDB + Mongoose | Flexible schema for chat data patterns |
| Auth | JWT | Stateless, scalable, standard |
| Deploy | Vercel + Render | CI/CD from GitHub, free tier, production URLs |

---

## Features

**Messaging**
- Real-time group channels and direct messages
- Edit and delete messages (reflected live for all users)
- Reply-to-message threading
- Paginated message history

**Presence & UX**
- Live typing indicators per room
- Online / offline status for all users
- Smooth animations and transitions throughout
- Fully responsive — mobile sidebar, touch-friendly

**Auth**
- Register and login with JWT
- Protected routes on both client and server
- Persistent sessions via localStorage token

---

## Architecture
```
ChatApp/
├── client/                  # Vite + React SPA
│   └── src/
│       ├── components/      # Sidebar, ChatWindow, MessageBubble, etc.
│       ├── pages/           # AuthPage, ChatPage
│       ├── store/           # Zustand: authStore, chatStore
│       └── styles/          # Global CSS design system
│
└── server/                  # Express + Socket.IO API
    ├── models/              # Mongoose: User, Room, Message
    ├── routes/              # REST: /auth, /rooms, /messages, /users
    ├── middleware/          # JWT verification
    ├── socket/              # Socket.IO event handlers
    └── index.js             # Entry point
```

**Key design decisions:**
- Socket.IO server shares the same Express HTTP server (single port)
- Auth middleware runs on both REST routes and socket handshake
- Zustand stores are the single source of truth — no prop drilling
- All styling via CSS custom properties — no Tailwind, no component library

---

## Local Development

**Prerequisites:** Node.js v18+, a free MongoDB Atlas account

**1. Clone the repo**
```bash
git clone https://github.com/NavneetPrasad1709/ChatApp.git
cd ChatApp
```

**2. Set up environment variables**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chatapp
JWT_SECRET=your_long_random_secret_minimum_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**3. Install and run**
```bash
# Terminal 1 — Backend
cd server && npm install && npm run dev

# Terminal 2 — Frontend
cd client && npm install && npm run dev
```

Open **http://localhost:5173**

---

## Deployment

**Backend → Render**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`
- Env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

**Frontend → Vercel**
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env vars: `VITE_API_URL=https://your-render-url.onrender.com`

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/rooms` | ✓ | User's rooms |
| POST | `/api/rooms` | ✓ | Create channel |
| POST | `/api/rooms/dm` | ✓ | Create or open DM |
| GET | `/api/messages/:roomId` | ✓ | Paginated history |
| GET | `/api/users/search?q=` | ✓ | Find users for DM |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send a message |
| `message:new` | Server → Client | Broadcast to room |
| `message:edit` | Client → Server | Edit, broadcast update |
| `message:delete` | Client → Server | Delete, broadcast |
| `typing:start/stop` | Client → Server | Typing indicator |
| `room:join` | Client → Server | Subscribe to room |
| `users:online` | Server → Client | Presence list |

---

## Production Checklist

- [x] `NODE_ENV=production` on server
- [x] Strong JWT_SECRET (64+ chars)
- [x] CORS locked to frontend domain
- [x] MongoDB Atlas network access configured
- [x] HTTPS on both Vercel and Render (automatic)
- [ ] Rate limiting with `express-rate-limit`
- [ ] Helmet.js security headers

---

*Built by **Navneet Prasad** — [github.com/NavneetPrasad1709](https://github.com/NavneetPrasad1709)*

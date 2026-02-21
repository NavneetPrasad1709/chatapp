# ⚡ Nexus Chat — MERN Real-time Chat App

A production-grade, real-time chat application built with MongoDB, Express, React, and Node.js + Socket.IO.

---

## 🚀 Features

- **Real-time messaging** via WebSockets (Socket.IO)
- **JWT Authentication** — register, login, protected routes
- **Group Channels** (public/private)
- **Direct Messages** between users
- **Typing Indicators** — see who's typing live
- **Online/Offline Status** for all users
- **Message Actions** — edit, delete, reply
- **Message History** with pagination
- **User Search** to start DMs
- **Modern Dark UI** — Syne + Space Mono fonts, accent gradients

---

## 📁 Project Structure

```
nexus-chat/
├── server/          # Express + Socket.IO backend
│   ├── models/      # Mongoose schemas (User, Room, Message)
│   ├── routes/      # REST API routes
│   ├── middleware/  # JWT auth middleware
│   ├── socket/      # Socket.IO event handlers
│   └── index.js     # Entry point
└── client/          # Vite + React frontend
    └── src/
        ├── components/  # UI components
        ├── pages/       # Page-level components
        ├── store/       # Zustand state stores
        └── styles/      # Global CSS
```

---

## 🛠️ Local Development Setup

### Step 1: Prerequisites

Make sure you have installed:
- **Node.js** v18+ → https://nodejs.org
- **npm** v9+
- A **MongoDB Atlas** account → https://cloud.mongodb.com (free tier works)

### Step 2: Clone / Extract the project

```bash
# If you cloned from git:
git clone <your-repo-url>
cd nexus-chat

# Or just navigate to the extracted folder
cd nexus-chat
```

### Step 3: Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **Cluster** (free tier M0)
3. Click **"Connect"** → **"Drivers"** → copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
5. Add `/chatapp` at the end: `mongodb+srv://...mongodb.net/chatapp`
6. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all) for development

### Step 4: Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chatapp
JWT_SECRET=make_this_a_very_long_random_string_at_least_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 5: Install dependencies

```bash
# In the root directory:
cd server && npm install
cd ../client && npm install
```

### Step 6: Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open your browser at **http://localhost:5173** 🎉

---

## ☁️ Deployment Guide

### Option A: Deploy on Render (Recommended — Free)

#### Deploy the Backend

1. Push your code to GitHub
2. Go to https://render.com → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Add **Environment Variables**:
   ```
   PORT=10000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
6. Click **Deploy** — you'll get a URL like `https://nexus-chat-api.onrender.com`

#### Deploy the Frontend

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables:**
   ```
   VITE_API_URL=https://nexus-chat-api.onrender.com
   ```
5. Update `client/vite.config.js` proxy target to your Render URL in production

> **Note:** Alternatively, you can serve the client build from Express in production. See the section below.

---

### Option B: Full Stack on Render (Single Service)

Add this to `server/index.js` after build:

```js
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

Build the client first:
```bash
cd client && npm run build
```

Then deploy the whole project with:
- **Root Directory:** `.` (root)
- **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
- **Start Command:** `node server/index.js`

---

### Option C: Deploy on Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add a MongoDB plugin or use Atlas URI
4. Set environment variables
5. Railway auto-detects Node.js and deploys

---

## 🔧 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, random `JWT_SECRET` (at least 64 chars)
- [ ] Set `CLIENT_URL` to your actual frontend domain
- [ ] Enable MongoDB Atlas IP allowlist (or 0.0.0.0/0 for all)
- [ ] Set up HTTPS (Render and Vercel do this automatically)
- [ ] Consider adding rate limiting (`express-rate-limit`)
- [ ] Consider adding helmet.js for security headers

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand |
| Styling | Pure CSS with CSS Variables |
| Backend | Node.js, Express.js |
| Real-time | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Fonts | Syne, Space Mono (Google Fonts) |

---

## 📞 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/rooms` | Get user's rooms |
| POST | `/api/rooms` | Create channel |
| POST | `/api/rooms/dm` | Create/get DM room |
| GET | `/api/messages/:roomId` | Get messages |
| GET | `/api/users/search?q=` | Search users |

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client→Server | Send a message |
| `message:new` | Server→Client | New message broadcast |
| `message:edit` | Client→Server | Edit a message |
| `message:delete` | Client→Server | Delete a message |
| `typing:start` | Client→Server | User started typing |
| `typing:stop` | Client→Server | User stopped typing |
| `room:join` | Client→Server | Join a room |
| `users:online` | Server→Client | Online users list |

---

Built with ❤️ — By Navneet Prasad - Nexus Chat

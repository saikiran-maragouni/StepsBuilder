# StepsBuilder 🚀

**Your Personal Goal Operating System — powered by Gemini AI**

StepsBuilder turns your ambitions into a structured, AI-generated roadmap — then keeps you moving with daily tasks, a natural journal, intelligent nudges, and weekly insights.

🔗 **Live Demo:** [stepsbuilder.vercel.app](https://stepsbuilder.vercel.app)  
👤 **Try it instantly:** Click "Try Demo — No sign up needed" on the login page

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **AI Roadmap Builder** | Describe your goal in plain language. Gemini AI generates a structured, phased roadmap tailored to your context |
| ✅ **Smart Daily Tasks** | AI generates a personalized daily to-do list based on your current roadmap step and available hours |
| 📓 **Natural Journal** | Write freely about your day. Gemini reads it and maps your activity to roadmap progress |
| 🔔 **Intelligent Nudges** | The system detects momentum drops and sends personalized motivational nudges |
| 📊 **Weekly Insights** | Gemini-generated weekly summaries: accomplishments, trends, and what to focus on next |
| 🧠 **Adaptive Learning** | The system learns from your corrections and adapts to your work style over time |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router v7** — client-side routing
- **Axios** — API communication
- **Lucide React** — icons
- **@xyflow/react** — visual roadmap graph
- Deployed on **Vercel**

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose** — primary database
- **Redis (ioredis)** — caching for roadmaps and tasks
- **JWT** — authentication
- **Google Gemini AI** (`@google/generative-ai`) — roadmap generation, task planning, journal analysis, nudges, insights
- **node-cron** — midnight adaptation engine (runs for all users daily)
- **Razorpay** — payment integration (Pro plan)
- Deployed on **Render**

---

## 🏗️ Architecture

```
StepsBuilder/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Route-level page components
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext, ToastContext
│   │   └── utils/           # Axios instance, helpers
│   └── vercel.json          # SPA routing fix for Vercel
│
└── server/                  # Express backend
    ├── controllers/         # Route handlers (auth, goals, roadmap, tasks, journal, nudges, insights)
    ├── models/              # Mongoose schemas (User, Goal, Roadmap, Task, Journal, Nudge)
    ├── routes/              # Express routers
    ├── services/            # Gemini AI service, adaptation engine
    ├── middleware/          # JWT auth middleware
    └── config/              # MongoDB + Redis connection
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Google Gemini API key

### 1. Clone the repo

```bash
git clone https://github.com/saikiran-maragouni/StepsBuilder.git
cd StepsBuilder
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:5000`.

---

## 🔑 Key API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/demo` | Instant demo access (no signup) |
| `GET` | `/api/goals` | Get all user goals |
| `POST` | `/api/goals` | Create a new goal |
| `POST` | `/api/goals/:id/roadmap` | Generate AI roadmap for a goal |
| `GET` | `/api/tasks/today` | Get today's AI-generated tasks |
| `POST` | `/api/journal` | Submit a journal entry |
| `GET` | `/api/insights` | Get weekly AI insights |
| `GET` | `/api/nudges` | Get personalized nudges |

---

## 🎯 How It Works

1. **Create a Goal** — Give it a title, category, and context (your background, available hours/day)
2. **Generate Roadmap** — Gemini AI builds a multi-phase roadmap with steps and estimated timelines
3. **Get Daily Tasks** — Each morning, AI generates tasks based on your current roadmap step
4. **Journal Your Day** — Write naturally; Gemini maps your entry to roadmap progress
5. **Receive Nudges** — The adaptation engine runs nightly and sends nudges when momentum drops
6. **Review Weekly** — Get an AI-written summary of your week every Sunday

---

## 📸 Screenshots

> Visit the [live demo](https://stepsbuilder.vercel.app) to explore the full app instantly with the demo account.

---

## 🤝 Contributing

This is a portfolio project. Feel free to fork and build on it!

---

## 📄 License

MIT — free to use for personal and commercial projects.

---

<p align="center">Built with ❤️ by <a href="https://github.com/saikiran-maragouni">Saikiran Maragouni</a></p>

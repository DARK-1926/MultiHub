# MultiHub (RankStack) ⚡

> High-Velocity Multi-Platform Competitive Programming & Coding Intelligence Matrix.

![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-brightgreen.svg)

MultiHub is a unified dashboard tracking active coding platforms concurrently across multiple users:
- **LeetCode**
- **CodeChef** (multiple accounts, separate panels)
- **GeeksforGeeks**
- **Codeforces**
- **GitHub**

---

## ⚡ Features

- **Multi-User Isolation**: Individual user accounts with Neon PostgreSQL backend and cookie-based sessions.
- **Accurate Live Scrapers**: Real-time problem stats, rating charts, and streak heatmaps without mock data.
- **Contest Radar**: Live tracking for upcoming contests across CodeChef, Codeforces, LeetCode, and GfG.
- **AI CP Coach**: Dual-engine AI coach with live toggle between **Groq (LPU Qwen 3.8 / OSS)** and **Gemini 2.5 Flash**, formatted with rich markdown.
- **Automated Alerts**: Email reminders (Maileroo API) and WhatsApp alerts (CallMeBot) for contests, daily streaks, and streak-break warnings.
- **Brutalist Dark Aesthetic**: Black brutalist cybernetic UI with responsive mobile navigation and 3D parallax effects.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/DARK-1926/MultiHub.git
cd MultiHub
npm install
```

### 2. Configure Environment (.env.local)
Create a `.env.local` file with:
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Auth Secret
AUTH_SECRET=your_auth_secret_key

# AI Keys
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Maileroo Email API
MAILEROO_SENDING_KEY=your_maileroo_sending_key
MAILEROO_FROM_EMAIL=bot@codereminder.maileroo.app

# Cron Secret
CRON_SECRET=your_cron_secret
```

### 3. Run Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Deployment

Optimized for **Vercel** with cron support configured in `vercel.json`.

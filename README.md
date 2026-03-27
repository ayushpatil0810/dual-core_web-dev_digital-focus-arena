# 🚀 FocusArena — Multiplayer Study & Work Focus Platform

> **Focus together. Drift apart, together.** A real-time collaborative focus platform where users create or join timed "focus rooms" to study or work together with real-time accountability.

---

## 📋 Problem Statement

Solo study timers and productivity apps fail because there's **no social consequence** for:
- Switching tabs and checking social media
- Getting distracted or going idle
- Not completing tasks

Students and remote workers need **lightweight accountability** without intrusive monitoring — just enough **social pressure to stay on task** during collaborative work sessions.

---

## ✨ Solution Overview

**FocusArena** is a real-time collaborative focus platform that turns studying into a social experience:

- **Create a room in 10 seconds** — generate a shareable 6-character code
- **See your friends' focus status live** — who's on task, who just switched tabs
- **End-of-session leaderboard** — ranked by focus scores, creates friendly competition
- **No friction joining** — only hosts need GitHub OAuth, friends join with just a code
- **Real-time accountability** — visible tab switches and inactivity badges keep everyone engaged

### Key Features
✅ Real-time synchronized timers (no drift across clients)  
✅ Live tab-switch detection & broadcasting  
✅ Focus score leaderboard with rankings  
✅ Task tracking per member  
✅ Idle detection (2-minute inactivity)  
✅ Session history & stats dashboard  
✅ No authentication required to join  

---

## 🛠 Tech Stack Used

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack in one repo, custom server support |
| **Language** | TypeScript (93.1%) | Type safety, better developer experience |
| **Styling** | Tailwind CSS (3.6%) | Utility-first, rapid UI development |
| **UI Components** | shadcn/ui | Accessible, unstyled-first design system |
| **Authentication** | Better Auth (GitHub OAuth) | Simple OAuth-only flows, modern alternative to NextAuth |
| **Real-time** | Socket.io | Room-based events, auto-reconnect, WebSocket support |
| **Database** | PostgreSQL (via Neon) | Free serverless tier, production-ready |
| **ORM** | Drizzle ORM | Type-safe, zero-runtime overhead |
| **Icons** | Tabler Icons + Lucide React | Beautiful, consistent icon library |
| **Animations** | Canvas Confetti | Celebratory animations for session completion |
| **Deployment** | Railway/Vercel | Supports persistent WebSocket connections |
| **Package Manager** | pnpm | Fast, efficient dependency management |

**Language Breakdown:**
- TypeScript: 93.1%
- CSS: 3.6%
- JavaScript: 3.3%

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **GitHub OAuth App** credentials (for authentication)
- **PostgreSQL** database (or Neon serverless)
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushpatil0810/dual-core_web-dev_digital-focus-arena.git
   cd dual-core_web-dev_digital-focus-arena
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host/focusarena

   # Better Auth
   BETTER_AUTH_SECRET=your-random-32-character-secret
   BETTER_AUTH_URL=http://localhost:3000

   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-oauth-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

   # App
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   pnpm run db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Running in Production

```bash
# Build the app
pnpm run build

# Start production server
pnpm start
```

### Available Scripts

```bash
pnpm run dev        # Start development server with custom Socket.io server
pnpm run build      # Build for production
pnpm start          # Run production server
pnpm run lint       # Run ESLint
```

---

## 📁 Project Structure

```
dual-core_web-dev_digital-focus-arena/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── sign-in/                  # GitHub OAuth flow
│   ├── dashboard/                # User stats & history
│   └── room/
│       ├── create/               # Create new focus room
│       ├── join/                 # Join by code
│       └── [code]/               # Live focus room & summary
├── components/
│   ├── landing/                  # Hero, features, CTA sections
│   ├── room/                     # Timer, member panel, controls
│   ├── summary/                  # Leaderboard, stats
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── useTabGuard.ts           # Page Visibility API
│   ├── useInactivity.ts         # Idle detection
│   ├── useTimer.ts              # Synchronized countdown
│   └── useSocket.ts             # Socket.io management
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── db.ts                    # Database connection
│   ├── socket.ts                # Socket.io server setup
│   └── utils.ts                 # Helpers & score calc
├── models/                       # Database schemas
├── server.js                     # Custom Next.js + Socket.io server
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS config
└── package.json                 # Dependencies & scripts
```

---

## 🎮 How It Works

### For Room Host
1. Click **"Create a Room"** → Authenticate with GitHub
2. Set session name, duration (25/50/90 min), max members
3. Share the 6-character code with friends
4. Click **"Start Session"** when ready
5. Watch the live room as members join and stay focused

### For Room Guests
1. Click **"Join a Room"** (no login needed)
2. Enter the 6-character room code
3. Enter your display name
4. Join the live session and start focusing!

### During Session
- ⏱ **Synchronized Timer** — counts down for all members
- 👀 **Tab Switch Detection** — visible notifications when members switch tabs
- 📊 **Live Focus Score** — real-time ranking based on focus behavior
- 📋 **Task Tracking** — add and check off tasks
- 🔴 **Status Badges** — Focused / Distracted / Idle

### After Session
- 🏆 **Leaderboard** — ranked by focus score
- 📈 **Statistics** — tab switches, idle time, tasks completed
- 💾 **History** — saved to your dashboard (for authenticated users)

---

## 🧑‍💼 Team Members

| Name | Role | GitHub |
|------|------|--------|
| Ayush Patil | Team Lead & Full-Stack Developer | [@ayushpatil0810](https://github.com/ayushpatil0810) |
| [Team Member 2] | [Role] | [GitHub Link] |
| [Team Member 3] | [Role] | [GitHub Link] |

*Note: Add team member details as needed*

---

## 🎯 Key Technical Features

### Real-Time Synchronization
- Server broadcasts absolute `endsAt` timestamp on session start
- Clients compute remaining time locally every second
- **Zero drift** across all participants

### Focus Score Formula
```typescript
focusScore = Math.max(0, Math.round(
  100
  - (tabSwitches × 10)
  - (idleMinutes × 5)
  + (tasksCompleted / totalTasks × 20)
))
```

### Tab Switch Detection
Uses **Page Visibility API** to detect when users switch away:
```typescript
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    tabSwitches++
    socket.emit("tab-switch", { roomCode, userName })
  }
})
```

---

## 📱 Pages & Routes

| Route | Purpose | Auth Required |
|-------|---------|---|
| `/` | Landing page | No |
| `/sign-in` | GitHub OAuth | No |
| `/dashboard` | User stats & history | Yes |
| `/room/create` | Create new room | Yes |
| `/room/join` | Join by code | No |
| `/room/[code]` | Live focus room | No |
| `/room/[code]/summary` | Session leaderboard | No |

---

## 🚢 Deployment

### Deploy to Railway (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect repository to Railway
# - Add environment variables in Railway dashboard
# - Set start command: node server.js
# - Railway auto-assigns URL
```

### Environment Variables for Production
```env
DATABASE_URL=postgresql://user:password@host/focusarena
BETTER_AUTH_SECRET=<production-secret>
BETTER_AUTH_URL=https://your-app.railway.app
GITHUB_CLIENT_ID=<oauth-app-id>
GITHUB_CLIENT_SECRET=<oauth-app-secret>
NEXT_PUBLIC_SITE_URL=https://your-app.railway.app
NODE_ENV=production
```

---

## 📚 Resources & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Socket.io API](https://socket.io/docs/v4/server-api/)
- [Better Auth Documentation](https://www.better-auth.com/)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for **Hash It Out Hackathon** — Web/Android Track
- Inspired by **study-with-me communities** and **co-working culture**
- Thanks to the **open-source community** for amazing tools!

---

<div align="center">

**Made with ❤️ by the FocusArena Team**

[Deploy to Railway](https://railway.app) • [GitHub](https://github.com/ayushpatil0810/dual-core_web-dev_digital-focus-arena) • [Live Demo](#)

</div>

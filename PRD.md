# Product Requirements Document
## FocusArena — Multiplayer Study & Work Focus Platform

**Version:** 1.0  
**Date:** March 2026  
**Status:** Ready for Development  
**Hackathon:** Hash It Out — Web/Android Track

---

## 1. Product Overview

### 1.1 Vision
FocusArena is a real-time collaborative focus platform where users create or join timed "focus rooms" to study or work together. Peer visibility — seeing when your roommates get distracted — creates natural accountability that solo timers can't replicate.

### 1.2 Problem Statement
Solo study timers fail because there's no social consequence for switching tabs, checking Instagram, or going idle. Students and remote workers need lightweight accountability without intrusive monitoring — just enough social pressure to stay on task.

### 1.3 Value Proposition
- Create a room in 10 seconds, share a 6-character code
- See your friends' focus status live — who's on task, who just switched tabs
- End-of-session leaderboard with focus scores creates friendly competition
- No accounts required to join — only hosts need GitHub OAuth

### 1.4 Target Users
- College/university students doing group study sessions
- Remote teams doing co-working sprints (Pomodoro-style)
- Study-with-me communities (YouTube/Discord audiences)

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack in one repo, custom server support |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Utility-first, fast to build |
| Components | shadcn/ui | Accessible, unstyled-first, pairs perfectly with Tailwind |
| Auth | Better Auth (GitHub OAuth) | Modern auth library, simpler than NextAuth for OAuth-only flows |
| Real-time | Socket.io | Room-based events, auto-reconnect, works with custom server |
| Database | MongoDB Atlas | Free tier, flexible schema for room/session data |
| ODM | Mongoose | Schema validation on top of MongoDB |
| Deploy | Railway | Supports persistent WebSocket server; one-command deploy |
| Package Manager | pnpm | Faster installs during hackathon |

---

## 3. Application Pages & Routes

### 3.1 Route Map

```
/                        → Landing page (public, SaaS-style)
/sign-in                 → GitHub OAuth sign-in (Better Auth)
/dashboard               → Authenticated user dashboard (past sessions, stats)
/room/create             → Create a new focus room (auth required)
/room/join               → Enter a room code to join (no auth required)
/room/[code]             → Live focus room
/room/[code]/summary     → Post-session summary & leaderboard
/api/auth/[...all]       → Better Auth handler
/api/rooms               → POST create room, GET room by code
/api/sessions            → POST save completed session
```

---

## 4. Feature Specifications

### 4.1 Landing Page (SaaS-style)

**Purpose:** Convert visitors into users. Explain the product, show social proof, drive sign-up.

**Sections (in order):**

#### Hero Section
- Headline: Bold, large — e.g. *"Focus together. Drift apart, together."*
- Sub-headline: One sentence explaining the product
- Two CTAs: **"Create a Room"** (primary, requires auth) and **"Join a Room"** (secondary, no auth)
- Visual: Animated mockup of the focus room UI showing live member cards
- Background: Dark theme with subtle animated noise/grain texture

#### How It Works (3 steps)
1. Create a room & set your timer
2. Share the 6-character code with friends
3. Focus together — see who stays on task

#### Feature Highlights (3–4 cards)
- 👁 Live accountability — tab switches are visible to the whole room
- ⏱ Synchronized timers — everyone starts and ends together
- 📊 Focus scores — ranked leaderboard at session end
- 🔒 No-friction joining — friends join with just a code, no account needed

#### Social Proof / Stats Section
- Mock stats: "2,400+ focus sessions completed", "87% average focus score", etc.

#### CTA Banner
- "Ready to focus?" + **"Start a Free Room"** button

#### Footer
- Logo, tagline, GitHub link, built-for-hackathon note

**Design Direction:**
- Dark background (`#0A0A0F`)
- Accent: Electric teal/green (`#00E5A0`)
- Font: Display — `Syne` or `Cabinet Grotesk`; Body — `DM Sans`
- Glassmorphism cards with subtle border glow
- Animated gradient orbs in background (CSS only)
- Smooth scroll, stagger-in animations on scroll

---

### 4.2 Authentication

**Provider:** Better Auth with GitHub OAuth only

**Flow:**
1. User clicks "Create a Room" or "Sign In"
2. Redirected to `/sign-in` — single "Continue with GitHub" button
3. GitHub OAuth flow → callback → session cookie set by Better Auth
4. Redirect to `/room/create` or `/dashboard`

**Session storage:** Better Auth session in MongoDB (same DB)

**What requires auth:**
- Creating a room
- Viewing personal dashboard
- Saving session history

**What does NOT require auth:**
- Joining a room (guests enter name + code)
- Viewing the landing page

**Better Auth Setup:**
```ts
// lib/auth.ts
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"

export const auth = betterAuth({
  database: mongodbAdapter(client),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
})
```

---

### 4.3 Dashboard (Authenticated)

**Route:** `/dashboard`

**Components:**
- Header with user avatar (from GitHub), name, sign-out button
- Stats row: Total sessions, Total focus time (hrs), Average focus score, Best streak
- "Create New Room" button → `/room/create`
- Past Sessions table: date, duration, members count, your score, room code
- Empty state if no sessions yet

**Data source:** `sessions` MongoDB collection filtered by `userId`

---

### 4.4 Room Creation

**Route:** `/room/create`  
**Auth required:** Yes

**Form fields:**
- Session name (optional, e.g. "CS Exam Prep")
- Duration: preset buttons — 25 min / 50 min / 90 min — or custom input
- Max members: 2–8 (default 4)

**On submit:**
1. `POST /api/rooms` — creates room document in MongoDB, returns 6-char code
2. User is redirected to `/room/[code]` as host
3. Room code displayed prominently with one-click copy button

**Room code generation:**
```ts
import { nanoid } from "nanoid"
const code = nanoid(6).toUpperCase() // e.g. "AB3X7K"
```

---

### 4.5 Room Join

**Route:** `/room/join`  
**Auth required:** No

**Form fields:**
- Room code (6 chars, auto-uppercase)
- Display name (guests) — pre-filled from GitHub name if authenticated

**Validation:**
- Check room exists via `GET /api/rooms?code=AB3X7K`
- Check room is not full
- Check room status is `waiting` or `active` (can join mid-session)

**On success:** Redirect to `/room/[code]?name=<displayName>`

---

### 4.6 Focus Room (Core Feature)

**Route:** `/room/[code]`

**Layout:** Two-panel

#### Left Panel — Your Focus Space
- Large circular countdown timer (SVG-based, animated progress ring)
- Timer state: Not started / Running / Paused / Ended
- Your task list: add up to 5 tasks, check off as completed
- Your live stats: focus score, tab switches (private count)
- Status indicator: 🟢 Focused / 🔴 Distracted / ⏸ Paused

#### Right Panel — The Room
- Room name + code (copy button)
- Members list (cards):
  - Avatar (GitHub avatar or colored initial)
  - Display name
  - Status badge: Focused / Distracted / Idle
  - Tab switches count (👀 visible to everyone)
  - Tasks: X/Y completed
  - Live focus score
- Host controls (host only): Start Session, End Session buttons
- "Waiting for host..." state before session starts

#### Room States
| State | Description |
|---|---|
| `waiting` | Host created room, waiting for members to join |
| `active` | Session running, timer counting down |
| `ended` | Timer hit zero or host ended — redirect to summary |

#### Tab Switch Detection
```ts
// hooks/useTabGuard.ts
useEffect(() => {
  const handler = () => {
    if (document.hidden) {
      setSwitches(s => s + 1)
      socket.emit("tab-switch", { roomCode, userName })
    }
  }
  document.addEventListener("visibilitychange", handler)
  return () => document.removeEventListener("visibilitychange", handler)
}, [])
```

#### Inactivity Detection
- Track `mousemove`, `keydown`, `click` events
- If no activity for 2 minutes → emit `user-idle` event
- Members see "idle" badge on that person's card

#### Timer Sync Strategy
- On `start-session`, server broadcasts `endsAt: Date` (absolute timestamp)
- Each client computes `remaining = endsAt - Date.now()` locally every second
- No per-tick socket messages — zero drift across clients

---

### 4.7 Socket.io Events

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomCode, userName, userId? }` | Join a room socket namespace |
| `start-session` | `{ roomCode }` | Host starts the session (host only) |
| `end-session` | `{ roomCode }` | Host ends early (host only) |
| `tab-switch` | `{ roomCode, userName }` | User switched away from tab |
| `user-idle` | `{ roomCode, userName }` | User went idle (2 min no activity) |
| `user-active` | `{ roomCode, userName }` | User returned from idle |
| `task-update` | `{ roomCode, userName, tasks }` | Task checked/unchecked |
| `leave-room` | `{ roomCode }` | User explicitly leaves |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `members-updated` | `Member[]` | Broadcast whenever member list changes |
| `session-started` | `{ endsAt: string }` | Broadcast to all — start timers |
| `session-ended` | `{ reason: "timeout" \| "host" }` | Redirect all to summary |
| `member-distracted` | `{ userName, switches }` | Tab switch broadcast |
| `member-idle` | `{ userName }` | Idle broadcast |
| `member-active` | `{ userName }` | Active-again broadcast |
| `member-left` | `{ userName }` | Disconnect broadcast |

---

### 4.8 Session Summary & Leaderboard

**Route:** `/room/[code]/summary`  
**Redirect:** Automatic when `session-ended` event received

**Layout:**

#### Header
- "Session Complete!" with confetti animation (canvas-confetti)
- Session name, duration, date

#### Leaderboard (full-width table)
- Rank | Name | Focus Score | Time Focused | Tab Switches | Tasks Done
- Sorted by focus score descending
- Winner gets 🏆 crown badge
- Your row highlighted

#### Focus Score Formula
```
focusScore = Math.max(0, Math.round(
  100
  - (tabSwitches * 10)
  - (idleMinutes * 5)
  + (tasksCompleted / totalTasks * 20)
))
```

#### Share / Action buttons
- "Copy Results" — copies leaderboard as text
- "New Session" — back to create room
- "Dashboard" — view history (auth users only)

**Data persistence:** On `session-ended`, each client POSTs their stats to `POST /api/sessions`. Server also saves full room summary.

---

## 5. Data Models

### Room
```ts
interface Room {
  _id: ObjectId
  code: string           // "AB3X7K"
  name: string           // "CS Exam Prep"
  hostId: string         // Better Auth userId
  duration: number       // minutes
  maxMembers: number
  status: "waiting" | "active" | "ended"
  members: Member[]
  startedAt?: Date
  endsAt?: Date
  createdAt: Date
}
```

### Member
```ts
interface Member {
  socketId: string
  userId?: string        // null for guests
  name: string
  avatar?: string
  isHost: boolean
  isActive: boolean
  status: "focused" | "distracted" | "idle"
  tabSwitches: number
  idleMinutes: number
  tasks: Task[]
  joinedAt: Date
}
```

### Task
```ts
interface Task {
  id: string
  text: string
  completed: boolean
}
```

### Session (persisted history)
```ts
interface Session {
  _id: ObjectId
  roomCode: string
  roomName: string
  userId: string
  userName: string
  duration: number
  focusScore: number
  tabSwitches: number
  idleMinutes: number
  tasksCompleted: number
  totalTasks: number
  memberCount: number
  rank: number
  createdAt: Date
}
```

---

## 6. File & Folder Structure

```
focusarena/
├── server.js                    # Custom Next.js + Socket.io server
├── next.config.ts
├── tailwind.config.ts
├── components.json              # shadcn/ui config
│
├── app/
│   ├── layout.tsx               # Root layout, providers
│   ├── page.tsx                 # Landing page
│   ├── sign-in/
│   │   └── page.tsx             # GitHub OAuth sign-in page
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard
│   ├── room/
│   │   ├── create/page.tsx      # Room creation form
│   │   ├── join/page.tsx        # Join by code form
│   │   ├── [code]/
│   │   │   ├── page.tsx         # Live focus room
│   │   │   └── summary/page.tsx # Post-session summary
│   └── api/
│       ├── auth/[...all]/route.ts   # Better Auth handler
│       ├── rooms/route.ts           # GET/POST rooms
│       └── sessions/route.ts        # POST sessions
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── Stats.tsx
│   │   ├── CTABanner.tsx
│   │   └── Footer.tsx
│   ├── room/
│   │   ├── CountdownTimer.tsx   # SVG progress ring timer
│   │   ├── TaskList.tsx         # Add/check tasks
│   │   ├── MemberCard.tsx       # Individual member status card
│   │   ├── MemberPanel.tsx      # Right panel — all members
│   │   ├── RoomCode.tsx         # Display + copy code
│   │   ├── FocusScore.tsx       # Live score display
│   │   └── SessionControls.tsx  # Start/End buttons (host)
│   ├── summary/
│   │   ├── Leaderboard.tsx
│   │   └── StatCard.tsx
│   └── ui/                      # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── avatar.tsx
│       ├── progress.tsx
│       └── toast.tsx
│
├── hooks/
│   ├── useTabGuard.ts           # Page Visibility API hook
│   ├── useInactivity.ts         # Mouse/keyboard idle detection
│   ├── useTimer.ts              # Countdown from endsAt timestamp
│   ├── useSocket.ts             # Socket.io connection + event handlers
│   └── useRoom.ts               # Room state management
│
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── db.ts                    # MongoDB/Mongoose connection
│   ├── socket.ts                # Socket.io server instance (singleton)
│   └── utils.ts                 # cn(), nanoid wrapper, score calculator
│
├── models/
│   ├── Room.ts                  # Mongoose Room schema
│   └── Session.ts               # Mongoose Session schema
│
└── types/
    └── index.ts                 # Shared TypeScript interfaces
```

---

## 7. Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/focusarena

# Better Auth
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=https://your-railway-app.railway.app

# GitHub OAuth
GITHUB_CLIENT_ID=<from-github-oauth-app>
GITHUB_CLIENT_SECRET=<from-github-oauth-app>

# App
NEXT_PUBLIC_SITE_URL=https://your-railway-app.railway.app
NODE_ENV=production
```

---

## 8. Key Implementation Notes

### 8.1 Custom Server (server.js)
Next.js must run with a custom HTTP server to support persistent Socket.io connections. Vercel does **not** support this — deploy to **Railway**.

```js
// server.js
const { createServer } = require("http")
const { Server } = require("socket.io")
const next = require("next")
const { connectDB } = require("./lib/db")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  await connectDB()
  const httpServer = createServer(handler)
  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_SITE_URL }
  })

  // Import and register all socket event handlers
  require("./lib/socket").registerHandlers(io)

  httpServer.listen(process.env.PORT || 3000)
  console.log(`> Ready on port ${process.env.PORT || 3000}`)
})
```

### 8.2 shadcn/ui Components to Install
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card badge input dialog avatar progress toast separator
```

### 8.3 Better Auth GitHub Setup
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Homepage URL: your Railway URL
3. Callback URL: `https://your-app.railway.app/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

### 8.4 Focus Score Calculation
```ts
// lib/utils.ts
export function calculateFocusScore({
  tabSwitches,
  idleMinutes,
  tasksCompleted,
  totalTasks,
}: ScoreInput): number {
  const taskBonus = totalTasks > 0
    ? Math.round((tasksCompleted / totalTasks) * 20)
    : 0
  return Math.max(0, Math.min(100,
    100 - (tabSwitches * 10) - (idleMinutes * 5) + taskBonus
  ))
}
```

### 8.5 Timer Sync (No Drift)
```ts
// hooks/useTimer.ts
export function useTimer(endsAt: string | null) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    if (!endsAt) return
    const interval = setInterval(() => {
      const diff = new Date(endsAt).getTime() - Date.now()
      setRemaining(Math.max(0, Math.floor(diff / 1000)))
      if (diff <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  return remaining // seconds
}
```

---

## 9. shadcn/ui Component Usage Map

| Page/Component | shadcn Components Used |
|---|---|
| Landing page | `Button`, `Badge`, `Card` |
| Sign-in page | `Button`, `Card` |
| Room create | `Button`, `Input`, `Card`, `Separator` |
| Room join | `Button`, `Input`, `Card` |
| Focus room | `Button`, `Badge`, `Avatar`, `Progress`, `Toast`, `Card` |
| Summary page | `Button`, `Card`, `Badge`, `Separator` |
| Dashboard | `Button`, `Card`, `Badge`, `Avatar` |

---

## 10. Deployment Checklist

### Railway Setup
1. Push code to GitHub
2. New Railway project → Deploy from GitHub repo
3. Add all environment variables in Railway dashboard
4. Set start command: `node server.js`
5. Railway auto-assigns a `.railway.app` URL

### MongoDB Atlas Setup
1. Create free M0 cluster
2. Create DB user with read/write access
3. Whitelist `0.0.0.0/0` (all IPs) for Railway dynamic IPs
4. Copy connection string to `MONGODB_URI`

### GitHub OAuth Setup
1. GitHub → Settings → Developer Settings → OAuth Apps
2. Set callback: `https://<app>.railway.app/api/auth/callback/github`
3. Copy Client ID + Secret

---

## 11. Demo Script (2 minutes for judges)

1. Open landing page — show SaaS hero, scroll through features
2. Click "Create a Room" → GitHub sign-in (fast)
3. Set timer to 25 min, session name "Demo Session"
4. Show the 6-char code — copy it
5. Open incognito window → Join with the code as "Friend 1"
6. Start the session — show synchronized timer in both windows
7. In the incognito window, switch to another tab and come back
8. Show the main window — "Friend 1" now shows 🔴 Distracted + tab switch count
9. End the session early → both windows redirect to summary
10. Show leaderboard with focus scores and rankings

---

## 12. MVP Scope vs. Nice-to-Have

### MVP (must ship in 6 hours)
- [x] Landing page with all sections
- [x] GitHub OAuth via Better Auth
- [x] Room create with code generation
- [x] Room join (no auth)
- [x] Live focus room with synchronized timer
- [x] Tab switch detection + live broadcast
- [x] Member presence panel with status badges
- [x] Session summary with leaderboard
- [x] Deploy to Railway

### Nice-to-Have (if time allows)
- [ ] Inactivity detection (idle badge)
- [ ] Task list per member
- [ ] Dashboard with session history
- [ ] Ambient sound (lofi/white noise toggle)
- [ ] Reactions (send a 👍 to a focused teammate)
- [ ] Room chat (minimal — just emoji reactions)
- [ ] Pomodoro mode (auto-break intervals)

---

*Document prepared for Hash It Out Hackathon — Web/Android Track*  
*Stack: Next.js 14 · TypeScript · shadcn/ui · Better Auth · Socket.io · MongoDB · Railway*
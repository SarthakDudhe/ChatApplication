<div align="center">

  <!-- App Screenshots Hero Banner -->
  <div style="display: flex; justify-content: center; gap: 10px;">
 <img width="33%" alt="QuickChat Login Screen" src="https://github.com/user-attachments/assets/a1d8d101-c27e-43a7-a085-8adb4f5bfb9e" />
<img width="33%" alt="QuickChat Main Interface" src="https://github.com/user-attachments/assets/12353fc9-cb7d-4312-93f4-f7384e2a3e13" />
<img width="33%" alt="QuickChat Profile View" src="https://github.com/user-attachments/assets/823dbe92-af5a-4a21-9d01-c84d36313951" />
  </div>

  <br />

  <!-- Logo -->
 <img width="250" height="100" alt="QuickChat Logo" src="https://github.com/user-attachments/assets/68d58645-66d4-43a7-92f0-6b1e37ea8dda" />

  <h1>⚡ QuickChat — Real-Time Messaging Platform</h1>

  <p>
    <b>A production-grade, feature-rich chat application engineered with a modern MERN stack,<br/>WebSocket-driven real-time communication, and a premium glassmorphic UI.</b>
  </p>

  <p><i>"Where messages travel at the speed of thought."</i></p>

  <!-- Primary Tech Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS v4" />
    <img src="https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </p>

  <!-- Status Badges -->
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/license-ISC-green.svg?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/deployment-Vercel-black.svg?style=flat-square&logo=vercel" alt="Vercel" />
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=nodedotjs" alt="Node >= 18" />
    <img src="https://img.shields.io/badge/ES_Modules-supported-blue?style=flat-square" alt="ES Modules" />
  </p>

  <!-- Navigation -->
  <p>
    <a href="#-why-this-project-matters">Why It Matters</a> •
    <a href="#-feature-showcase">Features</a> •
    <a href="#-product-walkthrough">Walkthrough</a> •
    <a href="#%EF%B8%8F-architecture--system-design">Architecture</a> •
    <a href="#-technology-ecosystem">Tech Stack</a> •
    <a href="#-installation--local-development">Installation</a> •
    <a href="#-api-reference">API Docs</a> •
    <a href="#-database-schema">Database</a>
  </p>

</div>

---

## 🌟 Why This Project Matters

<table>
<tr>
<td width="50%">

### 🎯 The Problem
Traditional messaging solutions either rely on expensive PaaS platforms (Firebase, Supabase) creating vendor lock-in, or require massive infrastructure investment. Development teams need a **self-hosted, customizable chat infrastructure** that they fully own and control.

### 💡 The Solution
**QuickChat** is a ground-up implementation of enterprise-grade messaging infrastructure using only open-source technologies. Zero PaaS lock-in. Full architectural control. Production-ready deployment via Vercel's edge network.

</td>
<td width="50%">

### 📊 Technical Innovation
- **Hybrid Communication Model** — REST for heavy operations, WebSockets exclusively for real-time events
- **O(1) Message Routing** — In-memory socket map for instant private message delivery
- **Concurrent Query Optimization** — `Promise.all()` for parallel unread count aggregation
- **15-Minute Edit Window** — Time-gated message editing with real-time sync across clients
- **Soft Delete Architecture** — Preserves conversation integrity while removing content

### 🏢 Target Audience
Startups building embedded chat • SaaS platforms needing messaging modules • Enterprise teams requiring self-hosted communication • Developers learning production WebSocket architecture

</td>
</tr>
</table>

---

## ✨ Feature Showcase

### 🔥 Core Real-Time Engine

<table>
<tr>
<td width="33%" align="center">
  <h4>⚡ Instant Messaging</h4>
  <p>Bi-directional WebSocket communication via Socket.io with automatic reconnection and fallback transport layers. Messages appear instantly with zero perceptible delay.</p>
</td>
<td width="33%" align="center">
  <h4>🟢 Live Presence System</h4>
  <p>Real-time online/offline status broadcast to all connected clients via <code>getOnlineUsers</code> event. In-memory <code>userSocketMap</code> provides O(1) lookup for user connection state.</p>
</td>
<td width="33%" align="center">
  <h4>⌨️ Typing Indicators</h4>
  <p>Live "typing..." bubble animation with intelligent debounce (1s timeout). Socket events (<code>typing</code>/<code>stopTyping</code>) are emitted only to the specific recipient — no broadcast noise.</p>
</td>
</tr>
</table>

### 💬 Advanced Messaging Features

<table>
<tr>
<td width="25%" align="center">
  <h4>✏️ Message Editing</h4>
  <p>Edit sent text messages within a <b>15-minute window</b>. Enforces sender-only permission. Image messages are protected from edits. Edited messages show <code>(edited)</code> indicator. Changes sync to recipient in real-time via <code>messageEdited</code> socket event.</p>
</td>
<td width="25%" align="center">
  <h4>🗑️ Soft Delete</h4>
  <p>Messages are soft-deleted — content is cleared but the record persists, preserving thread integrity. Sender-only permission enforcement. Recipient sees <code>"🚫 This message was deleted"</code> in real-time via <code>messageDeleted</code> socket event.</p>
</td>
<td width="25%" align="center">
  <h4>↩️ Reply Threads</h4>
  <p>Reply to any message (text or image) with contextual preview. Replies are stored as <code>replyTo</code> references populated via Mongoose. Reply context shows original sender name and content preview with a violet accent border.</p>
</td>
<td width="25%" align="center">
  <h4>😊 Emoji Picker</h4>
  <p>Full-featured emoji picker via <code>emoji-picker-react</code> with dark theme, search functionality, and click-outside-to-close behavior. Emojis append directly to the input field for seamless composition.</p>
</td>
</tr>
</table>

### 📊 Intelligent Notification System

<table>
<tr>
<td width="50%" align="center">
  <h4>👁️ Read Receipts & Unseen Counter</h4>
  <p>Every message tracks <code>seen</code> status at the database level. Opening a conversation auto-marks all incoming messages as read. Sidebar displays real-time unseen message badges per user, computed server-side via concurrent <code>Promise.all()</code> queries.</p>
</td>
<td width="50%" align="center">
  <h4>🕐 Last Seen Timestamps</h4>
  <p>Precise <code>lastSeen</code> timestamp updated on WebSocket disconnect. Smart formatting: <code>"just now"</code> → <code>"5 min ago"</code> → <code>"3h ago"</code> → <code>"yesterday"</code> → <code>"Jun 10"</code>. Displayed in sidebar and right panel for offline users.</p>
</td>
</tr>
</table>

### 🖼️ Rich Media & Profile Management

<table>
<tr>
<td width="33%" align="center">
  <h4>☁️ Cloudinary Integration</h4>
  <p>Profile pictures and image messages are uploaded via Base64 → Cloudinary pipeline. Secure <code>https://</code> URLs served from Cloudinary CDN. Supports PNG and JPEG formats with client-side MIME type validation.</p>
</td>
<td width="33%" align="center">
  <h4>👤 Dynamic Profiles</h4>
  <p>Full profile CRUD — update display name, bio, and avatar anytime. Changes reflect immediately across all active sessions. Multi-step sign-up flow collects name/email → bio for progressive profiling.</p>
</td>
<td width="33%" align="center">
  <h4>🖼️ Media Gallery</h4>
  <p>Right sidebar aggregates all shared images from the current conversation into a browseable grid gallery. Click-to-open functionality launches full-resolution images in new tabs.</p>
</td>
</tr>
</table>

### 🔐 Security & Authentication

<table>
<tr>
<td width="25%" align="center"><b>JWT Auth</b><br/>Stateless token-based authentication via <code>jsonwebtoken</code>. Token stored in <code>localStorage</code> and sent via custom header.</td>
<td width="25%" align="center"><b>bcrypt Hashing</b><br/>Passwords hashed with 10-round salt via <code>bcryptjs</code>. Raw passwords never stored or logged.</td>
<td width="25%" align="center"><b>Route Protection</b><br/>Server-side middleware validates JWT on every protected route. Client-side route guards redirect unauthenticated users.</td>
<td width="25%" align="center"><b>Payload Limits</b><br/>Strict 15MB request body limit prevents oversized payload attacks and memory exhaustion.</td>
</tr>
</table>

### 🎨 Premium UI/UX

<table>
<tr>
<td width="50%">

- **Glassmorphic Design** — `backdrop-blur-xl`, semi-transparent panels, and gradient accents create a modern depth effect
- **Outfit Typography** — Google Fonts `Outfit` family loaded across all weights for clean, contemporary text rendering
- **Gradient CTAs** — Purple-to-violet gradient buttons (`from-purple-400 to-violet-600`) for primary actions
- **Hidden Scrollbars** — Custom CSS hides all scrollbar chrome for a clean, app-like experience

</td>
<td width="50%">

- **Responsive 3-Panel Layout** — Adaptive grid: 3-column on desktop (`[1fr_2fr_1fr]`), single column on mobile with toggle navigation
- **Smart Date Dividers** — Messages grouped by date with styled pills showing "Today", "Yesterday", or full date
- **Hover Action Menus** — Context actions (reply, edit, delete) appear on message hover, hidden otherwise for clean UI
- **Toast Notifications** — `react-hot-toast` for immediate, non-blocking feedback on every user action

</td>
</tr>
</table>

---

## 🗺️ Product Walkthrough

### User Journey — From Sign Up to First Message

```mermaid
graph LR
    A[🌐 Visit App] --> B{Authenticated?}
    B -->|No| C[📝 Sign Up / Login]
    C -->|Sign Up| D[Enter Name + Email + Password]
    D --> E[Write Bio]
    E --> F[Account Created + JWT Issued]
    C -->|Login| G[Enter Credentials]
    G --> F
    F --> H[🔌 WebSocket Connected]
    H --> I[📋 Sidebar: User List Loaded]
    I --> J[👤 Select User]
    J --> K[💬 Chat Opens + History Loaded]
    K --> L{Action?}
    L -->|Send Text| M[Type + Enter/Click Send]
    L -->|Send Image| N[Gallery Icon → File Picker]
    L -->|Send Emoji| O[😊 Emoji Picker → Select]
    L -->|Reply| P[Hover → ↩️ → Preview Shown]
    L -->|Edit| Q[Hover → ✏️ → Inline Edit → Save]
    L -->|Delete| R[Hover → 🗑️ → Soft Delete]
    M --> S[📡 Real-Time Delivery]
    N --> S
    O --> M
    P --> M
```

### Real-Time Message Lifecycle

```mermaid
sequenceDiagram
    participant Sender as 👤 Sender Client
    participant API as 🖥️ Express API
    participant DB as 🗄️ MongoDB
    participant CDN as ☁️ Cloudinary
    participant WS as 📡 Socket.io
    participant Receiver as 👤 Receiver Client

    Sender->>API: POST /api/messages/send/:id
    
    alt Has Image
        API->>CDN: Upload Base64 Image
        CDN-->>API: Secure URL
    end
    
    API->>DB: Create Message Document
    DB-->>API: Saved Message (+ populated replyTo)
    
    API->>WS: Look up receiverSocketId
    
    alt Receiver Online
        WS->>Receiver: emit("newMessage", message)
        
        alt Chat Open with Sender
            Receiver->>API: PUT /api/messages/mark/:id
            API->>DB: Update seen: true
        else Chat NOT Open
            Receiver->>Receiver: Increment unseen badge
        end
    end
    
    API-->>Sender: 200 { success, newMessage }
```

### Typing Indicator Flow

```mermaid
sequenceDiagram
    participant A as 👤 User A (Typing)
    participant WS as 📡 Socket.io Server
    participant B as 👤 User B (Observing)

    A->>WS: emit("typing", { receiverId: B })
    WS->>B: emit("userTyping", { senderId: A })
    Note over B: Shows animated dots ⦿⦿⦿
    
    Note over A: 1 second of inactivity
    A->>WS: emit("stopTyping", { receiverId: B })
    WS->>B: emit("userStopTyping", { senderId: A })
    Note over B: Hides typing indicator
```

---

## 🏗️ Architecture & System Design

### High-Level System Overview

```mermaid
graph TD
    subgraph Client["🖥️ Frontend — React 19 + Vite"]
        UI[UI Components]
        AC[AuthContext Provider]
        CC[ChatContext Provider]
        SIO_C[Socket.io Client]
        AX[Axios HTTP Client]
    end

    subgraph Server["⚙️ Backend — Express 5 + Node.js"]
        MW[Auth Middleware<br/>JWT Verification]
        UC[User Controller<br/>signup / login / profile]
        MC[Message Controller<br/>CRUD + sidebar + seen]
        SIO_S[Socket.io Server<br/>Presence + Typing + Sync]
        USM[userSocketMap<br/>In-Memory Registry]
    end

    subgraph Data["🗄️ Data Layer"]
        DB[(MongoDB Atlas<br/>Mongoose ODM)]
        CDN[(Cloudinary CDN<br/>Image Storage)]
    end

    subgraph Deploy["🚀 Deployment"]
        VF[Vercel Edge<br/>Frontend SPA]
        VB[Vercel Serverless<br/>Backend API]
    end

    UI --> AC
    UI --> CC
    AC --> AX
    AC --> SIO_C
    CC --> AX
    CC --> SIO_C

    AX -->|REST API| MW
    SIO_C <-->|WebSocket| SIO_S

    MW --> UC
    MW --> MC
    SIO_S --> USM

    UC --> DB
    UC --> CDN
    MC --> DB
    MC --> CDN
    SIO_S --> DB

    Client --> VF
    Server --> VB
```

### Frontend Component Architecture

```mermaid
graph TD
    subgraph Providers["Context Providers"]
        BR[BrowserRouter]
        AP[AuthProvider<br/>• authUser state<br/>• socket management<br/>• login/logout/updateProfile]
        CP[ChatProvider<br/>• messages state<br/>• users list<br/>• typing events<br/>• CRUD operations<br/>• reply management]
    end

    subgraph App["App.jsx — Route Guard"]
        R1["/ → HomePage"]
        R2["/login → LoginPage"]
        R3["/profile → ProfilePage"]
    end

    subgraph Home["HomePage — 3-Panel Grid"]
        SB[Sidebar<br/>• User search filter<br/>• Online status indicators<br/>• Unseen message badges<br/>• Last seen timestamps<br/>• Menu dropdown]
        CT[ChatContainer<br/>• Message rendering<br/>• Date dividers<br/>• Reply previews<br/>• Edit/Delete actions<br/>• Emoji picker<br/>• Image upload<br/>• Typing bubble<br/>• Auto-scroll]
        RS[RightSidebar<br/>• Contact profile card<br/>• Online/Last seen status<br/>• Bio display<br/>• Media gallery grid<br/>• Logout button]
    end

    BR --> AP --> CP --> App
    R1 --> Home
    SB --> CT --> RS
```

---

## 🛠️ Technology Ecosystem

<table>
<tr>
<th align="center">Layer</th>
<th align="center">Technology</th>
<th align="center">Version</th>
<th align="center">Purpose</th>
</tr>
<tr><td colspan="4" align="center"><b>🖥️ Frontend</b></td></tr>
<tr><td>Core</td><td><img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square" /></td><td>19.1.0</td><td>Declarative UI with latest concurrent features</td></tr>
<tr><td>Build</td><td><img src="https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square" /></td><td>6.3.5</td><td>Sub-second HMR, optimized production builds</td></tr>
<tr><td>Routing</td><td><img src="https://img.shields.io/badge/-React_Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square" /></td><td>7.6.2</td><td>SPA navigation with route guards</td></tr>
<tr><td>Styling</td><td><img src="https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" /></td><td>4.1.10</td><td>Utility-first CSS with v4 compiler via Vite plugin</td></tr>
<tr><td>Typography</td><td><img src="https://img.shields.io/badge/-Google_Fonts-4285F4?logo=googlefonts&logoColor=white&style=flat-square" /></td><td>—</td><td>Outfit + Poppins + Playfair font families</td></tr>
<tr><td>HTTP</td><td><img src="https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=flat-square" /></td><td>1.10.0</td><td>Promise-based HTTP client with interceptors</td></tr>
<tr><td>Emoji</td><td><img src="https://img.shields.io/badge/-emoji--picker--react-FFD93D?style=flat-square" /></td><td>4.19.1</td><td>Full emoji keyboard with search & dark theme</td></tr>
<tr><td>Notifications</td><td><img src="https://img.shields.io/badge/-react--hot--toast-EF4444?style=flat-square" /></td><td>2.5.2</td><td>Lightweight, customizable toast system</td></tr>
<tr><td>Real-Time</td><td><img src="https://img.shields.io/badge/-socket.io--client-010101?logo=socketdotio&logoColor=white&style=flat-square" /></td><td>4.8.1</td><td>WebSocket client with auto-reconnect</td></tr>
<tr><td colspan="4" align="center"><b>⚙️ Backend</b></td></tr>
<tr><td>Runtime</td><td><img src="https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square" /></td><td>≥18</td><td>JavaScript runtime with ES Module support</td></tr>
<tr><td>Framework</td><td><img src="https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=flat-square" /></td><td>5.1.0</td><td>Latest Express v5 with async error handling</td></tr>
<tr><td>Real-Time</td><td><img src="https://img.shields.io/badge/-Socket.io-010101?logo=socketdotio&logoColor=white&style=flat-square" /></td><td>4.8.1</td><td>Event-driven WebSocket server</td></tr>
<tr><td>ODM</td><td><img src="https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white&style=flat-square" /></td><td>8.16.0</td><td>Schema validation, population, indexing</td></tr>
<tr><td>Auth</td><td><img src="https://img.shields.io/badge/-jsonwebtoken-000000?style=flat-square" /></td><td>9.0.2</td><td>JWT generation & verification</td></tr>
<tr><td>Hashing</td><td><img src="https://img.shields.io/badge/-bcryptjs-003A70?style=flat-square" /></td><td>3.0.2</td><td>10-round salted password hashing</td></tr>
<tr><td>Media</td><td><img src="https://img.shields.io/badge/-Cloudinary-3448C5?logo=cloudinary&logoColor=white&style=flat-square" /></td><td>2.7.0</td><td>CDN-backed image upload & hosting</td></tr>
<tr><td>Security</td><td><img src="https://img.shields.io/badge/-CORS-FF6F61?style=flat-square" /></td><td>2.8.5</td><td>Cross-origin request control</td></tr>
<tr><td>Env</td><td><img src="https://img.shields.io/badge/-dotenv-ECD53F?logo=dotenv&logoColor=black&style=flat-square" /></td><td>16.5.0</td><td>Environment variable management</td></tr>
<tr><td colspan="4" align="center"><b>🚀 Deployment & DevOps</b></td></tr>
<tr><td>Hosting</td><td><img src="https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white&style=flat-square" /></td><td>—</td><td>Edge deployment with serverless functions</td></tr>
<tr><td>Database</td><td><img src="https://img.shields.io/badge/-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white&style=flat-square" /></td><td>—</td><td>Managed cloud NoSQL database</td></tr>
<tr><td>Dev Server</td><td><img src="https://img.shields.io/badge/-Nodemon-76D04B?logo=nodemon&logoColor=white&style=flat-square" /></td><td>3.1.10</td><td>Auto-restart on file changes</td></tr>
<tr><td>Linting</td><td><img src="https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square" /></td><td>9.25.0</td><td>Code quality enforcement</td></tr>
</table>

---

## 🏆 Key Achievements & Engineering Highlights

> **📋 Recruiter Quick Reference** — These accomplishments demonstrate production-level engineering capabilities across full-stack development, real-time systems, API design, and modern frontend architecture.

<table>
<tr>
<th width="40%">🎖️ Achievement</th>
<th width="60%">📝 Technical Details</th>
</tr>
<tr>
<td><b>Hybrid REST + WebSocket Architecture</b></td>
<td>Designed a dual-protocol communication system: REST APIs (Axios) handle stateless operations (auth, message history, profile updates) while WebSockets (Socket.io) are reserved exclusively for ephemeral real-time events (presence, typing, live message sync). This separation optimizes server load and maintains clean architectural boundaries.</td>
</tr>
<tr>
<td><b>O(1) Private Message Routing</b></td>
<td>Implemented an in-memory <code>userSocketMap</code> dictionary (<code>{userId → socketId}</code>) enabling constant-time lookup for targeting specific connected clients. Eliminates broadcast overhead for private messages.</td>
</tr>
<tr>
<td><b>Concurrent Database Query Optimization</b></td>
<td>Sidebar unseen message counts are computed using <code>Promise.all()</code> across all users simultaneously, reducing N sequential queries to a single parallel batch — cutting API response time by up to N×.</td>
</tr>
<tr>
<td><b>Time-Gated Message Editing</b></td>
<td>Engineered a 15-minute edit window with server-side timestamp validation (<code>Date.now() - createdAt</code>), sender-only permission checks, deleted-message guards, and image-message protection — mirroring production messaging platform patterns (WhatsApp, Slack).</td>
</tr>
<tr>
<td><b>Soft Delete with Thread Preservation</b></td>
<td>Messages are logically deleted (<code>deleted: true</code>) with content cleared but record preserved, maintaining referential integrity for reply threads. Real-time sync via dedicated <code>messageDeleted</code> socket event.</td>
</tr>
<tr>
<td><b>Threaded Reply System with Population</b></td>
<td>Implemented reply-to-message functionality with Mongoose <code>populate('replyTo', 'text image senderId deleted')</code> for efficient reference resolution. UI renders contextual reply previews with sender attribution.</td>
</tr>
<tr>
<td><b>Intelligent Presence & Last Seen</b></td>
<td>Dual presence system: real-time online status via WebSocket connection events + persistent <code>lastSeen</code> timestamp updated on disconnect. Client-side relative time formatting with 5 granularity levels.</td>
</tr>
<tr>
<td><b>Debounced Typing Indicators</b></td>
<td>Client-side typing events use <code>setTimeout</code> debouncing (1s) to prevent event flooding. Server routes typing events only to the specific recipient via socket map lookup — zero broadcast overhead.</td>
</tr>
<tr>
<td><b>Express 5 Early Adoption</b></td>
<td>Built on Express v5.1.0, leveraging native async error handling and modern middleware patterns ahead of the ecosystem.</td>
</tr>
<tr>
<td><b>React 19 + Tailwind v4 Cutting-Edge Stack</b></td>
<td>Frontend built with React 19's latest rendering improvements and Tailwind CSS v4's new compiler architecture via native Vite plugin integration — demonstrating ability to work with bleeding-edge tooling.</td>
</tr>
</table>

---

## 📐 Technical Excellence

<details>
<summary><b>🧩 Design Patterns & Architecture Decisions</b></summary>
<br/>

| Pattern | Implementation |
|---------|---------------|
| **Provider Pattern** | `AuthProvider` and `ChatProvider` Context wrappers manage global state, avoiding prop drilling across the component tree |
| **Controller-Route Separation** | Express routes delegate to dedicated controller functions, keeping routing thin and business logic testable |
| **Middleware Chain** | `protectRoute` middleware handles JWT verification and user hydration before any protected controller executes |
| **Observer Pattern** | Socket.io event listeners (`newMessage`, `messageDeleted`, `messageEdited`, `userTyping`) implement reactive state updates |
| **Optimistic UI** | Messages appear in the sender's UI immediately via local state update, with server confirmation arriving asynchronously |
| **Progressive Disclosure** | Sign-up form uses a two-step flow (credentials → bio) to reduce cognitive load |
| **Graceful Degradation** | Socket.io auto-fallback from WebSocket to long-polling in restrictive network environments |

</details>

<details>
<summary><b>🔒 Security Implementation</b></summary>
<br/>

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Password Storage** | bcrypt (10 rounds) | Salted hashing; raw passwords never persisted |
| **Authentication** | JWT tokens | Stateless auth; token sent via custom `token` header |
| **Route Protection** | Server middleware | Every protected endpoint validates JWT and hydrates `req.user` |
| **Client Guards** | React Router | `Navigate` redirects enforce auth state on every route |
| **Payload Defense** | Express body limit | 15MB max request size prevents memory exhaustion |
| **CORS** | `cors()` middleware | Cross-origin request control on all API endpoints |
| **Data Filtering** | `.select("-password")` | Password hash excluded from all user queries |
| **Authorization** | Controller-level checks | Message edit/delete operations verify `senderId === userId` |

</details>

<details>
<summary><b>⚡ Performance Optimizations</b></summary>
<br/>

| Optimization | Impact |
|--------------|--------|
| **Parallel Query Execution** | `Promise.all()` for sidebar unseen counts — N× faster than sequential |
| **In-Memory Socket Registry** | O(1) user → socket lookup eliminates database queries for routing |
| **Selective Socket Events** | Typing & message events sent only to specific recipients, not broadcast |
| **Vite Build System** | Sub-second HMR in development, optimized chunking in production |
| **Tailwind v4 Compiler** | New compiler generates smaller CSS output with faster build times |
| **Hidden Scrollbars** | CSS-only approach (no JS scroll libraries) for zero overhead |
| **CDN Image Delivery** | Cloudinary serves images from globally distributed edge nodes |
| **Smooth Auto-Scroll** | `scrollIntoView({ behavior: "smooth" })` with ref-based targeting |

</details>

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register new user with name, email, password, bio |
| `POST` | `/api/auth/login` | ❌ | Authenticate user, returns JWT token |
| `GET` | `/api/auth/check` | ✅ | Validate JWT and return user data |
| `PUT` | `/api/auth/update-profile` | ✅ | Update fullname, bio, and/or profilePic |

### Messaging Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/messages/users` | ✅ | Get all users (excluding self) + unseen message counts |
| `GET` | `/api/messages/:id` | ✅ | Fetch full message history with a specific user |
| `POST` | `/api/messages/send/:id` | ✅ | Send text/image message with optional replyTo reference |
| `PUT` | `/api/messages/mark/:id` | ✅ | Mark a specific message as seen |
| `PUT` | `/api/messages/edit/:id` | ✅ | Edit message text (15-min window, sender only, text only) |
| `DELETE` | `/api/messages/delete/:id` | ✅ | Soft-delete a message (sender only) |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `getOnlineUsers` | Server → Client | `string[]` (userIds) | Broadcast online user list on connect/disconnect |
| `newMessage` | Server → Client | `Message` object | Deliver new message to recipient |
| `messageDeleted` | Server → Client | `{ messageId }` | Notify recipient of message deletion |
| `messageEdited` | Server → Client | `{ messageId, text, editedAt }` | Sync edited message to recipient |
| `typing` | Client → Server | `{ receiverId }` | Notify server that user is typing |
| `stopTyping` | Client → Server | `{ receiverId }` | Notify server that user stopped typing |
| `userTyping` | Server → Client | `{ senderId }` | Relay typing status to specific recipient |
| `userStopTyping` | Server → Client | `{ senderId }` | Relay stop-typing to specific recipient |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | Returns `"Server is Live"` |

---

## 🗄️ Database Schema

### User Collection

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String email UK "Required, Unique"
        String fullname "Required"
        String password "Required, minLength: 6"
        String profilePic "Default: empty"
        String bio "Required"
        Date lastSeen "Default: Date.now"
        Date createdAt "Auto (timestamps)"
        Date updatedAt "Auto (timestamps)"
    }
```

### Message Collection

```mermaid
erDiagram
    MESSAGE {
        ObjectId _id PK
        ObjectId senderId FK "ref: User, Required"
        ObjectId receiverId FK "ref: User, Required"
        String text "Optional"
        String image "Optional"
        Boolean seen "Default: false"
        Boolean deleted "Default: false"
        Date editedAt "Default: null"
        ObjectId replyTo FK "ref: Message, Default: null"
        Date createdAt "Auto (timestamps)"
        Date updatedAt "Auto (timestamps)"
    }
    
    MESSAGE }o--|| USER : "senderId"
    MESSAGE }o--|| USER : "receiverId"
    MESSAGE }o--o| MESSAGE : "replyTo"
```

---

## 📂 Project Structure

```
QuickChat/
├── 📄 README.md                          # This file
├── 📄 .gitignore                         # Git ignore rules
│
├── 📁 client/                            # Frontend Application
│   ├── 📄 index.html                     # SPA entry point
│   ├── 📄 vite.config.js                 # Vite + React + Tailwind v4 config
│   ├── 📄 vercel.json                    # Client-side Vercel SPA rewrites
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 eslint.config.js               # ESLint configuration
│   ├── 📄 .env                           # VITE_BACKEND_URL
│   │
│   ├── 📁 context/                       # React Context Providers
│   │   ├── 📄 AuthContext.jsx            # Auth state, socket, login/logout/profile
│   │   └── 📄 ChatContext.jsx            # Messages, users, typing, CRUD, replies
│   │
│   ├── 📁 src/
│   │   ├── 📄 main.jsx                   # App bootstrap (BrowserRouter + Providers)
│   │   ├── 📄 App.jsx                    # Route definitions + auth guards
│   │   ├── 📄 index.css                  # Global styles (Outfit font, Tailwind import)
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── 📄 HomePage.jsx           # 3-panel layout (Sidebar + Chat + RightSidebar)
│   │   │   ├── 📄 LoginPage.jsx          # Multi-step login/signup form
│   │   │   └── 📄 ProfilePage.jsx        # Profile editing with image upload
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📄 Sidebar.jsx            # User list, search, online status, unseen badges
│   │   │   ├── 📄 ChatContainer.jsx      # Message display, input, emoji, reply, edit/delete
│   │   │   └── 📄 RightSidebar.jsx       # Contact info, bio, media gallery
│   │   │
│   │   ├── 📁 lib/
│   │   │   └── 📄 utils.js               # formatMessageTime, formatLastSeen, formatDateHeader
│   │   │
│   │   └── 📁 assets/                    # Static assets (icons, images, SVGs)
│   │       └── 📄 assets.js              # Asset imports + dummy data exports
│   │
│   └── 📁 public/                        # Vite public directory
│
└── 📁 server/                            # Backend Application
    ├── 📄 server.js                      # Express + HTTP + Socket.io setup, entry point
    ├── 📄 vercel.json                    # Vercel serverless function config
    ├── 📄 package.json                   # Backend dependencies
    ├── 📄 .env                           # Environment variables
    │
    ├── 📁 controllers/
    │   ├── 📄 userController.js          # signup, login, checkAuth, updateProfile
    │   └── 📄 messageController.js       # getUserForSidebar, getMessages, sendMessage,
    │                                     # markMessageAsSeen, deleteMessage, editMessage
    │
    ├── 📁 models/
    │   ├── 📄 User.js                    # Mongoose User schema
    │   └── 📄 Message.js                 # Mongoose Message schema (with replyTo, deleted, editedAt)
    │
    ├── 📁 routes/
    │   ├── 📄 userRoutes.js              # /api/auth/* routes
    │   └── 📄 messageRoutes.js           # /api/messages/* routes
    │
    ├── 📁 middleware/
    │   └── 📄 auth.js                    # JWT verification + user hydration middleware
    │
    └── 📁 lib/
        ├── 📄 db.js                      # MongoDB connection via Mongoose
        ├── 📄 cloudinary.js              # Cloudinary v2 SDK configuration
        └── 📄 utils.js                   # JWT token generation helper
```

---

## 🚀 Installation & Local Development

### Prerequisites

| Requirement | Minimum Version | Purpose |
|------------|----------------|---------|
| **Node.js** | v18+ | Runtime environment |
| **npm** | v9+ | Package management |
| **MongoDB** | v6+ (or Atlas) | Database |
| **Cloudinary Account** | Free tier | Image CDN |

### 1. Clone the Repository

```bash
git clone https://github.com/SarthakDudhe/ChatApplication.git
cd ChatApplication
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - Allowed frontend origins (comma-separated for multiple)
CLIENT_URL=http://localhost:5173
```

Start the development server:

```bash
npm run server    # Uses nodemon for auto-restart
```

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the Vite development server:

```bash
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:5173` |
| **Backend API** | `http://localhost:5000` |
| **Health Check** | `http://localhost:5000/api/status` |

---

## 🌐 Environment Variables Reference

<table>
<tr>
<th>Variable</th>
<th>Location</th>
<th>Required</th>
<th>Description</th>
</tr>
<tr><td><code>PORT</code></td><td>Server</td><td>No</td><td>Server port (default: 5000)</td></tr>
<tr><td><code>NODE_ENV</code></td><td>Server</td><td>No</td><td><code>development</code> or <code>production</code> — controls server.listen behavior</td></tr>
<tr><td><code>MONGODB_URI</code></td><td>Server</td><td>✅ Yes</td><td>MongoDB connection string (appends <code>/chat-app</code> as DB name)</td></tr>
<tr><td><code>JWT_SECRET</code></td><td>Server</td><td>✅ Yes</td><td>Secret key for JWT signing and verification</td></tr>
<tr><td><code>CLOUDINARY_CLOUD_NAME</code></td><td>Server</td><td>✅ Yes</td><td>Cloudinary account cloud name</td></tr>
<tr><td><code>CLOUDINARY_API_KEY</code></td><td>Server</td><td>✅ Yes</td><td>Cloudinary API key</td></tr>
<tr><td><code>CLOUDINARY_API_SECRET</code></td><td>Server</td><td>✅ Yes</td><td>Cloudinary API secret</td></tr>
<tr><td><code>VITE_BACKEND_URL</code></td><td>Client</td><td>✅ Yes</td><td>Backend API base URL for Axios and Socket.io</td></tr>
</table>

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

The project includes pre-configured `vercel.json` files for both frontend and backend:

**Backend** (`server/vercel.json`):
- Uses `@vercel/node` builder for serverless function deployment
- All routes directed to `server.js` entry point
- Conditional `server.listen` — only runs locally, exports for Vercel in production

**Frontend** (`client/my-react-app/vercel.json`):
- SPA rewrite rule: all paths redirect to `/` for client-side routing
- Vite builds static assets to `dist/`

```bash
# Deploy Backend
cd server
vercel --prod

# Deploy Frontend
cd client/my-react-app
vercel --prod
```

---

## 🗺️ Roadmap & Future Enhancements

- [ ] 👥 **Group Chats** — Multi-user chat rooms with admin controls
- [ ] 🔐 **End-to-End Encryption** — Client-side key generation for message privacy
- [ ] 📎 **File Attachments** — Support for documents, videos, and audio beyond images
- [ ] 🔔 **Push Notifications** — Browser & mobile push via Service Workers
- [ ] 🔍 **Message Search** — Full-text search across conversation history
- [ ] 📱 **React Native Mobile App** — Cross-platform mobile client
- [ ] 🎙️ **Voice Messages** — Record and send audio clips
- [ ] 📞 **Video/Voice Calling** — WebRTC-powered real-time calls
- [ ] 🌍 **i18n** — Multi-language support
- [ ] 📊 **Admin Dashboard** — User analytics and moderation tools

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes with descriptive messages
   ```bash
   git commit -m 'feat: add voice message recording support'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request with a detailed description

### Code Style Guidelines

- Use **ES Module** imports (`import`/`export`)
- Follow existing **naming conventions** (camelCase for variables, PascalCase for components)
- Keep controllers **thin** — extract shared logic to `lib/`
- Add comments for **non-obvious** business logic

---

## 📄 License

Distributed under the **ISC License**. See `package.json` for details.

---

<div align="center">
  
  <img width="80" alt="QuickChat" src="https://github.com/user-attachments/assets/68d58645-66d4-43a7-92f0-6b1e37ea8dda" />

  <br/>
  <br/>

  **Built with ❤️ by [Sarthak Dudhe](https://github.com/SarthakDudhe)**

  <br/>

  <p>
    <a href="https://github.com/SarthakDudhe/ChatApplication">
      <img src="https://img.shields.io/badge/⭐_Star_this_repo-171515?style=for-the-badge&logo=github" alt="Star" />
    </a>
    <a href="https://github.com/SarthakDudhe/ChatApplication/fork">
      <img src="https://img.shields.io/badge/🍴_Fork_this_repo-171515?style=for-the-badge&logo=github" alt="Fork" />
    </a>
    <a href="https://github.com/SarthakDudhe/ChatApplication/issues">
      <img src="https://img.shields.io/badge/🐛_Report_Bug-171515?style=for-the-badge&logo=github" alt="Issues" />
    </a>
  </p>

  <sub>If this project helped you, consider giving it a ⭐ — it means a lot!</sub>

</div>

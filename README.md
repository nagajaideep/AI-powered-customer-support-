# AI Customer Support (Multi‑Agent System)

## Overview
AI-powered customer support with a router agent delegating to Support, Order, and Billing agents. Conversations, messages, and domain data are persisted in PostgreSQL via Prisma.

---

## Architecture Diagram

```mermaid
flowchart LR
  subgraph Frontend[Next.js Frontend]
    UI[Chat UI]
    US[User Switcher]
    CH[Conversation History]
  end

  subgraph Backend[Node API (Express)]
    API[REST API]
    CS[Controller Layer]
    SS[Service Layer]
    AG[Agent System]
    RA[Router Agent]
    SA[Support Agent]
    OA[Order Agent]
    BA[Billing Agent]
    TOOLS[Agent Tools]
  end

  subgraph DB[PostgreSQL + Prisma]
    USERS[Users]
    CONV[Conversations]
    MSG[Messages]
    ORD[Orders]
    PAY[Payments]
  end

  UI --> API
  US --> API
  CH --> API

  API --> CS --> SS --> AG
  AG --> RA --> SA
  AG --> RA --> OA
  AG --> RA --> BA
  SA --> TOOLS
  OA --> TOOLS
  BA --> TOOLS

  TOOLS --> DB
  SS --> DB
```

---

## Data Model (High Level)

- **User** → has many **Conversation**
- **Conversation** → has many **Message**
- **Order** and **Payment** belong to **User**
- **Message** belongs to **Conversation** and stores `role`, `content`, `agentType`, `createdAt`

---

## How a User Query is Processed (Step‑by‑Step)

1. **Frontend**
   - User types a message and clicks **Send**.
   - UI immediately adds the user message to the chat list.
   - Frontend calls: `POST /api/chat/messages`.

2. **Backend Controller**
   - `chat.controller.ts` validates input.
   - Passes to `chat.service.ts`.

3. **Service Layer**
   - Finds or creates the **Conversation**.
   - Persists the **User message** in **Message** table.
   - Builds **conversation history** (past messages).

4. **Router Agent**
   - Classifies intent (support, order, billing).
   - Delegates to the relevant sub‑agent.

5. **Sub‑Agent + Tools**
   - Support Agent → uses conversation history tool
   - Order Agent → fetches order details
   - Billing Agent → fetches invoices/refund status

6. **Response**
   - Agent returns a reply + agent type.
   - Service stores assistant message in DB.
   - Controller returns JSON to frontend.

7. **Frontend**
   - Shows typing indicator.
   - Appends assistant response with agent badge.

---

## Data Persistence Flow

**Saving**
- Every message is written into `Message` table.
- Conversations are created per user.

**Retrieving**
- Conversation list: `GET /api/chat/conversations?userId=...`
- Full conversation: `GET /api/chat/conversations/:id`

---

## API Endpoints

```
/api
├── /chat
│ ├── POST /messages
│ ├── GET /conversations/:id
│ ├── GET /conversations?userId=...
│ └── DELETE /conversations/:id
├── /agents
│ ├── GET /agents
│ └── GET /agents/:type/capabilities
└── /health
```

---

## Setup

### 1) Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run dev
```
Backend runs at: `http://localhost:3001`

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## Features Implemented

- Controller‑Service architecture
- Router agent + sub‑agents
- Tool‑based agent queries
- Persistent conversations and messages
- Typing indicator
- Multi‑user switching

---

## Known Gaps vs Spec

- Backend framework is Express (spec asks Hono)
- Streaming responses not implemented
- Hono RPC + Turborepo not implemented
- Tests not implemented
- Context compaction not implemented
- Live deployment not done

---

## Repo Structure

```
backend/
  src/
    controllers/
    services/
    agents/
    routes/
    middleware/
    db/
frontend/
  app/
  components/
  types/
```

---

## Demo Script (Suggested)
1. Switch user
2. Ask order status
3. Ask billing/refund
4. Ask general support question
5. Show conversation history per user
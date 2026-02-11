# AI Customer Support – Multi-Agent System

An AI-powered customer support platform built using a Router based multi agent architecture.  
Designed with clean backend principles, tool based reasoning, and persistent conversational context.

---

# Highlights

- Router-based Multi-Agent System
- Controller–Service Architecture
- Tool-based data access (anti-hallucination boundary)
- Persistent conversations (PostgreSQL + Prisma)
- Domain-specific sub-agents
- Clean separation of concerns
- Scalable and extensible design

---

# Architecture

This project follows three core principles:

### 1️⃣ Router = Classification
The Router Agent does **intent detection only**.  
It never generates user-facing responses.

### 2️⃣ Agents = Domain-Bounded Reasoners
Each agent operates strictly within its domain:
- Support
- Order
- Billing

### 3️⃣ Tools = Trust Boundary
Agents never access the database directly.  
All data access is done through deterministic tools.

This prevents hallucination and enforces structured reasoning.

---

# System Architecture

## High-Level Overview

```mermaid
flowchart LR

  subgraph Frontend
    UI[Chat Interface]
    HIST[Conversation History]
  end

  subgraph Backend
    API[REST API]
    CTRL[Controllers]
    SRV[Services]
    AG[Agent Orchestrator]
    ROUTER[Router Agent]
    SUP[Support Agent]
    ORD[Order Agent]
    BILL[Billing Agent]
    TOOLS[Tools Layer]
  end

  subgraph Database
    USERS[(Users)]
    CONV[(Conversations)]
    MSG[(Messages)]
    ORDERS[(Orders)]
    BILLING[(Billing Records)]
  end

  UI --> API
  HIST --> API
  API --> CTRL
  CTRL --> SRV
  SRV --> AG

  AG --> ROUTER
  ROUTER --> SUP
  ROUTER --> ORD
  ROUTER --> BILL

  SUP --> TOOLS
  ORD --> TOOLS
  BILL --> TOOLS

  TOOLS --> USERS
  TOOLS --> CONV
  TOOLS --> MSG
  TOOLS --> ORDERS
  TOOLS --> BILLING
```

---

# Query Processing Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant C as Controller
    participant S as Service
    participant R as Router
    participant A as Sub-Agent
    participant DB as Database

    U->>FE: Send Message
    FE->>C: POST /api/chat/messages
    C->>S: Validate & Forward
    S->>DB: Persist User Message
    S->>R: Classify Intent
    R-->>S: support | order | billing
    S->>A: Delegate Request
    A->>DB: Fetch Tool Data
    A-->>S: Generated Response
    S->>DB: Persist Assistant Message
    S-->>C: Final JSON
    C-->>FE: Response
```

---

# Multi-Agent Routing Logic

```mermaid
flowchart TD

  USER_MSG[User Message]
  ROUTER[Router Agent]
  SUPPORT[Support Agent]
  ORDER[Order Agent]
  BILLING[Billing Agent]
  FALLBACK[Fallback Handler]

  USER_MSG --> ROUTER
  ROUTER -->|support| SUPPORT
  ROUTER -->|order| ORDER
  ROUTER -->|billing| BILLING
  ROUTER -->|unknown| FALLBACK
```

---

# Data Model

```mermaid
erDiagram

    USER ||--o{ CONVERSATION : has
    CONVERSATION ||--o{ MESSAGE : contains
    USER ||--o{ ORDER : owns
    USER ||--o{ BILLING_RECORD : owns

    USER {
        string id
        string email
    }

    CONVERSATION {
        string id
        string userId
        datetime createdAt
    }

    MESSAGE {
        string id
        string conversationId
        string role
        string content
        string agentType
        datetime createdAt
    }

    ORDER {
        string id
        string userId
        string status
        string trackingNumber
    }

    BILLING_RECORD {
        string id
        string userId
        float amount
        string status
        string invoiceUrl
    }
```

---

# Agent Design

## Router Agent
- Intent classification only
- Returns: `support | order | billing | fallback`
- No DB access

## Support Agent
- Uses conversation history
- Handles FAQs and troubleshooting

## Order Agent
- Fetches order data via tools
- Answers strictly from order records

## Billing Agent
- Fetches billing records via tools
- Handles invoices and refunds

---

# Tools Layer

Tools enforce strict data access control.

Examples:

- `getConversationHistory(conversationId)`
- `getOrdersByUser(userId)`
- `getBillingRecordsByUser(userId)`

Rules:
- Tools are pure DB functions
- No AI inside tools
- Agents never use Prisma directly

---

# API Endpoints

```
/api
├── /chat
│   ├── POST /messages
│   ├── GET /conversations/:id
│   ├── GET /conversations?userId=...
│   └── DELETE /conversations/:id
├── /agents
│   ├── GET /agents
│   └── GET /agents/:type/capabilities
└── /health
```

---

# Local Setup

## 1️⃣ Clone Repo

```bash
git clone <repo-url>
cd ai-customer-support/backend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup PostgreSQL

Install PostgreSQL locally.

Create database:

```sql
CREATE DATABASE ai_customer_support;
```

---

## 4️⃣ Configure Environment

Create `.env` file:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_customer_support"
GEMINI_API_KEY=your_gemini_api_key
```

---

## 5️⃣ Prisma Setup

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

---

## 6️⃣ Run Backend

```bash
npm run dev
```

Server runs at:

```
http://localhost:3001
```

---

# Project Structure

```
backend/
  src/
    controllers/
    services/
    agents/
    tools/
    routes/
    middleware/
    db/
  prisma/
frontend/
```

---

# Error Handling Strategy Used

- Global error middleware
- Structured JSON error responses
- Graceful fallback agent
- Defensive routing

---

# Scalability Considerations

- Add new agents without touching router logic
- Replace Gemini with any LLM
- Introduce streaming easily
- Horizontal scaling possible
- Context compaction ready

---

# Future Enhancements

- Streaming responses (SSE)
- Rate limiting
- Context compaction
- Unit & integration tests
- Monorepo with Hono RPC
- Production deployment

---

# Why My Project Stands Out

- Not a simple chatbot
- Not a single agent wrapper
- Structured multi-agent orchestration
- Clean separation of responsibilities
- Production-minded architecture

---



Built with engineering discipline using ai as a companion not vibe coding.

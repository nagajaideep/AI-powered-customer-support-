# AI Customer Support – Multi-Agent System

AI-powered customer support system built with a Router Agent that delegates to specialized Support, Order, and Billing agents.

The system maintains conversation context, uses tool-based data access, and persists everything in PostgreSQL via Prisma.

---

# 🚀 Tech Stack

- Backend: Node.js + Hono
- Database: PostgreSQL
- ORM: Prisma
- AI Model: Gemini API
- Architecture: Controller–Service Pattern
- Multi-Agent Design: Router + Sub-Agents

---

# 🏗 System Architecture

## High-Level Architecture

```mermaid
flowchart LR

  subgraph Frontend
    UI[Chat UI]
    HIST[Conversation History]
  end

  subgraph Backend
    API[REST API]
    CTRL[Controllers]
    SRV[Services]
    AG[Agent System]
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

# 🧠 Multi-Agent Architecture

## Router-Based Delegation

```mermaid
flowchart TD

  USER_MSG[User Message]
  ROUTER[Router Agent]
  SUPPORT[Support Agent]
  ORDER[Order Agent]
  BILLING[Billing Agent]
  FALLBACK[Fallback Response]

  USER_MSG --> ROUTER

  ROUTER -->|support| SUPPORT
  ROUTER -->|order| ORDER
  ROUTER -->|billing| BILLING
  ROUTER -->|unknown| FALLBACK
```

---

# 🔄 User Query Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Controller
    participant SRV as Service
    participant RA as Router Agent
    participant SA as Sub-Agent
    participant DB as Database

    U->>FE: Send Message
    FE->>API: POST /api/chat/messages
    API->>SRV: Validate & Pass Input
    SRV->>DB: Save User Message
    SRV->>RA: Classify Intent
    RA-->>SRV: Agent Type
    SRV->>SA: Delegate
    SA->>DB: Fetch Tool Data
    SA-->>SRV: Generated Reply
    SRV->>DB: Save Assistant Message
    SRV-->>API: Return Response
    API-->>FE: JSON Reply
```

---

# 🗃 Data Model

## Entity Relationships

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

# 🧩 Agent Responsibilities

## Router Agent
- Classifies intent
- Delegates to correct sub-agent
- Does NOT access DB

## Support Agent
- Handles FAQs and troubleshooting
- Uses conversation history tool

## Order Agent
- Handles order status and tracking
- Uses order tools

## Billing Agent
- Handles invoices and refunds
- Uses billing tools

---

# 🔐 Tools Layer (Trust Boundary)

Tools:
- `getConversationHistory`
- `getOrdersByUser`
- `getBillingRecordsByUser`

Rules:
- Tools only query database
- No AI inside tools
- Agents never access Prisma directly

---

# 🌐 API Endpoints

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

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
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

Create `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_customer_support"
GEMINI_API_KEY=your_api_key_here
```

---

## 5️⃣ Run Prisma Migration

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

---

## 6️⃣ Start Backend

```bash
npm run dev
```

Backend runs at:

```
http://localhost:3001
```

---

# 🖥 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 📁 Project Structure

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
  components/
  pages/
```

---

# ✅ Features Implemented

- Controller–Service architecture
- Router agent + 3 sub-agents
- Tool-based database access
- Persistent conversations
- Intent classification
- Multi-agent delegation
- Clean separation of concerns

---

# ❗ Known Gaps (Optional Improvements)

- Streaming responses
- Context compaction
- Rate limiting
- Unit tests
- Hono RPC monorepo
- Live deployment

---

# 🎥 Demo Script

1. Send order query → routed to Order Agent
2. Send billing query → routed to Billing Agent
3. Send general support query → Support Agent
4. Show conversation history
5. Show database persistence

---

# 🏆 Architecture Philosophy

> Router = classification problem  
> Agents = domain-bounded decision makers  
> Tools = trust boundary against hallucination  

This design ensures scalability, modularity, and production readiness.

---

# 📌 Final Notes

This project demonstrates:
- Multi-agent orchestration
- Clean backend design
- Practical AI integration
- Persistent conversational systems

---

# 📜 License

MIT

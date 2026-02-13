<p align="center">
  <img src="https://img.shields.io/badge/🛡️-Perf--Patrol-10b981?style=for-the-badge&labelColor=0f172a" alt="Perf-Patrol" />
</p>

<h1 align="center">Perf-Patrol</h1>
<h3 align="center">Automated Web Performance Monitoring at Scale</h3>

<p align="center">
  <em>Open-source distributed platform for continuous Google Lighthouse audits.<br/>Submit a URL → Queue the job → Get actionable performance insights.</em>
</p>

<p align="center">
  <a href="https://github.com/lekhanpro/perfpatrol/actions"><img src="https://img.shields.io/github/actions/workflow/status/lekhanpro/perfpatrol/ci.yml?branch=main&style=flat-square&logo=github&label=CI" alt="CI Status" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/stargazers"><img src="https://img.shields.io/github/stars/lekhanpro/perfpatrol?style=flat-square&logo=github&color=yellow" alt="Stars" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/issues"><img src="https://img.shields.io/github/issues/lekhanpro/perfpatrol?style=flat-square&logo=github" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🎯 What is Perf-Patrol?

**Perf-Patrol** is a self-hosted, distributed web performance monitoring platform. Think of it as your own private **Google PageSpeed Insights** — but automated, scheduled, and with historical trend analysis.

```
User submits URL → Job queued in Redis → Worker runs Lighthouse → Results saved to PostgreSQL → Dashboard shows trends
```

Unlike one-off audit tools, Perf-Patrol continuously monitors your sites and alerts you when performance degrades. It's designed with a **microservices architecture** that scales horizontally — add more workers to handle more audits.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 Automated Lighthouse Audits
Run Google Lighthouse audits on any URL with a single API call. Get scores for Performance, Accessibility, Best Practices, and SEO.

</td>
<td width="50%">

### 📊 Real-Time Dashboard
Beautiful dark-mode dashboard built with Next.js 14 and Recharts. View performance trends, recent scans, and critical issues at a glance.

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Distributed Job Queue
BullMQ-powered Redis queue with automatic retries, exponential backoff, and concurrent processing. Scale workers independently.

</td>
<td width="50%">

### 🐳 One-Command Deployment
Full Docker Compose stack — PostgreSQL, Redis, Web App, and Worker containers. From zero to running in under 2 minutes.

</td>
</tr>
<tr>
<td width="50%">

### 📈 Historical Trend Analysis
Track performance over time. Identify regressions, measure improvements, and set baselines for your web properties.

</td>
<td width="50%">

### 🔔 Status Monitoring
Real-time worker health checks, job status tracking, and pass/fail badges for every audit. Know instantly when something breaks.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| [Docker](https://docker.com) | 20.10+ |
| [Docker Compose](https://docs.docker.com/compose/) | 2.0+ |
| [Node.js](https://nodejs.org) | 18+ (for local dev) |

### 1. Clone & Configure

```bash
git clone https://github.com/lekhanpro/perfpatrol.git
cd perfpatrol
cp .env.example .env
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This spins up **4 services**:

| Service | Port | Description |
|---------|------|-------------|
| `web` | `3000` | Next.js Dashboard & API |
| `worker` | — | BullMQ Lighthouse Worker |
| `postgres` | `5432` | PostgreSQL Database |
| `redis` | `6379` | Redis Queue |

### 3. Initialize the Database

```bash
# Run Prisma migrations
docker-compose exec web npx prisma migrate dev --name init

# Seed with sample data
docker-compose exec web npx prisma db seed
```

### 4. Open the Dashboard

```
http://localhost:3000
```

### 5. Trigger Your First Scan

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "projectId": "demo-project"}'
```

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["👤 Client Layer"]
        Browser["Browser / Dashboard"]
        API_Client["API Client / cURL"]
    end

    subgraph WebApp["🌐 Web App (Next.js 14)"]
        Dashboard["Dashboard UI<br/>React + Recharts"]
        API["REST API<br/>/api/scan"]
        ServerActions["Server Actions"]
    end

    subgraph Queue["📮 Message Queue"]
        Redis["Redis<br/>BullMQ"]
    end

    subgraph Workers["⚙️ Worker Pool"]
        Worker1["Worker 1"]
        Worker2["Worker 2"]
        WorkerN["Worker N..."]
    end

    subgraph Engine["🔬 Audit Engine"]
        Puppeteer["Puppeteer<br/>Headless Chrome"]
        Lighthouse["Google Lighthouse"]
    end

    subgraph Storage["💾 Data Layer"]
        Postgres["PostgreSQL<br/>Prisma ORM"]
    end

    Browser --> Dashboard
    API_Client --> API
    Dashboard --> ServerActions
    ServerActions --> Postgres
    API --> Redis
    Redis --> Worker1
    Redis --> Worker2
    Redis --> WorkerN
    Worker1 --> Puppeteer
    Worker2 --> Puppeteer
    Puppeteer --> Lighthouse
    Worker1 --> Postgres
    Worker2 --> Postgres
    Dashboard -.->|"Fetch Results"| Postgres

    style Client fill:#1e293b,stroke:#334155,color:#e2e8f0
    style WebApp fill:#0f172a,stroke:#10b981,color:#e2e8f0
    style Queue fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style Workers fill:#0f172a,stroke:#3b82f6,color:#e2e8f0
    style Engine fill:#0f172a,stroke:#8b5cf6,color:#e2e8f0
    style Storage fill:#0f172a,stroke:#ef4444,color:#e2e8f0
```

### Data Flow

```
1. User submits URL via Dashboard or API
2. API endpoint creates a job in the Redis queue (BullMQ)
3. Available worker picks up the job
4. Worker launches Puppeteer (headless Chrome) inside Docker
5. Lighthouse runs the audit and generates a JSON report
6. Worker saves results to PostgreSQL via Prisma
7. Dashboard fetches and displays results with charts and scores
```

---

## 📡 API Reference

### `POST /api/scan`

Queue a new Lighthouse audit.

**Request:**

```json
{
  "url": "https://example.com",
  "projectId": "my-project-id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Scan queued successfully",
  "jobId": "abc123"
}
```

**Error Responses:**

| Status | Body | Description |
|--------|------|-------------|
| `400` | `{"error": "Missing or invalid \"url\" field"}` | URL validation failed |
| `400` | `{"error": "Invalid URL format"}` | Malformed URL |
| `500` | `{"error": "Internal Server Error"}` | Queue connection failed |

---

## 📂 Project Structure

```
perfpatrol/
├── apps/
│   └── web/                    # Next.js 14 Application
│       ├── app/
│       │   ├── api/scan/       # REST API endpoints
│       │   │   └── route.ts    # POST /api/scan
│       │   ├── dashboard/      # Dashboard pages
│       │   │   ├── layout.tsx  # Sidebar navigation
│       │   │   └── page.tsx    # Stats, charts, activity
│       │   ├── layout.tsx      # Root layout (dark mode)
│       │   ├── page.tsx        # Redirects to /dashboard
│       │   └── globals.css     # Design system tokens
│       ├── components/
│       │   ├── ui/             # shadcn/ui components
│       │   └── add-project-modal.tsx
│       ├── lib/
│       │   └── utils.ts        # cn() utility
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   ├── database/               # Prisma ORM Package
│   │   ├── prisma/
│   │   │   └── schema.prisma   # DB schema
│   │   ├── seed.ts             # Database seeder
│   │   └── index.ts            # Client export
│   └── worker/                 # BullMQ Worker
│       ├── src/
│       │   └── index.ts        # Queue consumer + Lighthouse
│       ├── Dockerfile          # Puppeteer-ready container
│       └── package.json
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Environment template
├── tsconfig.json               # Base TS config
└── package.json                # Monorepo root
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-rendered React dashboard |
| **Styling** | Tailwind CSS + shadcn/ui | Dark-mode design system |
| **Charts** | Recharts | Performance trend visualization |
| **Icons** | Lucide React | Consistent icon library |
| **API** | Next.js Route Handlers | RESTful scan endpoints |
| **Queue** | BullMQ + Redis | Distributed job processing |
| **Worker** | Node.js + TypeScript | Job consumer service |
| **Audit Engine** | Puppeteer + Lighthouse | Headless browser audits |
| **Database** | PostgreSQL + Prisma | Typed ORM with migrations |
| **Orchestration** | Docker Compose | Multi-container deployment |

---

## 🗃️ Database Schema

```prisma
model Project {
  id        String         @id @default(cuid())
  name      String
  url       String
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  audits    AuditResult[]
}

model AuditResult {
  id           String    @id @default(cuid())
  projectId    String
  project      Project   @relation(fields: [projectId], references: [id])
  url          String
  status       JobStatus @default(PENDING)
  score        Int?
  report       Json?
  errorMessage String?
  createdAt    DateTime  @default(now())
  completedAt  DateTime?
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## 🧑‍💻 Local Development

```bash
# Install dependencies (from root)
npm install

# Start the database and Redis
docker-compose up postgres redis -d

# Generate Prisma client
cd packages/database && npx prisma generate && cd ../..

# Run the web app
cd apps/web && npm run dev

# Run the worker (in a separate terminal)
cd packages/worker && npx ts-node src/index.ts
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://perfpatrol:perfpatrol@localhost:5432/perfpatrol` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public URL of the web app |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Contribution Ideas

- [ ] Add email/Slack notifications for failed audits
- [ ] Implement scheduled (cron) scans
- [ ] Add authentication (NextAuth.js)
- [ ] Build a CLI tool for triggering scans
- [ ] Add PDF report generation
- [ ] Implement WebSocket-based real-time updates
- [ ] Add multi-page crawl support
- [ ] Create GitHub Actions CI/CD pipeline

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/lekhanpro">@lekhanpro</a></strong>
  <br/>
  <sub>If this project helped you, consider giving it a ⭐</sub>
</p>

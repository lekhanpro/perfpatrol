<p align="center">
  <img src="https://img.shields.io/badge/🛡️-Perf--Patrol-10b981?style=for-the-badge&labelColor=0f172a" alt="Perf-Patrol" />
</p>

<h1 align="center">Perf-Patrol</h1>
<h3 align="center">Automated Web Performance Monitoring at Scale</h3>

<p align="center">
  <em>Open-source, self-hosted Google Lighthouse audit platform.<br/>Submit a URL → Queue the job → Get actionable performance insights.</em>
</p>

<p align="center">
  <a href="https://github.com/lekhanpro/perfpatrol/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/lekhanpro/perfpatrol/ci.yml?branch=main&style=flat-square&logo=github&label=CI" alt="CI" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/stargazers"><img src="https://img.shields.io/github/stars/lekhanpro/perfpatrol?style=flat-square&logo=github&color=yellow" alt="Stars" /></a>
  <a href="https://github.com/lekhanpro/perfpatrol/issues"><img src="https://img.shields.io/github/issues/lekhanpro/perfpatrol?style=flat-square&logo=github" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
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

Unlike one-off audit tools, Perf-Patrol **continuously monitors** your sites and alerts you when performance degrades. It's built with a **microservices architecture** that scales horizontally — add more workers to handle more audits.

### Why Perf-Patrol?

- 🏠 **Self-hosted** — Your data stays on your infrastructure
- 📈 **Historical trends** — Track performance over weeks and months
- ⚡ **Distributed** — Scale workers independently based on load
- 🐳 **One command** — Full Docker Compose stack, zero to running in 2 minutes
- 🔌 **Extensible** — Clean API for integrations and custom workflows

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
Track performance over time with interactive charts. Identify regressions, measure improvements, and set baselines.

</td>
<td width="50%">

### 🔔 Status Monitoring
Real-time worker health checks, job status tracking (Pending → Processing → Completed), and pass/fail indicators for every audit.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| [Docker](https://docker.com) | 20.10+ | ✅ For production |
| [Docker Compose](https://docs.docker.com/compose/) | 2.0+ | ✅ For production |
| [Node.js](https://nodejs.org) | 18+ | ✅ For local dev |
| [npm](https://npmjs.com) | 9+ | ✅ For local dev |

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/lekhanpro/perfpatrol.git
cd perfpatrol

# 2. Configure environment
cp .env.example .env

# 3. Start the entire stack
docker-compose up -d

# 4. Initialize the database
docker-compose exec web npx prisma migrate dev --name init

# 5. (Optional) Seed demo data
docker-compose exec web npx prisma db seed
```

**Services started:**

| Service | Port | Description |
|---------|------|-------------|
| `web` | `3000` | Next.js Dashboard & API |
| `worker` | — | BullMQ Lighthouse Worker |
| `postgres` | `5432` | PostgreSQL Database |
| `redis` | `6379` | Redis Queue |

### Option 2: Local Development

```bash
# 1. Clone and install
git clone https://github.com/lekhanpro/perfpatrol.git
cd perfpatrol
npm install

# 2. Start infrastructure
docker-compose up -d postgres redis

# 3. Configure environment
cp .env.example .env

# 4. Setup database
npx prisma generate --schema=packages/database/prisma/schema.prisma
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma --name init

# 5. (Optional) Seed demo data
npm run db:seed

# 6. Start web app (Terminal 1)
npm run dev

# 7. Start worker (Terminal 2)
npm run worker:dev
```

### 🔗 Open the Dashboard

```
http://localhost:3000
```

### 📡 Trigger Your First Scan

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "projectId": "new", "name": "Example Site"}'
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
        ServerActions["Server Components<br/>Prisma Queries"]
    end

    subgraph Queue["📮 Message Queue"]
        Redis["Redis<br/>BullMQ"]
    end

    subgraph Workers["⚙️ Worker Pool (Scalable)"]
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
2. API creates a PENDING audit record in PostgreSQL
3. Job is queued in Redis (BullMQ) with the audit ID
4. Available worker picks up the job
5. Worker launches Puppeteer (headless Chrome)
6. Lighthouse runs the audit and generates a JSON report
7. Worker updates the audit record to COMPLETED with score
8. Dashboard fetches and displays results with charts
```

---

## 📡 API Reference

### `POST /api/scan`

Queue a new Lighthouse audit.

**Request:**

```json
{
    "url": "https://example.com",
    "projectId": "existing-id-or-new",
    "name": "My Website",
    "frequency": "daily"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | URL to audit |
| `projectId` | string | ✅ | Existing project ID or `"new"` to create one |
| `name` | string | ❌ | Project name (auto-extracted from URL if omitted) |
| `frequency` | string | ❌ | `"daily"` or `"weekly"` (default: `"daily"`) |

**Success Response:**

```json
{
    "success": true,
    "message": "Scan queued",
    "auditId": "clx1abc123...",
    "projectId": "clx2def456..."
}
```

**Error Responses:**

| Status | Body | Description |
|--------|------|-------------|
| `400` | `{"error": "Missing url"}` | URL field missing |
| `400` | `{"error": "Invalid URL"}` | Malformed URL |
| `400` | `{"error": "Missing projectId"}` | Project ID missing |
| `500` | `{"error": "Internal Server Error"}` | Queue or DB error |

---

## 📂 Project Structure

```
perfpatrol/
├── apps/
│   └── web/                       # Next.js 14 Application
│       ├── app/
│       │   ├── api/scan/          # REST API endpoints
│       │   │   └── route.ts       # POST /api/scan
│       │   ├── dashboard/         # Dashboard pages
│       │   │   ├── layout.tsx     # Sidebar + navigation
│       │   │   ├── page.tsx       # Overview (stats, chart, activity)
│       │   │   └── projects/
│       │   │       └── page.tsx   # Projects listing
│       │   ├── layout.tsx         # Root layout (dark mode)
│       │   └── globals.css        # Design tokens
│       ├── components/
│       │   ├── ui/                # shadcn/ui components
│       │   ├── add-project-modal.tsx
│       │   └── performance-chart.tsx
│       └── Dockerfile             # Production container
├── packages/
│   ├── database/                  # Prisma ORM Package
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema
│   │   ├── seed.ts               # Demo data seeder
│   │   └── index.ts              # Singleton client export
│   └── worker/                    # BullMQ Worker Service
│       ├── src/
│       │   └── index.ts          # Queue consumer + Lighthouse
│       └── Dockerfile            # Puppeteer-ready container
├── .github/
│   ├── workflows/ci.yml          # CI/CD pipeline
│   ├── ISSUE_TEMPLATE/           # Bug & feature templates
│   └── pull_request_template.md  # PR template
├── docker-compose.yml            # Full stack orchestration
├── .env.example                  # Environment template
├── CONTRIBUTING.md               # Contribution guide
├── SECURITY.md                   # Security policy
├── CODE_OF_CONDUCT.md            # Community guidelines
├── LICENSE                       # MIT License
└── package.json                  # Monorepo root
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-rendered React dashboard |
| **Styling** | Tailwind CSS + shadcn/ui | Dark-mode design system |
| **Charts** | Recharts | Interactive performance trends |
| **Icons** | Lucide React | Consistent icon library |
| **API** | Next.js Route Handlers | RESTful scan endpoints |
| **Queue** | BullMQ + Redis | Distributed job processing |
| **Worker** | Node.js + TypeScript | Audit job consumer |
| **Audit Engine** | Puppeteer + Lighthouse | Headless browser audits |
| **Database** | PostgreSQL + Prisma | Typed ORM with migrations |
| **CI/CD** | GitHub Actions | Automated testing pipeline |
| **Orchestration** | Docker Compose | Multi-container deployment |

---

## 🗃️ Database Schema

```prisma
model Project {
    id        String        @id @default(uuid())
    name      String
    url       String
    frequency String        @default("daily")
    createdAt DateTime      @default(now())
    updatedAt DateTime      @updatedAt
    audits    AuditResult[]
}

model AuditResult {
    id         String    @id @default(uuid())
    projectId  String
    project    Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
    status     JobStatus @default(PENDING)
    score      Int?
    reportJson Json?
    errorMsg   String?
    createdAt  DateTime  @default(now())
    updatedAt  DateTime  @updatedAt
}

enum JobStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
}
```

---

##  Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://perfpatrol:perfpatrol@localhost:5432/perfpatrol` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public URL of the web app |
| `WORKER_CONCURRENCY` | `2` | Number of concurrent audit jobs per worker |
| `RATE_LIMIT_MAX` | `5` | Max jobs per rate limit window |
| `RATE_LIMIT_DURATION` | `60000` | Rate limit window in milliseconds |

---

## 🚢 Deployment

### Vercel (Web App)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from apps/web
cd apps/web && vercel
```

Set environment variables in the Vercel dashboard:
- `DATABASE_URL` — Use a managed PostgreSQL (e.g., Supabase, Neon, Railway)
- `REDIS_URL` — Use managed Redis (e.g., Upstash, Railway)

### Railway / Render (Worker)

Deploy the worker using the Dockerfile at `packages/worker/Dockerfile`. Set the same `DATABASE_URL` and `REDIS_URL` environment variables.

### Docker (Full Stack)

```bash
docker-compose up -d --build
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### 🗺️ Roadmap

- [ ] 📧 Email/Slack notifications for failed audits
- [ ] ⏰ Scheduled (cron) scans with configurable cadence
- [ ] 🔐 Authentication with NextAuth.js
- [ ] 📱 Mobile-responsive dashboard
- [ ] 📄 PDF report generation and export
- [ ] 🔌 WebSocket real-time job status updates
- [ ] 🕷️ Multi-page crawl audit support
- [ ] 🖥️ CLI tool for triggering scans
- [ ] 📊 Accessibility, SEO, and Best Practices scoring
- [ ] 🔔 Configurable score threshold alerts

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/lekhanpro">@lekhanpro</a></strong>
  <br/>
  <sub>If this project helped you, consider giving it a ⭐</sub>
</p>

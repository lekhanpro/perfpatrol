# Perf-Patrol 🚀

> Automated Google Lighthouse Audit Platform — A distributed system for continuous web performance monitoring.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client
        A[User Browser] -->|Submit URL| B[Next.js Dashboard]
    end

    subgraph "Backend Services"
        B -->|POST /api/scan| C[API Route]
        C -->|Add Job| D[(Redis Queue)]
        D -->|Consume Job| E[Worker Service]
        E -->|Launch| F[Headless Chrome]
        F -->|Run Audit| G[Google Lighthouse]
        G -->|JSON Report| E
        E -->|Save Result| H[(PostgreSQL)]
        B -->|Fetch Data| H
    end

    style B fill:#0070f3,color:#fff
    style D fill:#dc382d,color:#fff
    style H fill:#336791,color:#fff
    style E fill:#10b981,color:#fff
```

## 📦 Tech Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| **Frontend**  | Next.js 14, Tailwind CSS, shadcn/ui   |
| **API**       | Next.js App Router (Route Handlers)   |
| **Queue**     | BullMQ + Redis                        |
| **Worker**    | Node.js + Puppeteer + Lighthouse      |
| **Database**  | PostgreSQL + Prisma ORM               |
| **Infra**     | Docker Compose                        |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **Docker** & **Docker Compose** (for Postgres + Redis)
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/perf-patrol.git
cd perf-patrol
npm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis containers.

### 3. Setup Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run the App

```bash
# Terminal 1 — Web Dashboard
npm run dev

# Terminal 2 — Worker (optional, for processing scans)
npm run worker:dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
perf-patrol/
├── apps/
│   └── web/                  # Next.js 14 Dashboard
│       ├── app/
│       │   ├── api/scan/     # REST API endpoints
│       │   ├── dashboard/    # Dashboard pages
│       │   └── layout.tsx    # Root layout
│       └── components/       # Reusable UI components
├── packages/
│   ├── database/             # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── seed.ts
│   │   └── index.ts
│   └── worker/               # BullMQ audit worker
│       ├── src/index.ts
│       └── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

# Contributing to Perf-Patrol

First off, thank you for considering contributing to Perf-Patrol! 🎉

This document provides guidelines and information about contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** and **Docker Compose**
- **Git**

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/perfpatrol.git
cd perfpatrol

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start infrastructure
docker-compose up -d postgres redis

# 5. Initialize the database
cd packages/database && npx prisma migrate dev && cd ../..

# 6. Start the dev server
npm run dev
```

## 🔧 Development Workflow

### Project Structure

```
perfpatrol/
├── apps/web/          # Next.js 14 frontend + API
├── packages/worker/   # BullMQ audit worker
└── packages/database/ # Prisma schema & client
```

### Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the web app |
| `npm run worker:dev` | Start the worker |
| `npm run build` | Build the web app |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes |

### Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests if applicable
4. Ensure `npm run build` passes
5. Commit using conventional commits
6. Open a Pull Request

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Examples

```
feat(worker): add support for multi-page crawl audits
fix(api): handle missing URL validation edge case
docs(readme): update deployment instructions
```

## 🔀 Pull Request Process

1. **Fill out the PR template** — describe what changed and why
2. **Link related issues** — use `Closes #123` syntax
3. **Keep PRs focused** — one feature/fix per PR
4. **Update documentation** — if your change affects user-facing behavior
5. **Pass CI checks** — ensure build and lint pass

### PR Size Guidelines

- **Small** (< 50 lines): Quick review, merged fast
- **Medium** (50-200 lines): Standard review
- **Large** (200+ lines): Consider splitting into smaller PRs

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Environment** — OS, Node.js version, Docker version
- **Steps to reproduce** — Minimal reproduction steps
- **Expected vs actual behavior**
- **Screenshots/logs** — if applicable

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Problem description** — What problem does this solve?
- **Proposed solution** — How should it work?
- **Alternatives considered** — What other approaches did you think about?

## 🏗️ Architecture Decisions

For significant changes, consider opening a discussion first. This helps:

- Get early feedback on your approach
- Avoid duplicated effort
- Build consensus on the design

## 📦 Release Process

Releases are managed by maintainers. We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** — Breaking changes
- **MINOR** — New features (backward compatible)
- **PATCH** — Bug fixes (backward compatible)

---

Thank you for contributing! 💚

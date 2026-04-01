# RealFast Claims

RealFast Claims is a comprehensive health insurance claims processing system.

## Stack
- **Backend:** Node.js, Fastify, Prisma ORM, BullMQ, Redis
- **Frontend:** React, TypeScript, Tailwind CSS, React Query
- **Database:** PostgreSQL

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Step 1: Clone the repository
```bash
git clone <this-repo-url>
cd realfast-claims
```

### Step 2: Start Infrastructure
```bash
docker-compose up -d
```

### Step 3: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## API Routes Overview

### AUTH
- POST /api/auth/register
- POST /api/auth/login

### MEMBERS (role: MEMBER)
- GET /api/members/me
- PUT /api/members/me
- POST /api/members/me/dependents
- GET /api/members/me/dependents
- GET /api/members/me/policy

### CLAIMS (role: MEMBER | PROVIDER)
- POST /api/claims (Submit new claim)
- GET /api/claims/:id (Get claim detail)
- GET /api/claims/:id/eob (Get EOB for a claim)
- GET /api/members/me/claims (All member claims)

### PROVIDERS (role: PROVIDER)
- GET /api/providers/eligibility/:memberId
- POST /api/providers/claims (Submit cashless claim)

### ADJUDICATION (role: ADJUDICATOR)
- GET /api/adjudication/queue (Claims needing review)
- GET /api/adjudication/claims/:id (Full claim detail)
- POST /api/adjudication/line-items/:id/decide
- POST /api/adjudication/line-items/:id/override

### DISPUTES (role: MEMBER | ADJUDICATOR)
- POST /api/disputes (File dispute)
- GET /api/disputes/:id
- POST /api/disputes/:id/resolve (Resolve dispute)

### ADMIN (role: SUPER_ADMIN)
- POST /api/admin/policies
- PUT /api/admin/policies/:id
- POST /api/admin/policies/:id/coverage-rules
- PUT /api/admin/coverage-rules/:id
- GET /api/admin/users
- PUT /api/admin/users/:id/role
- GET /api/admin/analytics

Note: Currently all routes return `501 Not Implemented`.

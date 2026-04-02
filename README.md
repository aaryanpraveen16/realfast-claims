# RealFast Claims 🚀

**RealFast Claims** is a high-performance, Domain-Driven Design (DDD) health insurance claims processing platform. It automates adjudication, underwriting, and payment reconciliation with a "RealFast" (Real-time) focus.

## 🏗️ Architecture & Domain Model
The system is built on a modular architecture separating concerns into bounded contexts:
- **Adjudication**: Automated rules engine (Deductibles, Co-pays, Proportionate Deductions).
- **Underwriting**: Risk-based dependent lifecycle management (Age/PED triggers).
- **Claims**: Member and Provider life-cycles.
- **Payments**: Integrated reconciliation.

For a detailed breakdown, see the [Domain Model Documentation](./backend/docs/domain_model.md).

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Fastify (High performance), Prisma ORM, BullMQ (Async jobs), Redis.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Query.
- **Database**: PostgreSQL 15.

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher.
- [Docker](https://www.docker.com/) & Docker Compose.

### Step 1: Infrastructure
Start the PostgreSQL database and Redis (required as a message broker for BullMQ background jobs) provided in the root:
```bash
docker-compose up -d
```

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your local secrets if needed
   ```
4. Initialize the database (Migrate, Generate client, and Seed):
   ```bash
   # Create tables
   npx prisma migrate dev --name init
   
   # Populate with critical policies, coverage rules, and test users
   npx prisma db seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Step 3: Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing with Seeded Users
The seeding script creates default accounts across all roles for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Member** | `rahul@test.com` | `Member@123` |
| **Adjudicator** | `adj@realfast.com` | `Adj@123` |
| **Underwriter** | `underwriter@realfast.com` | `Under@123` |
| **Provider** | `apollo@test.com` | `Provider@123` |
| **Super Admin** | `admin@realfast.com` | `Admin@123` |

---

## 📄 Key API Modules
- `/api/auth`: Multi-role registration and JWT auth.
- `/api/claims`: Submission (Cashless/Reimbursement) and EOB generation.
- `/api/underwriting`: Dependent risk assessment and loading logic.
- `/api/adjudication`: Manual review queue and override logic.

---

## 📜 Documentation Links
- [Detailed Domain Model](./backend/docs/domain_model.md) - Deep dive into entities, state machines, and the Adjudication Rules Engine.

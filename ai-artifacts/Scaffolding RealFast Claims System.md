# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

You are a senior full-stack engineer. Generate ONLY the skeleton for a claims processing system called RealFast Claims. 

DO NOT implement any logic whatsoever. Every function body must be empty. Every route must return 501 Not Implemented. Your only job is folder structure, file creation, type definitions, empty function signatures, and TODO comments.

The skeleton must be immediately runnable:
  docker-compose up -d
  npm install (in both /backend and /frontend)
  npx prisma migrate dev
  npm run dev
  → server starts, all routes registered, all return 501

---

TECH STACK
==========

Backend:  Node.js + TypeScript, Fastify, Prisma ORM
Database: PostgreSQL
Auth:     JWT (jsonwebtoken), bcrypt
Queue:    BullMQ + Redis (workers are empty stubs)
Frontend: React + TypeScript + Tailwind CSS, React Query
Payments: Razorpay (stub interface only, no real keys)

---

ENTITIES AND ENUMS
==================

Enums to define:
  PlanType        INDIVIDUAL | FAMILY_FLOATER | MULTI_INDIVIDUAL
  ClaimType       CASHLESS | REIMBURSEMENT
  ClaimStatus     SUBMITTED | UNDER_REVIEW | APPROVED | PARTIAL | DENIED | PAID
  LineItemStatus  PENDING | ADJUDICATING | APPROVED | DENIED | NEEDS_REVIEW
  DisputeStatus   FILED | UNDER_REVIEW | UPHELD | REJECTED
  NetworkStatus   IN_NETWORK | OUT_OF_NETWORK
  DeductibleType  AGGREGATE | PER_PERSON
  PaymentStatus   PENDING | PROCESSED | FAILED
  UserRole        MEMBER | PROVIDER | ADJUDICATOR | SUPER_ADMIN
  PaidTo          PROVIDER | MEMBER
  SubmittedBy     MEMBER | PROVIDER

Prisma models to define (all fields, all relations, all enums):

  User            { id, email, password_hash, role UserRole, created_at }

  Member          { id, user_id FK→User, name, dob, aadhaar_hash, 
                    phone, policy_id FK→Policy, status, created_at }

  Dependent       { id, member_id FK→Member, name, dob, 
                    relationship, aadhaar_hash, deductible_met Float,
                    limit_used Float, is_active Boolean }

  Policy          { id, name, plan_type PlanType, premium Float,
                    deductible Float, deductible_type DeductibleType,
                    annual_limit Float, network_type String,
                    room_rent_limit Float, copay_pct Float,
                    voluntary_copay_pct Float, ped_waiting_days Int,
                    employer_id String? }

  CoverageRule    { id, policy_id FK→Policy, service_type String,
                    is_covered Boolean, limit_per_year Float,
                    copay_flat Float, requires_preauth Boolean,
                    ped_exclusion Boolean }

  Provider        { id, user_id FK→User, name, license_no,
                    network_status NetworkStatus, specialty,
                    city, state }

  Claim           { id, member_id FK→Member, dependent_id FK→Dependent?,
                    provider_id FK→Provider, claim_type ClaimType,
                    diagnosis_code String, ped_flag Boolean,
                    status ClaimStatus, submitted_by SubmittedBy,
                    submitted_at DateTime, sla_deadline DateTime,
                    proportionate_ratio Float? }

  LineItem        { id, claim_id FK→Claim, procedure_code String,
                    service_type String, charged_amount Float,
                    approved_amount Float?, status LineItemStatus,
                    denial_reason_en String?, denial_reason_hi String? }

  Adjudication    { id, line_item_id FK→LineItem, is_covered Boolean?,
                    approved_amount Float?, member_owes Float?,
                    denial_reason_en String?, denial_reason_hi String?,
                    decision String?, override_reason String?,
                    adjudicated_by String?, adjudicated_at DateTime? }

  Payment         { id, adjudication_id FK→Adjudication, amount Float,
                    paid_to PaidTo, method String, 
                    status PaymentStatus, paid_at DateTime? }

  Dispute         { id, adjudication_id FK→Adjudication, reason String,
                    supporting_docs String?, status DisputeStatus,
                    filed_at DateTime, resolved_at DateTime?,
                    outcome String?, resolved_by String? }

  EOB             { id, claim_id FK→Claim, total_charged Float,
                    total_approved Float, member_owes Float,
                    breakdown_json String, issued_at DateTime,
                    pdf_url String? }

  AuditLog        { id, actor_id String, actor_role UserRole,
                    action String, entity_type String,
                    entity_id String, timestamp DateTime,
                    metadata_json String? }

---

FOLDER STRUCTURE TO GENERATE
=============================

realfast-claims/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts              ← empty main() with TODO comments only
│   └── src/
│       ├── app.ts               ← Fastify instance, registers all plugins and routes
│       ├── config/
│       │   ├── env.ts           ← reads and exports process.env variables
│       │   ├── db.ts            ← exports prisma client instance
│       │   └── queue.ts         ← exports BullMQ queues: adjudicationQueue, slaQueue, eobQueue
│       ├── middleware/
│       │   ├── auth.ts          ← verifyJWT middleware
│       │   ├── roleGuard.ts     ← requireRole(...roles) middleware factory
│       │   ├── errorHandler.ts  ← global Fastify error handler
│       │   └── slaSentinel.ts   ← checks SLA deadlines on incoming requests
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.router.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   └── auth.types.ts
│       │   ├── members/
│       │   │   ├── members.router.ts
│       │   │   ├── members.controller.ts
│       │   │   ├── members.service.ts
│       │   │   └── members.types.ts
│       │   ├── policies/
│       │   │   ├── policies.router.ts
│       │   │   ├── policies.controller.ts
│       │   │   ├── policies.service.ts
│       │   │   └── policies.types.ts
│       │   ├── providers/
│       │   │   ├── providers.router.ts
│       │   │   ├── providers.controller.ts
│       │   │   ├── providers.service.ts
│       │   │   └── providers.types.ts
│       │   ├── claims/
│       │   │   ├── claims.router.ts
│       │   │   ├── claims.controller.ts
│       │   │   ├── claims.service.ts
│       │   │   └── claims.types.ts
│       │   ├── adjudication/
│       │   │   ├── adjudication.router.ts
│       │   │   ├── adjudication.controller.ts
│       │   │   ├── adjudication.service.ts
│       │   │   ├── rulesEngine.ts
│       │   │   └── adjudication.types.ts
│       │   ├── payments/
│       │   │   ├── payments.router.ts
│       │   │   ├── payments.controller.ts
│       │   │   ├── payments.service.ts
│       │   │   └── payments.types.ts
│       │   ├── disputes/
│       │   │   ├── disputes.router.ts
│       │   │   ├── disputes.controller.ts
│       │   │   ├── disputes.service.ts
│       │   │   └── disputes.types.ts
│       │   └── admin/
│       │       ├── admin.router.ts
│       │       ├── admin.controller.ts
│       │       ├── admin.service.ts
│       │       └── admin.types.ts
│       ├── jobs/
│       │   ├── adjudicationWorker.ts
│       │   ├── slaAlertWorker.ts
│       │   └── eobGenerationWorker.ts
│       └── utils/
│           ├── stateMachine.ts
│           └── denialReasonFormatter.ts
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx              ← router with protected routes per role
│       ├── pages/
│       │   ├── member/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── SubmitClaim.tsx
│       │   │   ├── ClaimDetail.tsx
│       │   │   ├── EOBViewer.tsx
│       │   │   └── DisputeForm.tsx
│       │   ├── provider/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── EligibilityCheck.tsx
│       │   │   └── SubmitCashlessClaim.tsx
│       │   ├── adjudicator/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ClaimsQueue.tsx
│       │   │   ├── ClaimReview.tsx
│       │   │   └── DisputeResolution.tsx
│       │   └── admin/
│       │       ├── Dashboard.tsx
│       │       ├── PolicyBuilder.tsx
│       │       ├── CoverageRules.tsx
│       │       ├── UserManagement.tsx
│       │       └── Analytics.tsx
│       ├── components/
│       │   ├── ClaimCard.tsx
│       │   ├── LineItemRow.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── EOBViewer.tsx
│       │   └── SLATimer.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useClaim.ts
│       │   ├── useAdjudication.ts
│       │   └── usePolicy.ts
│       ├── store/
│       │   ├── authSlice.ts
│       │   ├── claimSlice.ts
│       │   └── adjudicationSlice.ts
│       └── i18n/
│           ├── en.json
│           └── hi.json

---

TODO FORMAT
===========

Use this exact format on every empty function. No exceptions:

// TODO: [function name]
// Input:  [parameter names and their types]
// Output: [return type and what it represents]
// Rule:   [which business rule this enforces]
// Calls:  [which services or prisma models it touches]
// Edge:   [the single most important edge case]

Example:

// TODO: annualLimitCheck
// Input:  lineItemId: string, policyId: string
// Output: Promise — { result, reason_en, reason_hi }
// Rule:   Sum of approved LineItems for this service_type this policy year
//         must not exceed CoverageRule.limit_per_year.
//         For FAMILY_FLOATER: sum across ALL members on this policy.
//         For INDIVIDUAL / MULTI_INDIVIDUAL: sum for this member only.
// Calls:  prisma.lineItem.aggregate, policiesService.getCoverageRule
// Edge:   Two concurrent claims submitted simultaneously can both pass
//         the limit check before either is committed — use a DB transaction.
async function annualLimitCheck(lineItemId: string, policyId: string): Promise {}

---

ROUTES TO REGISTER (all return 501 Not Implemented)
====================================================

AUTH
  POST /api/auth/register
  POST /api/auth/login

MEMBERS (role: MEMBER)
  GET  /api/members/me
  PUT  /api/members/me
  POST /api/members/me/dependents
  GET  /api/members/me/dependents
  GET  /api/members/me/policy

CLAIMS (role: MEMBER | PROVIDER)
  POST /api/claims                    ← submit new claim
  GET  /api/claims/:id                ← get claim detail
  GET  /api/claims/:id/eob            ← get EOB for a claim
  GET  /api/members/me/claims         ← all claims for this member

PROVIDERS (role: PROVIDER)
  GET  /api/providers/eligibility/:memberId
  POST /api/providers/claims          ← submit cashless claim

ADJUDICATION (role: ADJUDICATOR)
  GET  /api/adjudication/queue        ← all claims needing review
  GET  /api/adjudication/claims/:id   ← full claim detail
  POST /api/adjudication/line-items/:id/decide
  POST /api/adjudication/line-items/:id/override

DISPUTES (role: MEMBER | ADJUDICATOR)
  POST /api/disputes                  ← member files dispute
  GET  /api/disputes/:id
  POST /api/disputes/:id/resolve      ← adjudicator resolves

ADMIN (role: SUPER_ADMIN)
  POST /api/admin/policies
  PUT  /api/admin/policies/:id
  POST /api/admin/policies/:id/coverage-rules
  PUT  /api/admin/coverage-rules/:id
  GET  /api/admin/users
  PUT  /api/admin/users/:id/role
  GET  /api/admin/analytics

---

SPECIFIC FILES TO GENERATE IN FULL
===================================

1. docker-compose.yml
   Services: postgres (port 5432), redis (port 6379)
   Postgres env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

2. backend/.env.example
   DATABASE_URL, REDIS_URL, JWT_SECRET, PORT, RAZORPAY_KEY_ID (stub)

3. prisma/schema.prisma
   Complete — all models, all enums, all relations as defined above

4. src/app.ts
   Register: cors, jwt plugin, all module routers, error handler
   On startup: log all registered routes

5. utils/stateMachine.ts
   Export three empty functions with full TODO blocks:
     transitionClaim(claimId, newStatus)
     transitionLineItem(lineItemId, newStatus)
     transitionDispute(disputeId, newStatus)
   Each TODO must explain: valid transitions, what throws, what it persists

6. modules/adjudication/rulesEngine.ts
   Export one empty async function per check with TODO block:
     memberActiveCheck
     serviceCoverageCheck
     pedWaitingCheck
     preauthCheck
     annualLimitCheck     ← include the plan_type branching in the TODO
     roomRentCheck        ← include the proportionate_ratio logic in the TODO
     deductibleCheck      ← include AGGREGATE vs PER_PERSON in the TODO
     networkCheck
     copayCheck
     calculatePayable
   Export one orchestrator: runRulesEngine(lineItemId) with TODO

7. jobs/adjudicationWorker.ts
   BullMQ worker stub — receives { claimId }, full TODO block only

8. README.md
   Exact commands to get running from zero:
     Prerequisites: Node 18+, Docker
     Step 1: clone repo
     Step 2: docker-compose up -d
     Step 3: cd backend && npm install
     Step 4: cp .env.example .env
     Step 5: npx prisma migrate dev --name init
     Step 6: npm run dev
     Step 7: cd ../frontend && npm install && npm run dev
   Expected output: list of all registered API routes

---

STRICT RULES FOR GENERATION
============================

- Zero business logic. If you write an if-statement that isn't a TODO comment, you have gone too far.
- Every single exported function must have the TODO block format above. No bare empty functions.
- All route handlers return exactly: reply.code(501).send({ message: "Not implemented" })
- Frontend components return exactly: 
TODO: [ComponentName]

- schema.prisma must be complete and valid — this is the one file with real content
- docker-compose.yml must be complete and valid
- README.md must be complete and accurate
- No placeholder logic like "return null" or "return []" — empty body or 501 only


*Listed directory [realfast-claims](file:///c:/Projects/realfast-claims) *

*Edited relevant file*

### Planner Response

I have created an implementation plan for the **RealFast Claims** skeleton. This plan outlines the folder structure, backend modules, Prisma schema, and frontend pages according to your specifications.

Please review the [implementation_plan.md](file:///C:/Users/aarya/.gemini/antigravity/brain/785defa8-a3f0-4c06-bde1-522ce61fa260/implementation_plan.md) and let me know if you approve or if there are any adjustments needed before I begin the generation.

One quick question regarding the frontend:
- Should I include any base styling (e.g., a simple layout with navigation) or keep the components as purely minimal stubs that only render their name and the TODO comment?

### User Input

"Should I include any base styling in the frontend (e.g., a simple layout) or keep it purely minimal stubs?" -> yes base styling. And proceed with this plan

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*User accepted the command `cd backend && npx prisma generate`*

*User accepted the command `npx prisma generate`*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Edited relevant file*

*Listed directory [modules](file:///c:/Projects/realfast-claims/backend/src/modules) *

*Listed directory [pages](file:///c:/Projects/realfast-claims/frontend/src/pages) *

### Planner Response

I have finished generating the complete skeleton for **RealFast Claims**. The project is now runnable in terms of structure and types, with all business logic represented by detailed TODO blocks as requested.

### Key Deliverables

- **Verified Prisma Schema**: All models (User, Member, Policy, Claim, Adjudication, etc.) and enums are defined and verified via `npx prisma generate`.
- **Fastify Backend**: A modular architecture with 9 functional modules. All routes return `501 Not Implemented`.
- **Adjudication Rules Engine**: Detailed stubs for PED checks, room rent proportionate deductions, annual limits (Family Floater vs Individual), and more.
- **BullMQ Integration**: Workers for adjudication, SLA monitoring, and EOB generation are initialized.
- **React Frontend**: A role-based routing system (Member, Provider, Adjudicator, Admin) with "base styling" including a consistent layout, primary color palette, and bilingual support (English/Hindi).

### Accomplishments

- Created [docker-compose.yml](file:///c:/Projects/realfast-claims/docker-compose.yml) for infrastructure.
- Created [README.md](file:///c:/Projects/realfast-claims/README.md) with step-by-step setup instructions.
- Generated the full backend source tree in `backend/src/`.
- Generated the full frontend source tree in `frontend/src/`.
- Verified the domain model against the project requirements.

For a detailed summary of all changes and technical details, please refer to the [walkthrough.md](file:///C:/Users/aarya/.gemini/antigravity/brain/785defa8-a3f0-4c06-bde1-522ce61fa260/walkthrough.md).
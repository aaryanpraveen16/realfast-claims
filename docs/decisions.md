# Decisions & Architecture: RealFast Claims

This document outlines the technical decisions, scoped features, and underlying assumptions made during the development of the RealFast Claims platform.

## 1. What was Built
- **Core Domain Entities**: Comprehensive Prisma schema covering Users, Members, Dependents, Policies, Claims, Adjudication, Payments, and Disputes.
- **Adjudication Rules Engine**: A multi-tiered mathematical pipeline that handles Deductibles, Room Rent Caps, Proportionate Deductions, and Copays.
- **Underwriting State Machine**: A risk-based enrollment flow that triggers manual review based on Age (>45) and Pre-Existing Diseases (PED).
- **Multi-Role Dashboards**: Functional skeleton for Members, Adjudicators, and Underwriters.
- **Background Job Infrastructure**: BullMQ integration for asynchronous processing of Adjudication and SLA monitoring.

## 2. What was NOT Built (Scoped Out)
- **Live Payment Gateway**: Razorpay/Stripe integration is currently mocked. The system updates statuses but does not perform real financial transactions.
- **Physical Document Generation**: While EOB metadata is generated, the actual PDF rendering worker is a stub.
- **PII Encryption**: Medical history and personal identifiers are stored in cleartext (standard in MVP/V1, but a gap for HIPAA compliance).
- **Communication Layer**: No live Email/SMS/WebSocket integration for real-time notifications.
- **Global Admin UI**: The Super Admin endpoints (`/api/admin`) are defined but not implemented in the frontend.

## 3. Key Technical Decisions
- **Domain-Driven Design (DDD)**: Chose a modular structure (`backend/src/modules`) to ensure that the complex adjudication logic is isolated from generic auth/user logic.
- **Prisma & PostgreSQL**: Used for strong relational integrity, essential for financial reconciliation and claim-to-line-item consistency.
- **BullMQ/Redis**: Chose an asynchronous bridge for adjudication to ensure the "RealFast" user experience (sub-second UI updates while heavy processing happens in the background).
- **Proportionate Deduction Logic**: Decided to implement the "Room Choice" ratio across all associated line items as a primary fraud-prevention and cost-control mechanism.

## 4. Key Assumptions
- **SLA Consistency**: Assumed a 24-hour turnaround for automated claims and 48 hours for those flagged for manual review.
- **Single-Payer Model**: Assumed the insurance provider is the sole payer (no coordination of benefits with secondary insurers).
- **Currency**: All financial logic assumes INR (Internalization for other currencies is a future roadmap item).

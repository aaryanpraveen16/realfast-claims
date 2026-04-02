-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('INDIVIDUAL', 'FAMILY_FLOATER', 'MULTI_INDIVIDUAL');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('CASHLESS', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIAL', 'DENIED', 'PAID');

-- CreateEnum
CREATE TYPE "LineItemStatus" AS ENUM ('PENDING', 'ADJUDICATING', 'APPROVED', 'DENIED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('FILED', 'UNDER_REVIEW', 'UPHELD', 'REJECTED');

-- CreateEnum
CREATE TYPE "NetworkStatus" AS ENUM ('IN_NETWORK', 'OUT_OF_NETWORK');

-- CreateEnum
CREATE TYPE "DeductibleType" AS ENUM ('AGGREGATE', 'PER_PERSON');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'PROVIDER', 'ADJUDICATOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PaidTo" AS ENUM ('PROVIDER', 'MEMBER');

-- CreateEnum
CREATE TYPE "SubmittedBy" AS ENUM ('MEMBER', 'PROVIDER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "aadhaar_hash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "policy_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependent" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "relationship" TEXT NOT NULL,
    "aadhaar_hash" TEXT NOT NULL,
    "deductible_met" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limit_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "deductible" DOUBLE PRECISION NOT NULL,
    "deductible_type" "DeductibleType" NOT NULL,
    "annual_limit" DOUBLE PRECISION NOT NULL,
    "network_type" TEXT NOT NULL,
    "room_rent_limit" DOUBLE PRECISION NOT NULL,
    "copay_pct" DOUBLE PRECISION NOT NULL,
    "voluntary_copay_pct" DOUBLE PRECISION NOT NULL,
    "ped_waiting_days" INTEGER NOT NULL,
    "employer_id" TEXT,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageRule" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "is_covered" BOOLEAN NOT NULL,
    "limit_per_year" DOUBLE PRECISION NOT NULL,
    "copay_flat" DOUBLE PRECISION NOT NULL,
    "requires_preauth" BOOLEAN NOT NULL,
    "ped_exclusion" BOOLEAN NOT NULL,

    CONSTRAINT "CoverageRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license_no" TEXT NOT NULL,
    "network_status" "NetworkStatus" NOT NULL,
    "specialty" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "dependent_id" TEXT,
    "provider_id" TEXT NOT NULL,
    "claim_type" "ClaimType" NOT NULL,
    "diagnosis_code" TEXT NOT NULL,
    "ped_flag" BOOLEAN NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "submitted_by" "SubmittedBy" NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sla_deadline" TIMESTAMP(3) NOT NULL,
    "proportionate_ratio" DOUBLE PRECISION,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "procedure_code" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "charged_amount" DOUBLE PRECISION NOT NULL,
    "approved_amount" DOUBLE PRECISION,
    "status" "LineItemStatus" NOT NULL,
    "denial_reason_en" TEXT,
    "denial_reason_hi" TEXT,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adjudication" (
    "id" TEXT NOT NULL,
    "line_item_id" TEXT NOT NULL,
    "is_covered" BOOLEAN,
    "approved_amount" DOUBLE PRECISION,
    "member_owes" DOUBLE PRECISION,
    "denial_reason_en" TEXT,
    "denial_reason_hi" TEXT,
    "decision" TEXT,
    "override_reason" TEXT,
    "adjudicated_by" TEXT,
    "adjudicated_at" TIMESTAMP(3),

    CONSTRAINT "Adjudication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "adjudication_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid_to" "PaidTo" NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "adjudication_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "supporting_docs" TEXT,
    "status" "DisputeStatus" NOT NULL,
    "filed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "outcome" TEXT,
    "resolved_by" TEXT,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EOB" (
    "id" TEXT NOT NULL,
    "claim_id" TEXT NOT NULL,
    "total_charged" DOUBLE PRECISION NOT NULL,
    "total_approved" DOUBLE PRECISION NOT NULL,
    "member_owes" DOUBLE PRECISION NOT NULL,
    "breakdown_json" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf_url" TEXT,

    CONSTRAINT "EOB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" "UserRole" NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_json" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumPayment" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PremiumPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_user_id_key" ON "Member"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_user_id_key" ON "Provider"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Adjudication_line_item_id_key" ON "Adjudication"("line_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_adjudication_id_key" ON "Payment"("adjudication_id");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_adjudication_id_key" ON "Dispute"("adjudication_id");

-- CreateIndex
CREATE UNIQUE INDEX "EOB_claim_id_key" ON "EOB"("claim_id");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependent" ADD CONSTRAINT "Dependent_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageRule" ADD CONSTRAINT "CoverageRule_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "Dependent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjudication" ADD CONSTRAINT "Adjudication_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_adjudication_id_fkey" FOREIGN KEY ("adjudication_id") REFERENCES "Adjudication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_adjudication_id_fkey" FOREIGN KEY ("adjudication_id") REFERENCES "Adjudication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EOB" ADD CONSTRAINT "EOB_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumPayment" ADD CONSTRAINT "PremiumPayment_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumPayment" ADD CONSTRAINT "PremiumPayment_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

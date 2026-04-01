-- AlterTable
ALTER TABLE "Dependent" ADD COLUMN     "health_report_url" TEXT,
ADD COLUMN     "medical_conditions" TEXT,
ADD COLUMN     "premium_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_UNDERWRITING',
ALTER COLUMN "is_active" SET DEFAULT false;

-- AlterTable
ALTER TABLE "PremiumPayment" ADD COLUMN     "dependent_id" TEXT;

/*
  Warnings:

  - Added the required column `service_date` to the `LineItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "admission_date" TIMESTAMP(3),
ADD COLUMN     "discharge_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "service_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "ifsc_code" TEXT;

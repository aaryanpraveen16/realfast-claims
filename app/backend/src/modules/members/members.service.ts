import { prisma } from '../../config/db';
import { PlanType } from '@prisma/client';
import * as ratingService from './rating.service';
import fs from 'fs';
import path from 'path';

// Rule:   Fetch member record associated with user.
export async function getMemberByUserId(userId: string) {
  return prisma.member.findUnique({
    where: { user_id: userId },
    include: { 
      policy: { include: { coverage_rules: true } },
      dependents: true
    }
  });
}

// Rule:   Update member info while excluding restricted fields.
export async function updateMember(memberId: string, data: any) {
  const { dob, aadhaar_hash, user_id, ...updateData } = data;
  return prisma.member.update({
    where: { id: memberId },
    data: updateData,
  });
}

// Rule:   Create a new dependent for the member with Underwriting integration.
// Supports optional file upload.
export async function createDependent(
  memberId: string, 
  data: any, 
  fileData?: { buffer: Buffer, filename: string }
) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { policy: true },
  });

  if (!member || !member.policy || member.policy.plan_type === PlanType.INDIVIDUAL) {
    const error = new Error('Adding dependents is not allowed on Individual plans. Please upgrade.');
    (error as any).statusCode = 400;
    throw error;
  }

  // ENFORCEMENT: Max 5 dependents.
  const dependentCount = await prisma.dependent.count({
    where: { member_id: memberId }
  });

  if (dependentCount >= 5) {
    const error = new Error('You have reached the maximum limit of 5 dependents allowed on this policy.');
    (error as any).statusCode = 400;
    throw error;
  }

  // Handle File Persistence if present
  let health_report_url = null;
  if (fileData) {
    const fileName = `${Date.now()}_${fileData.filename}`;
    const uploadPath = path.join(__dirname, '../../../public/uploads', fileName);
    
    await fs.promises.writeFile(uploadPath, fileData.buffer);
    health_report_url = `/uploads/${fileName}`;
  }

  // Underwriting Logic
  const ratingData = ratingService.calculateDependentPremium({
    relationship: data.relationship,
    dob: data.dob,
    hasMedicalConditions: !!data.medical_conditions,
  });

  return prisma.dependent.create({
    data: {
      ...data,
      member_id: memberId,
      status: ratingData.requiresManualUnderwriting ? 'PENDING_UNDERWRITING' : 'AWAITING_PAYMENT',
      base_premium: ratingData.basePremium,
      loading_amount: ratingData.loadingAmount,
      health_report_url,
      is_active: false,
    },
  });
}

// Rule:   Process payment for a dependent to make them active.
export async function payDependentPremium(memberId: string, dependentId: string, paymentData: { method: string }) {
  const dependent = await prisma.dependent.findUnique({
    where: { id: dependentId }
  });

  if (!dependent || (dependent as any).member_id !== memberId) {
    const error = new Error('Dependent not found.');
    (error as any).statusCode = 404;
    throw error;
  }

  if (dependent.status !== 'AWAITING_PAYMENT') {
    const error = new Error('Dependent is not in a state that allows payment (Underwriting may be required or already active).');
    (error as any).statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    const totalAmount = (dependent as any).base_premium + (dependent as any).loading_amount;
    
    await (tx as any).premiumPayment.create({
      data: {
        member_id: memberId,
        policy_id: (await tx.member.findUnique({ where: { id: memberId } }))?.policy_id!,
        dependent_id: dependentId,
        amount: totalAmount,
        method: paymentData.method,
        status: 'PROCESSED'
      }
    });

    // 2. Activate the dependent
    return tx.dependent.update({
      where: { id: dependentId },
      data: {
        status: 'ACTIVE',
        is_active: true
      }
    });
  });
}

// Rule:   List all dependents for a member.
export async function getDependentsByMemberId(memberId: string) {
  return prisma.dependent.findMany({
    where: { member_id: memberId },
  });
}

// Rule:   Fetch policy and associated coverage rules.
export async function getMemberPolicy(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { policy: { include: { coverage_rules: true } } },
  });
  return member?.policy || null;
}

// Rule:   Select a policy for the member. Sets status to PENDING_PAYMENT.
export async function selectPolicy(memberId: string, policyId: string) {
  return prisma.member.update({
    where: { id: memberId },
    data: { 
      policy_id: policyId,
      status: 'PENDING_PAYMENT'
    },
  });
}

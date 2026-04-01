import { PrismaClient, UserRole, NetworkStatus, PlanType, DeductibleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  console.log('Starting seeding...');

  // --- USERS & ROLES ---
  
  const superAdminPassword = await bcrypt.hash('Admin@123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'admin@realfast.com' },
    update: { password_hash: superAdminPassword },
    create: {
      email: 'admin@realfast.com',
      password_hash: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const adjudicatorPassword = await bcrypt.hash('Adj@123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'adj@realfast.com' },
    update: { password_hash: adjudicatorPassword },
    create: {
      email: 'adj@realfast.com',
      password_hash: adjudicatorPassword,
      role: UserRole.ADJUDICATOR,
    },
  });

  const underwriterPassword = await bcrypt.hash('Under@123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'underwriter@realfast.com' },
    update: { password_hash: underwriterPassword },
    create: {
      email: 'underwriter@realfast.com',
      password_hash: underwriterPassword,
      role: UserRole.UNDERWRITER,
    },
  });

  const providerPassword = await bcrypt.hash('Provider@123', saltRounds);
  
  const apolloUser = await prisma.user.upsert({
    where: { email: 'apollo@test.com' },
    update: { password_hash: providerPassword },
    create: {
      email: 'apollo@test.com',
      password_hash: providerPassword,
      role: UserRole.PROVIDER,
    },
  });

  await prisma.provider.upsert({
    where: { user_id: apolloUser.id },
    update: { network_status: NetworkStatus.IN_NETWORK },
    create: {
      user_id: apolloUser.id,
      name: 'Apollo Hospital Mumbai',
      license_no: 'MH-HOSP-1234',
      network_status: NetworkStatus.IN_NETWORK,
      specialty: 'Multispecialty',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
  });

  const cityClinicUser = await prisma.user.upsert({
    where: { email: 'cityclinic@test.com' },
    update: { password_hash: providerPassword },
    create: {
      email: 'cityclinic@test.com',
      password_hash: providerPassword,
      role: UserRole.PROVIDER,
    },
  });

  await prisma.provider.upsert({
    where: { user_id: cityClinicUser.id },
    update: { network_status: NetworkStatus.OUT_OF_NETWORK },
    create: {
      user_id: cityClinicUser.id,
      name: 'City Clinic Pune',
      license_no: 'MH-CLINIC-5678',
      network_status: NetworkStatus.OUT_OF_NETWORK,
      specialty: 'General',
      city: 'Pune',
      state: 'Maharashtra',
    },
  });

  // --- POLICIES & COVERAGE RULES ---

  const policiesData = [
    {
      name: 'Individual Basic',
      plan_type: PlanType.INDIVIDUAL,
      premium: 8000,
      deductible: 5000,
      deductible_type: DeductibleType.PER_PERSON,
      annual_limit: 200000,
      network_type: 'NATIONAL',
      room_rent_limit: 3000,
      copay_pct: 0,
      out_of_network_copay_pct: 30,
      voluntary_copay_pct: 0,
      ped_waiting_days: 734,
      coverage: {
        DOCTOR_VISIT: 6000,
        MRI_SCAN: 8000,
        BLOOD_TEST: 3000,
        SURGERY: 100000,
        PHYSIOTHERAPY: 5000,
        ROOM_RENT: 3000,
        MEDICINE: 10000,
        AMBULANCE: 2000,
      },
    },
    {
      name: 'Family Floater Plus',
      plan_type: PlanType.FAMILY_FLOATER,
      premium: 18000,
      deductible: 10000,
      deductible_type: DeductibleType.AGGREGATE,
      annual_limit: 500000,
      network_type: 'NATIONAL',
      room_rent_limit: 5000,
      copay_pct: 0,
      out_of_network_copay_pct: 20,
      voluntary_copay_pct: 0,
      ped_waiting_days: 1095,
      coverage: {
        DOCTOR_VISIT: 10000,
        MRI_SCAN: 15000,
        BLOOD_TEST: 5000,
        SURGERY: 150000,
        PHYSIOTHERAPY: 8000,
        ROOM_RENT: 5000,
        MEDICINE: 20000,
        AMBULANCE: 3000,
      },
    },
    {
      name: 'Corporate Group',
      plan_type: PlanType.MULTI_INDIVIDUAL,
      premium: 6000,
      deductible: 0,
      deductible_type: DeductibleType.PER_PERSON,
      annual_limit: 300000,
      network_type: 'NATIONAL',
      room_rent_limit: 4000,
      copay_pct: 10,
      out_of_network_copay_pct: 40,
      voluntary_copay_pct: 0,
      ped_waiting_days: 734,
      coverage: {
        DOCTOR_VISIT: 8000,
        MRI_SCAN: 12000,
        BLOOD_TEST: 4000,
        SURGERY: 120000,
        PHYSIOTHERAPY: 6000,
        ROOM_RENT: 4000,
        MEDICINE: 15000,
        AMBULANCE: 2500,
      },
    },
  ];

  for (const p of policiesData) {
    const policy = await prisma.policy.upsert({
      where: { name: p.name },
      update: {
        plan_type: p.plan_type,
        premium: p.premium,
        deductible: p.deductible,
        deductible_type: p.deductible_type,
        annual_limit: p.annual_limit,
        room_rent_limit: p.room_rent_limit,
        copay_pct: p.copay_pct,
        ped_waiting_days: p.ped_waiting_days,
        voluntary_copay_pct: p.voluntary_copay_pct,
        network_type: p.network_type,
        out_of_network_copay_pct: p.out_of_network_copay_pct,
      },
      create: {
        name: p.name,
        plan_type: p.plan_type,
        premium: p.premium,
        deductible: p.deductible,
        deductible_type: p.deductible_type,
        annual_limit: p.annual_limit,
        network_type: p.network_type,
        room_rent_limit: p.room_rent_limit,
        copay_pct: p.copay_pct,
        voluntary_copay_pct: p.voluntary_copay_pct,
        ped_waiting_days: p.ped_waiting_days,
        out_of_network_copay_pct: p.out_of_network_copay_pct,
      },
    });

    for (const [sType, limit] of Object.entries(p.coverage)) {
      await prisma.coverageRule.upsert({
        where: {
          policy_id_service_type: {
            policy_id: policy.id,
            service_type: sType,
          },
        },
        update: {
          is_covered: true,
          limit_per_year: limit as number,
          copay_flat: 0,
          requires_preauth: sType === 'MRI_SCAN' || sType === 'SURGERY',
          ped_exclusion: true,
        },
        create: {
          policy_id: policy.id,
          service_type: sType,
          is_covered: true,
          limit_per_year: limit as number,
          copay_flat: 0,
          requires_preauth: sType === 'MRI_SCAN' || sType === 'SURGERY',
          ped_exclusion: true,
        },
      });
    }
  }

  // --- RESTORE MEMBERS ---

  const member1Password = await bcrypt.hash('Member@123', saltRounds);
  const member1User = await prisma.user.upsert({
    where: { email: 'rahul@test.com' },
    update: { password_hash: member1Password },
    create: {
      email: 'rahul@test.com',
      password_hash: member1Password,
      role: UserRole.MEMBER,
    },
  });

  const basicPolicy = await prisma.policy.findFirst({ where: { name: 'Individual Basic' } });

  await prisma.member.upsert({
    where: { user_id: member1User.id },
    update: { 
      name: 'Rahul Sharma',
      phone: '9999999999',
      policy_id: basicPolicy?.id,
    },
    create: {
      user_id: member1User.id,
      name: 'Rahul Sharma',
      phone: '9999999999',
      dob: new Date('1990-01-01'),
      aadhaar_hash: 'dummy-hash-1',
      status: 'ACTIVE',
      policy_id: basicPolicy?.id,
    },
  });

  const member2Password = await bcrypt.hash('Member@123', saltRounds);
  const member2User = await prisma.user.upsert({
    where: { email: 'priya@test.com' },
    update: { password_hash: member2Password },
    create: {
      email: 'priya@test.com',
      password_hash: member2Password,
      role: UserRole.MEMBER,
    },
  });

  await prisma.member.upsert({
    where: { user_id: member2User.id },
    update: { 
      name: 'Priya Patel',
      phone: '8888888888',
      policy_id: basicPolicy?.id,
    },
    create: {
      user_id: member2User.id,
      name: 'Priya Patel',
      phone: '8888888888',
      dob: new Date('1995-05-05'),
      aadhaar_hash: 'dummy-hash-2',
      status: 'ACTIVE',
      policy_id: basicPolicy?.id,
    },
  });

  console.log('Seeding completed successfully.');
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

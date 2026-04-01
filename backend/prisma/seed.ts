import { PrismaClient, UserRole, NetworkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // SUPER_ADMIN
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

  // ADJUDICATOR
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

  // MEMBER 1
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

  await prisma.member.upsert({
    where: { user_id: member1User.id },
    update: {
      name: 'Rahul Sharma',
      phone: '9999999999',
    },
    create: {
      user_id: member1User.id,
      name: 'Rahul Sharma',
      phone: '9999999999',
      dob: new Date('1990-01-01'), // Dummy DOB as it is required
      aadhaar_hash: 'dummy-hash-1', // Dummy hash
      status: 'ACTIVE',
    },
  });

  // MEMBER 2
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
    },
    create: {
      user_id: member2User.id,
      name: 'Priya Patel',
      phone: '8888888888',
      dob: new Date('1995-05-05'),
      aadhaar_hash: 'dummy-hash-2',
      status: 'ACTIVE',
    },
  });

  // PROVIDER
  const providerPassword = await bcrypt.hash('Provider@123', saltRounds);
  const providerUser = await prisma.user.upsert({
    where: { email: 'apollo@test.com' },
    update: { password_hash: providerPassword },
    create: {
      email: 'apollo@test.com',
      password_hash: providerPassword,
      role: UserRole.PROVIDER,
    },
  });

  await prisma.provider.upsert({
    where: { user_id: providerUser.id },
    update: {
      name: 'Apollo Hospital Mumbai',
      license_no: 'MH-HOSP-1234',
      network_status: NetworkStatus.IN_NETWORK,
    },
    create: {
      user_id: providerUser.id,
      name: 'Apollo Hospital Mumbai',
      license_no: 'MH-HOSP-1234',
      network_status: NetworkStatus.IN_NETWORK,
      specialty: 'Multispecialty',
      city: 'Mumbai',
      state: 'Maharashtra',
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

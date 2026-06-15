import { PrismaClient } from '@prisma/client';
import { Role } from '../src/role.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear database
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  
  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const ownerPassword = await bcrypt.hash('Owner@123', saltRounds);
  const userPassword = await bcrypt.hash('User@123', saltRounds);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '123 Admin Headquarters, Tech City',
      role: Role.ADMIN,
    },
  });

  // 2. Create Store Owner
  const owner = await prisma.user.create({
    data: {
      name: 'John Store Owner Professional',
      email: 'owner@storerating.com',
      password: ownerPassword,
      address: '456 Business District, Commercial Ave',
      role: Role.STORE_OWNER,
    },
  });

  // 3. Create Store linked to Store Owner
  const store = await prisma.store.create({
    data: {
      name: 'Supermart General Store',
      email: 'contact@supermart.com',
      address: '789 Grocery Boulevard, Retail Park',
      ownerId: owner.id,
    },
  });

  // 4. Create Normal User
  const normalUser = await prisma.user.create({
    data: {
      name: 'Regular Customer Account User',
      email: 'user@storerating.com',
      password: userPassword,
      address: '101 Residential Complex, Suburbia',
      role: Role.USER,
    },
  });

  // Create another user to have multiple ratings
  const secondUserPassword = await bcrypt.hash('Second@123', saltRounds);
  const secondUser = await prisma.user.create({
    data: {
      name: 'Alice Cooper Active Consumer',
      email: 'alice@storerating.com',
      password: secondUserPassword,
      address: '202 Apartment Block, Suburbia',
      role: Role.USER,
    },
  });

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      {
        userId: normalUser.id,
        storeId: store.id,
        rating: 4,
      },
      {
        userId: secondUser.id,
        storeId: store.id,
        rating: 5,
      },
    ],
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

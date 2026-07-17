import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seeds a known ADMIN account (registration always yields USER, so an admin must
 * be provisioned out-of-band) plus a few demo vehicles for a populated dashboard.
 */
async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@dealership.test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Dealer Admin';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin ready: ${adminEmail} / ${adminPassword}`);

  const demoVehicles = [
    { make: 'Toyota', model: 'Corolla', category: 'Sedan', priceCents: 2200000, quantity: 8 },
    { make: 'Honda', model: 'Civic', category: 'Sedan', priceCents: 2450000, quantity: 5 },
    { make: 'Ford', model: 'Mustang', category: 'Coupe', priceCents: 4500000, quantity: 2 },
    { make: 'Tesla', model: 'Model 3', category: 'Electric', priceCents: 4200000, quantity: 0 },
    { make: 'Jeep', model: 'Wrangler', category: 'SUV', priceCents: 3800000, quantity: 4 },
    { make: 'Mahindra', model: 'Thar', category: 'SUV', priceCents: 1500000, quantity: 6 },
  ];

  const count = await prisma.vehicle.count();
  if (count === 0) {
    await prisma.vehicle.createMany({ data: demoVehicles });
    console.log(`✅ Seeded ${demoVehicles.length} demo vehicles`);
  } else {
    console.log('ℹ️  Vehicles already present, skipping vehicle seed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

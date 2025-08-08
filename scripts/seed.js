const { seedDatabase } = require('../lib/seed');

async function runSeed() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
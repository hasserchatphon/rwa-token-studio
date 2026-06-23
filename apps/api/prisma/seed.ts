import { createPrismaClient } from "../src/prisma";
import { ensureDatabaseSchema } from "../src/schema";
import { seedDatabase } from "../src/seed";

const prisma = createPrismaClient();

await ensureDatabaseSchema(prisma);
await seedDatabase(prisma);
await prisma.$disconnect();

console.log("Seeded RWA Token Studio database.");

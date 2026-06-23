import { createPrismaClient } from "../src/prisma";
import { ensureDatabaseSchema } from "../src/schema";

const prisma = createPrismaClient();

await ensureDatabaseSchema(prisma);
await prisma.$disconnect();

console.log("Initialized RWA Token Studio database schema.");


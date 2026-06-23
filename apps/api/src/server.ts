import { createApp } from "./app";
import { createPrismaClient } from "./prisma";

const prisma = createPrismaClient();
const app = createApp(prisma);
const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";

try {
  await app.listen({ host, port });
  console.log(`RWA Token Studio API listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}


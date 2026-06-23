import { PrismaClient } from "@prisma/client";

export async function ensureDatabaseSchema(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Asset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "sponsor" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "tokenSymbol" TEXT NOT NULL,
      "tokenSupply" INTEGER NOT NULL,
      "tokenPriceCents" INTEGER NOT NULL,
      "tokensSold" INTEGER NOT NULL,
      "minTokensPerOrder" INTEGER NOT NULL,
      "maxTokensPerInvestor" INTEGER NOT NULL,
      "acceptedJurisdictionsJson" TEXT NOT NULL,
      "distributionRateBps" INTEGER NOT NULL,
      "riskRating" TEXT NOT NULL,
      "maturityDate" TEXT,
      "highlightsJson" TEXT NOT NULL,
      "complianceNotesJson" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AssetDocument" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "assetId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "kind" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      CONSTRAINT "AssetDocument_assetId_fkey"
        FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Investor" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "jurisdiction" TEXT NOT NULL,
      "kycStatus" TEXT NOT NULL,
      "cashBalanceCents" INTEGER NOT NULL
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Holding" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "investorId" TEXT NOT NULL,
      "assetId" TEXT NOT NULL,
      "tokens" INTEGER NOT NULL,
      CONSTRAINT "Holding_investorId_fkey"
        FOREIGN KEY ("investorId") REFERENCES "Investor" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Holding_assetId_fkey"
        FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Holding_investorId_assetId_key"
    ON "Holding" ("investorId", "assetId")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "assetId" TEXT NOT NULL,
      "investorId" TEXT NOT NULL,
      "tokens" INTEGER NOT NULL,
      "amountCents" INTEGER NOT NULL,
      "status" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      CONSTRAINT "Order_assetId_fkey"
        FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Order_investorId_fkey"
        FOREIGN KEY ("investorId") REFERENCES "Investor" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LedgerEntry" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "assetId" TEXT NOT NULL,
      "investorId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "tokens" INTEGER NOT NULL,
      "amountCents" INTEGER NOT NULL,
      "createdAt" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      CONSTRAINT "LedgerEntry_assetId_fkey"
        FOREIGN KEY ("assetId") REFERENCES "Asset" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "LedgerEntry_investorId_fkey"
        FOREIGN KEY ("investorId") REFERENCES "Investor" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
}


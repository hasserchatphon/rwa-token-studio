import { PrismaClient } from "@prisma/client";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { ensureDatabaseSchema } from "../schema";
import { seedDatabase } from "../seed";

const tempDir = mkdtempSync(join(tmpdir(), "rwa-token-studio-api-"));
const databaseUrl = `file:${join(tempDir, "test.db")}`;

let prisma: PrismaClient | undefined;
let app: ReturnType<typeof createApp> | undefined;

beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
  await ensureDatabaseSchema(prisma);
  await seedDatabase(prisma);
  app = createApp(prisma);
});

afterAll(async () => {
  await app?.close();
  await prisma?.$disconnect();
  rmSync(tempDir, { recursive: true, force: true });
});

function server() {
  if (!app) {
    throw new Error("Test app was not initialized.");
  }

  return app;
}

describe("RWA Token Studio API", () => {
  it("returns seeded assets", async () => {
    const response = await server().inject({
      method: "GET",
      url: "/api/assets"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.assets).toHaveLength(3);
    expect(body.assets[0]).toMatchObject({
      id: "asset_warehouse_01",
      tokenSymbol: "NLH"
    });
  });

  it("returns the demo portfolio", async () => {
    const response = await server().inject({
      method: "GET",
      url: "/api/portfolio"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.investor.holdings.asset_warehouse_01).toBe(1200);
    expect(body.ledger).toHaveLength(3);
  });

  it("settles an eligible order into persisted records", async () => {
    const response = await server().inject({
      method: "POST",
      url: "/api/orders",
      payload: {
        assetId: "asset_warehouse_01",
        tokens: 250
      }
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.order).toMatchObject({
      assetId: "asset_warehouse_01",
      tokens: 250,
      status: "settled"
    });
    expect(body.asset.tokensSold).toBe(168650);
    expect(body.investor.cashBalanceCents).toBe(170000);
    expect(body.investor.holdings.asset_warehouse_01).toBe(1450);

    const portfolio = await server().inject({
      method: "GET",
      url: "/api/portfolio"
    });
    expect(portfolio.json().ledger).toHaveLength(4);
  });

  it("blocks orders below the asset minimum", async () => {
    const response = await server().inject({
      method: "POST",
      url: "/api/orders",
      payload: {
        assetId: "asset_warehouse_01",
        tokens: 25
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "below_minimum"
    });
  });

  it("creates draft assets through the admin route", async () => {
    const response = await server().inject({
      method: "POST",
      url: "/api/admin/assets",
      payload: {
        name: "Civic Storage Portfolio",
        category: "real_estate",
        tokenSymbol: "CSP",
        tokenSupply: 100000,
        tokenPriceCents: 1000,
        minTokensPerOrder: 100,
        distributionRateBps: 750
      }
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.asset).toMatchObject({
      name: "Civic Storage Portfolio",
      tokenSymbol: "CSP",
      tokensSold: 0
    });
  });
});

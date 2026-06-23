import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import {
  AssetCategory,
  Jurisdiction,
  demoInvestor,
  evaluatePurchase
} from "@rwa-token-studio/domain";
import Fastify from "fastify";
import { z } from "zod";
import {
  serializeAsset,
  serializeInvestor,
  serializeLedgerEntry,
  serializeOrder
} from "./serializers";

const investorId = demoInvestor.id;

const orderSchema = z.object({
  assetId: z.string().min(1),
  tokens: z.number().int().positive()
});

const createAssetSchema = z.object({
  name: z.string().trim().min(2),
  category: z.enum([
    "real_estate",
    "private_credit",
    "renewable_energy",
    "collectible"
  ] satisfies [AssetCategory, ...AssetCategory[]]),
  tokenSymbol: z.string().trim().min(2).max(8),
  tokenSupply: z.number().int().positive(),
  tokenPriceCents: z.number().int().positive(),
  minTokensPerOrder: z.number().int().positive(),
  distributionRateBps: z.number().int().nonnegative(),
  sponsor: z.string().trim().min(2).default("Studio Issuer"),
  location: z.string().trim().min(2).default("Demo Market"),
  description: z
    .string()
    .trim()
    .min(8)
    .default(
      "Locally created demo asset with simulated issuance, compliance, and ledger behavior."
    ),
  acceptedJurisdictions: z
    .array(z.enum(["US", "EU", "GB", "SG", "AE"] satisfies [
      Jurisdiction,
      ...Jurisdiction[]
    ]))
    .min(1)
    .default(["US", "EU", "GB"]),
  maxTokensPerInvestor: z.number().int().positive().optional()
});

export function createApp(prisma: PrismaClient) {
  const app = Fastify({
    logger: false
  });

  app.register(cors, {
    origin: true
  });

  app.get("/health", async () => ({
    ok: true,
    service: "rwa-token-studio-api"
  }));

  app.get("/api/assets", async () => {
    const assets = await prisma.asset.findMany({
      include: { documents: true },
      orderBy: { createdAt: "asc" }
    });

    return {
      assets: assets.map(serializeAsset)
    };
  });

  app.get<{ Params: { id: string } }>("/api/assets/:id", async (request, reply) => {
    const asset = await prisma.asset.findUnique({
      where: { id: request.params.id },
      include: { documents: true }
    });

    if (!asset) {
      return reply.code(404).send({
        error: "asset_not_found",
        message: "Asset was not found."
      });
    }

    return {
      asset: serializeAsset(asset)
    };
  });

  app.get("/api/portfolio", async (request, reply) => {
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      include: { holdings: true }
    });

    if (!investor) {
      return reply.code(404).send({
        error: "investor_not_found",
        message: "Demo investor was not found. Seed the database first."
      });
    }

    const ledger = await prisma.ledgerEntry.findMany({
      where: { investorId },
      orderBy: { createdAt: "desc" }
    });

    return {
      investor: serializeInvestor(investor),
      ledger: ledger.map(serializeLedgerEntry)
    };
  });

  app.post("/api/orders", async (request, reply) => {
    const parsed = orderSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_order",
        message: "Order payload is invalid."
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const assetRecord = await tx.asset.findUnique({
        where: { id: parsed.data.assetId },
        include: { documents: true }
      });
      const investorRecord = await tx.investor.findUnique({
        where: { id: investorId },
        include: { holdings: true }
      });

      if (!assetRecord || !investorRecord) {
        return {
          statusCode: 404,
          payload: {
            error: "order_target_not_found",
            message: "Asset or investor was not found."
          }
        };
      }

      const asset = serializeAsset(assetRecord);
      const investor = serializeInvestor(investorRecord);
      const decision = evaluatePurchase(asset, investor, parsed.data.tokens);

      if (!decision.ok) {
        return {
          statusCode: statusForPurchaseReason(decision.reason),
          payload: {
            error: decision.reason,
            message: decision.message
          }
        };
      }

      const createdAt = new Date().toISOString().slice(0, 10);
      const orderId = `order_${Date.now()}`;
      const ledgerId = `ledger_${Date.now()}`;

      await tx.asset.update({
        where: { id: asset.id },
        data: {
          tokensSold: {
            increment: decision.order.tokens
          }
        }
      });

      await tx.investor.update({
        where: { id: investor.id },
        data: {
          cashBalanceCents: {
            decrement: decision.order.amountCents
          }
        }
      });

      await tx.holding.upsert({
        where: {
          investorId_assetId: {
            investorId: investor.id,
            assetId: asset.id
          }
        },
        create: {
          investorId: investor.id,
          assetId: asset.id,
          tokens: decision.order.projectedHolding
        },
        update: {
          tokens: decision.order.projectedHolding
        }
      });

      const order = await tx.order.create({
        data: {
          id: orderId,
          assetId: asset.id,
          investorId: investor.id,
          tokens: decision.order.tokens,
          amountCents: decision.order.amountCents,
          status: "settled",
          createdAt
        }
      });

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          id: ledgerId,
          assetId: asset.id,
          investorId: investor.id,
          type: "subscription",
          tokens: decision.order.tokens,
          amountCents: decision.order.amountCents,
          createdAt,
          status: "settled"
        }
      });

      const updatedAsset = await tx.asset.findUniqueOrThrow({
        where: { id: asset.id },
        include: { documents: true }
      });
      const updatedInvestor = await tx.investor.findUniqueOrThrow({
        where: { id: investor.id },
        include: { holdings: true }
      });

      return {
        statusCode: 201,
        payload: {
          order: serializeOrder(order),
          asset: serializeAsset(updatedAsset),
          investor: serializeInvestor(updatedInvestor),
          ledgerEntry: serializeLedgerEntry(ledgerEntry)
        }
      };
    });

    return reply.code(result.statusCode).send(result.payload);
  });

  app.post("/api/admin/assets", async (request, reply) => {
    const parsed = createAssetSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_asset",
        message: "Asset payload is invalid."
      });
    }

    const symbol = parsed.data.tokenSymbol.trim().toUpperCase();
    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const now = Date.now();
    const assetId = `asset_custom_${now}`;
    const minOrder = parsed.data.minTokensPerOrder;

    const asset = await prisma.asset.create({
      data: {
        id: assetId,
        slug: `${slug}-${now}`,
        name: parsed.data.name.trim(),
        sponsor: parsed.data.sponsor,
        category: parsed.data.category,
        location: parsed.data.location,
        description: parsed.data.description,
        imageUrl: "local:property",
        tokenSymbol: symbol,
        tokenSupply: parsed.data.tokenSupply,
        tokenPriceCents: parsed.data.tokenPriceCents,
        tokensSold: 0,
        minTokensPerOrder: minOrder,
        maxTokensPerInvestor:
          parsed.data.maxTokensPerInvestor ?? Math.max(minOrder * 20, minOrder),
        acceptedJurisdictionsJson: JSON.stringify(
          parsed.data.acceptedJurisdictions
        ),
        distributionRateBps: parsed.data.distributionRateBps,
        riskRating: "medium",
        highlightsJson: JSON.stringify([
          "Draft issuance profile",
          "Document review pending",
          "Transfer restrictions enabled"
        ]),
        complianceNotesJson: JSON.stringify([
          "Issuer approval required before launch",
          "Investor eligibility rules must be reviewed"
        ]),
        documents: {
          create: [
            {
              id: `doc_${now}`,
              title: "Draft asset profile",
              kind: "offering_memo",
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          ]
        }
      },
      include: {
        documents: true
      }
    });

    return reply.code(201).send({
      asset: serializeAsset(asset)
    });
  });

  return app;
}

function statusForPurchaseReason(reason: string) {
  switch (reason) {
    case "invalid_quantity":
    case "below_minimum":
    case "insufficient_cash":
      return 400;
    case "kyc_required":
    case "jurisdiction_restricted":
    case "investor_limit_exceeded":
      return 403;
    case "supply_unavailable":
      return 409;
    default:
      return 400;
  }
}


import { PrismaClient } from "@prisma/client";
import { demoAssets, demoInvestor, demoLedger } from "@rwa-token-studio/domain";
import { ensureDatabaseSchema } from "./schema";

export async function seedDatabase(prisma: PrismaClient) {
  await ensureDatabaseSchema(prisma);

  await prisma.$transaction(async (tx) => {
    await tx.ledgerEntry.deleteMany();
    await tx.order.deleteMany();
    await tx.holding.deleteMany();
    await tx.assetDocument.deleteMany();
    await tx.asset.deleteMany();
    await tx.investor.deleteMany();

    for (const asset of demoAssets) {
      await tx.asset.create({
        data: {
          id: asset.id,
          slug: asset.slug,
          name: asset.name,
          sponsor: asset.sponsor,
          category: asset.category,
          location: asset.location,
          description: asset.description,
          imageUrl: asset.imageUrl,
          tokenSymbol: asset.tokenSymbol,
          tokenSupply: asset.tokenSupply,
          tokenPriceCents: asset.tokenPriceCents,
          tokensSold: asset.tokensSold,
          minTokensPerOrder: asset.minTokensPerOrder,
          maxTokensPerInvestor: asset.maxTokensPerInvestor,
          acceptedJurisdictionsJson: JSON.stringify(asset.acceptedJurisdictions),
          distributionRateBps: asset.distributionRateBps,
          riskRating: asset.riskRating,
          maturityDate: asset.maturityDate ?? null,
          highlightsJson: JSON.stringify(asset.highlights),
          complianceNotesJson: JSON.stringify(asset.complianceNotes),
          documents: {
            create: asset.documents.map((document) => ({
              id: document.id,
              title: document.title,
              kind: document.kind,
              updatedAt: document.updatedAt
            }))
          }
        }
      });
    }

    await tx.investor.create({
      data: {
        id: demoInvestor.id,
        name: demoInvestor.name,
        jurisdiction: demoInvestor.jurisdiction,
        kycStatus: demoInvestor.kycStatus,
        cashBalanceCents: demoInvestor.cashBalanceCents,
        holdings: {
          create: Object.entries(demoInvestor.holdings).map(
            ([assetId, tokens]) => ({
              assetId,
              tokens
            })
          )
        }
      }
    });

    for (const entry of demoLedger) {
      await tx.ledgerEntry.create({
        data: {
          id: entry.id,
          assetId: entry.assetId,
          investorId: entry.investorId,
          type: entry.type,
          tokens: entry.tokens,
          amountCents: entry.amountCents,
          createdAt: entry.createdAt,
          status: entry.status
        }
      });
    }
  });
}

import { Asset, AssetDocument, Holding, Investor, LedgerEntry, Order } from "@prisma/client";
import {
  AssetDocument as DomainAssetDocument,
  InvestorProfile,
  LedgerEntry as DomainLedgerEntry,
  TokenizedAsset
} from "@rwa-token-studio/domain";

type AssetWithDocuments = Asset & {
  documents: AssetDocument[];
};

type InvestorWithHoldings = Investor & {
  holdings: Holding[];
};

function parseStringArray(value: string): string[] {
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

export function serializeAsset(asset: AssetWithDocuments): TokenizedAsset {
  return {
    id: asset.id,
    slug: asset.slug,
    name: asset.name,
    sponsor: asset.sponsor,
    category: asset.category as TokenizedAsset["category"],
    location: asset.location,
    description: asset.description,
    imageUrl: asset.imageUrl,
    tokenSymbol: asset.tokenSymbol,
    tokenSupply: asset.tokenSupply,
    tokenPriceCents: asset.tokenPriceCents,
    tokensSold: asset.tokensSold,
    minTokensPerOrder: asset.minTokensPerOrder,
    maxTokensPerInvestor: asset.maxTokensPerInvestor,
    acceptedJurisdictions: parseStringArray(
      asset.acceptedJurisdictionsJson
    ) as TokenizedAsset["acceptedJurisdictions"],
    distributionRateBps: asset.distributionRateBps,
    riskRating: asset.riskRating as TokenizedAsset["riskRating"],
    maturityDate: asset.maturityDate ?? undefined,
    highlights: parseStringArray(asset.highlightsJson),
    complianceNotes: parseStringArray(asset.complianceNotesJson),
    documents: asset.documents.map(serializeAssetDocument)
  };
}

export function serializeAssetDocument(
  document: AssetDocument
): DomainAssetDocument {
  return {
    id: document.id,
    title: document.title,
    kind: document.kind as DomainAssetDocument["kind"],
    updatedAt: document.updatedAt
  };
}

export function serializeInvestor(
  investor: InvestorWithHoldings
): InvestorProfile {
  return {
    id: investor.id,
    name: investor.name,
    jurisdiction: investor.jurisdiction as InvestorProfile["jurisdiction"],
    kycStatus: investor.kycStatus as InvestorProfile["kycStatus"],
    cashBalanceCents: investor.cashBalanceCents,
    holdings: Object.fromEntries(
      investor.holdings.map((holding) => [holding.assetId, holding.tokens])
    )
  };
}

export function serializeLedgerEntry(entry: LedgerEntry): DomainLedgerEntry {
  return {
    id: entry.id,
    assetId: entry.assetId,
    investorId: entry.investorId,
    type: entry.type as DomainLedgerEntry["type"],
    tokens: entry.tokens,
    amountCents: entry.amountCents,
    createdAt: entry.createdAt,
    status: entry.status as DomainLedgerEntry["status"]
  };
}

export function serializeOrder(order: Order) {
  return {
    id: order.id,
    assetId: order.assetId,
    investorId: order.investorId,
    tokens: order.tokens,
    amountCents: order.amountCents,
    status: order.status,
    createdAt: order.createdAt
  };
}


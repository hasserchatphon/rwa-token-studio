export type AssetCategory =
  | "real_estate"
  | "private_credit"
  | "renewable_energy"
  | "collectible";

export type Jurisdiction = "US" | "EU" | "GB" | "SG" | "AE";

export type KycStatus = "approved" | "pending" | "restricted";

export type RiskRating = "low" | "medium" | "high";

export interface AssetDocument {
  id: string;
  title: string;
  kind: "offering_memo" | "valuation" | "operating_report" | "legal";
  updatedAt: string;
}

export interface TokenizedAsset {
  id: string;
  slug: string;
  name: string;
  sponsor: string;
  category: AssetCategory;
  location: string;
  description: string;
  imageUrl: string;
  tokenSymbol: string;
  tokenSupply: number;
  tokenPriceCents: number;
  tokensSold: number;
  minTokensPerOrder: number;
  maxTokensPerInvestor: number;
  acceptedJurisdictions: Jurisdiction[];
  distributionRateBps: number;
  riskRating: RiskRating;
  maturityDate?: string;
  highlights: string[];
  complianceNotes: string[];
  documents: AssetDocument[];
}

export interface InvestorProfile {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  kycStatus: KycStatus;
  cashBalanceCents: number;
  holdings: Record<string, number>;
}

export interface LedgerEntry {
  id: string;
  assetId: string;
  investorId: string;
  type: "subscription" | "distribution" | "transfer";
  tokens: number;
  amountCents: number;
  createdAt: string;
  status: "settled" | "pending" | "blocked";
}

export interface PurchaseOrder {
  assetId: string;
  investorId: string;
  tokens: number;
  amountCents: number;
  projectedHolding: number;
}

export type PurchaseDecision =
  | {
      ok: true;
      order: PurchaseOrder;
    }
  | {
      ok: false;
      reason:
        | "invalid_quantity"
        | "kyc_required"
        | "jurisdiction_restricted"
        | "below_minimum"
        | "investor_limit_exceeded"
        | "supply_unavailable"
        | "insufficient_cash";
      message: string;
    };

export const demoAssets: TokenizedAsset[] = [
  {
    id: "asset_warehouse_01",
    slug: "north-loop-logistics-hub",
    name: "North Loop Logistics Hub",
    sponsor: "Civic Harbor Capital",
    category: "real_estate",
    location: "Minneapolis, US",
    description:
      "Last-mile logistics property with stabilized lease income and quarterly reporting.",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    tokenSymbol: "NLH",
    tokenSupply: 250000,
    tokenPriceCents: 1000,
    tokensSold: 168400,
    minTokensPerOrder: 100,
    maxTokensPerInvestor: 15000,
    acceptedJurisdictions: ["US", "EU", "GB"],
    distributionRateBps: 760,
    riskRating: "medium",
    highlights: [
      "92% occupancy",
      "Quarterly operating reports",
      "Independent valuation on file"
    ],
    complianceNotes: [
      "KYC approval required",
      "Transfers limited to approved jurisdictions"
    ],
    documents: [
      {
        id: "doc_nlh_memo",
        title: "Offering memo",
        kind: "offering_memo",
        updatedAt: "2026-04-12"
      },
      {
        id: "doc_nlh_valuation",
        title: "Valuation summary",
        kind: "valuation",
        updatedAt: "2026-05-03"
      }
    ]
  },
  {
    id: "asset_solar_01",
    slug: "sonoran-solar-note",
    name: "Sonoran Solar Note",
    sponsor: "BrightGrid Finance",
    category: "renewable_energy",
    location: "Arizona, US",
    description:
      "Revenue-linked note for a distributed solar portfolio with utility offtake exposure.",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    tokenSymbol: "SSN",
    tokenSupply: 180000,
    tokenPriceCents: 500,
    tokensSold: 124500,
    minTokensPerOrder: 200,
    maxTokensPerInvestor: 20000,
    acceptedJurisdictions: ["US", "SG", "AE"],
    distributionRateBps: 910,
    riskRating: "medium",
    maturityDate: "2031-12-31",
    highlights: [
      "Contracted offtake",
      "Monthly production data",
      "Energy-sector risk disclosure"
    ],
    complianceNotes: [
      "Jurisdiction allowlist enforced",
      "Issuer review required before transfers"
    ],
    documents: [
      {
        id: "doc_ssn_memo",
        title: "Note summary",
        kind: "offering_memo",
        updatedAt: "2026-03-28"
      },
      {
        id: "doc_ssn_ops",
        title: "Production report",
        kind: "operating_report",
        updatedAt: "2026-05-18"
      }
    ]
  },
  {
    id: "asset_credit_01",
    slug: "harbor-smb-credit-pool",
    name: "Harbor SMB Credit Pool",
    sponsor: "Harbor Yield Partners",
    category: "private_credit",
    location: "European Union",
    description:
      "Diversified pool of senior secured small-business receivables with monthly servicing updates.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    tokenSymbol: "HCP",
    tokenSupply: 320000,
    tokenPriceCents: 250,
    tokensSold: 284000,
    minTokensPerOrder: 400,
    maxTokensPerInvestor: 30000,
    acceptedJurisdictions: ["EU", "GB", "SG"],
    distributionRateBps: 1120,
    riskRating: "high",
    maturityDate: "2029-06-30",
    highlights: [
      "Monthly servicing file",
      "Borrower concentration limits",
      "Senior secured exposure"
    ],
    complianceNotes: [
      "KYC and investor suitability review required",
      "Secondary transfers paused during monthly reporting close"
    ],
    documents: [
      {
        id: "doc_hcp_memo",
        title: "Credit pool memo",
        kind: "offering_memo",
        updatedAt: "2026-02-14"
      },
      {
        id: "doc_hcp_legal",
        title: "Subscription agreement",
        kind: "legal",
        updatedAt: "2026-02-14"
      }
    ]
  }
];

export const demoInvestor: InvestorProfile = {
  id: "investor_demo_01",
  name: "Demo Investor",
  jurisdiction: "EU",
  kycStatus: "approved",
  cashBalanceCents: 420000,
  holdings: {
    asset_warehouse_01: 1200,
    asset_credit_01: 800
  }
};

export const demoLedger: LedgerEntry[] = [
  {
    id: "ledger_001",
    assetId: "asset_warehouse_01",
    investorId: "investor_demo_01",
    type: "subscription",
    tokens: 1200,
    amountCents: 1200000,
    createdAt: "2026-05-09",
    status: "settled"
  },
  {
    id: "ledger_002",
    assetId: "asset_credit_01",
    investorId: "investor_demo_01",
    type: "subscription",
    tokens: 800,
    amountCents: 200000,
    createdAt: "2026-05-22",
    status: "settled"
  },
  {
    id: "ledger_003",
    assetId: "asset_warehouse_01",
    investorId: "investor_demo_01",
    type: "distribution",
    tokens: 1200,
    amountCents: 22800,
    createdAt: "2026-06-15",
    status: "settled"
  }
];

export function getAvailableTokens(asset: TokenizedAsset): number {
  return Math.max(asset.tokenSupply - asset.tokensSold, 0);
}

export function getFundingPercent(asset: TokenizedAsset): number {
  if (asset.tokenSupply <= 0) {
    return 0;
  }

  return Math.min((asset.tokensSold / asset.tokenSupply) * 100, 100);
}

export function getAssetValueCents(asset: TokenizedAsset): number {
  return asset.tokenSupply * asset.tokenPriceCents;
}

export function getMinimumInvestmentCents(asset: TokenizedAsset): number {
  return asset.minTokensPerOrder * asset.tokenPriceCents;
}

export function getPortfolioValueCents(
  assets: TokenizedAsset[],
  investor: InvestorProfile
): number {
  return assets.reduce((total, asset) => {
    const holding = investor.holdings[asset.id] ?? 0;
    return total + holding * asset.tokenPriceCents;
  }, 0);
}

export function getWeightedDistributionBps(assets: TokenizedAsset[]): number {
  const totalValue = assets.reduce(
    (sum, asset) => sum + getAssetValueCents(asset),
    0
  );

  if (totalValue === 0) {
    return 0;
  }

  const weighted = assets.reduce((sum, asset) => {
    return sum + getAssetValueCents(asset) * asset.distributionRateBps;
  }, 0);

  return Math.round(weighted / totalValue);
}

export function evaluatePurchase(
  asset: TokenizedAsset,
  investor: InvestorProfile,
  tokens: number
): PurchaseDecision {
  if (!Number.isInteger(tokens) || tokens <= 0) {
    return {
      ok: false,
      reason: "invalid_quantity",
      message: "Enter a positive whole-token quantity."
    };
  }

  if (investor.kycStatus !== "approved") {
    return {
      ok: false,
      reason: "kyc_required",
      message: "KYC approval is required before purchasing this asset."
    };
  }

  if (!asset.acceptedJurisdictions.includes(investor.jurisdiction)) {
    return {
      ok: false,
      reason: "jurisdiction_restricted",
      message: "This asset is not available in the investor jurisdiction."
    };
  }

  if (tokens < asset.minTokensPerOrder) {
    return {
      ok: false,
      reason: "below_minimum",
      message: `Minimum order is ${asset.minTokensPerOrder.toLocaleString()} tokens.`
    };
  }

  const currentHolding = investor.holdings[asset.id] ?? 0;
  const projectedHolding = currentHolding + tokens;

  if (projectedHolding > asset.maxTokensPerInvestor) {
    return {
      ok: false,
      reason: "investor_limit_exceeded",
      message: "This purchase would exceed the investor token limit."
    };
  }

  if (tokens > getAvailableTokens(asset)) {
    return {
      ok: false,
      reason: "supply_unavailable",
      message: "Requested token quantity exceeds available supply."
    };
  }

  const amountCents = tokens * asset.tokenPriceCents;

  if (amountCents > investor.cashBalanceCents) {
    return {
      ok: false,
      reason: "insufficient_cash",
      message: "Wallet cash balance is too low for this order."
    };
  }

  return {
    ok: true,
    order: {
      assetId: asset.id,
      investorId: investor.id,
      tokens,
      amountCents,
      projectedHolding
    }
  };
}

export function settlePurchase(
  assets: TokenizedAsset[],
  investor: InvestorProfile,
  ledger: LedgerEntry[],
  order: PurchaseOrder
): {
  assets: TokenizedAsset[];
  investor: InvestorProfile;
  ledger: LedgerEntry[];
} {
  const nextAssets = assets.map((asset) =>
    asset.id === order.assetId
      ? { ...asset, tokensSold: asset.tokensSold + order.tokens }
      : asset
  );

  const nextInvestor: InvestorProfile = {
    ...investor,
    cashBalanceCents: investor.cashBalanceCents - order.amountCents,
    holdings: {
      ...investor.holdings,
      [order.assetId]: order.projectedHolding
    }
  };

  const nextEntry: LedgerEntry = {
    id: `ledger_${String(ledger.length + 1).padStart(3, "0")}`,
    assetId: order.assetId,
    investorId: order.investorId,
    type: "subscription",
    tokens: order.tokens,
    amountCents: order.amountCents,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "settled"
  };

  return {
    assets: nextAssets,
    investor: nextInvestor,
    ledger: [nextEntry, ...ledger]
  };
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100);
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function toTitleCase(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}


import {
  AssetCategory,
  InvestorProfile,
  Jurisdiction,
  LedgerEntry,
  TokenizedAsset
} from "@rwa-token-studio/domain";

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export interface StudioState {
  assets: TokenizedAsset[];
  investor: InvestorProfile;
  ledger: LedgerEntry[];
}

export interface CreateAssetPayload {
  name: string;
  category: AssetCategory;
  tokenSymbol: string;
  tokenSupply: number;
  tokenPriceCents: number;
  minTokensPerOrder: number;
  distributionRateBps: number;
  acceptedJurisdictions: Jurisdiction[];
}

export interface CreateOrderResponse {
  order: {
    id: string;
    assetId: string;
    investorId: string;
    tokens: number;
    amountCents: number;
    status: string;
    createdAt: string;
  };
  asset: TokenizedAsset;
  investor: InvestorProfile;
  ledgerEntry: LedgerEntry;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function hasApiBaseUrl(): boolean {
  return Boolean(apiBaseUrl);
}

export async function getStudioState(): Promise<StudioState> {
  const [assetsResponse, portfolioResponse] = await Promise.all([
    request<{ assets: TokenizedAsset[] }>("/api/assets"),
    request<{ investor: InvestorProfile; ledger: LedgerEntry[] }>(
      "/api/portfolio"
    )
  ]);

  return {
    assets: assetsResponse.assets,
    investor: portfolioResponse.investor,
    ledger: portfolioResponse.ledger
  };
}

export async function createOrder(
  assetId: string,
  tokens: number
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ assetId, tokens })
  });
}

export async function createAsset(
  payload: CreateAssetPayload
): Promise<{ asset: TokenizedAsset }> {
  return request<{ asset: TokenizedAsset }>("/api/admin/assets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError("API URL is not configured.", 0, "api_not_configured");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const payload = (await response.json()) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      payload.message ?? "API request failed.",
      response.status,
      payload.error
    );
  }

  return payload;
}


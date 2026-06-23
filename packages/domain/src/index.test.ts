import { describe, expect, it } from "vitest";
import {
  demoAssets,
  demoInvestor,
  evaluatePurchase,
  getAvailableTokens,
  getFundingPercent,
  getPortfolioValueCents,
  settlePurchase
} from "./index";

describe("asset metrics", () => {
  it("calculates available supply and funding percentage", () => {
    const asset = demoAssets[0];

    expect(getAvailableTokens(asset)).toBe(81600);
    expect(getFundingPercent(asset)).toBeCloseTo(67.36);
  });

  it("values the demo portfolio from holdings and token prices", () => {
    expect(getPortfolioValueCents(demoAssets, demoInvestor)).toBe(1400000);
  });
});

describe("purchase rules", () => {
  it("approves an eligible purchase", () => {
    const decision = evaluatePurchase(demoAssets[0], demoInvestor, 250);

    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.order.amountCents).toBe(250000);
      expect(decision.order.projectedHolding).toBe(1450);
    }
  });

  it("blocks a jurisdiction-restricted investor", () => {
    const investor = { ...demoInvestor, jurisdiction: "AE" as const };
    const decision = evaluatePurchase(demoAssets[0], investor, 250);

    expect(decision).toMatchObject({
      ok: false,
      reason: "jurisdiction_restricted"
    });
  });

  it("blocks orders below the asset minimum", () => {
    const decision = evaluatePurchase(demoAssets[0], demoInvestor, 25);

    expect(decision).toMatchObject({
      ok: false,
      reason: "below_minimum"
    });
  });

  it("settles approved purchases into assets, cash, holdings, and ledger", () => {
    const decision = evaluatePurchase(demoAssets[0], demoInvestor, 250);
    expect(decision.ok).toBe(true);

    if (!decision.ok) {
      return;
    }

    const result = settlePurchase(demoAssets, demoInvestor, [], decision.order);
    const updatedAsset = result.assets.find((asset) => asset.id === demoAssets[0].id);

    expect(updatedAsset?.tokensSold).toBe(168650);
    expect(result.investor.cashBalanceCents).toBe(170000);
    expect(result.investor.holdings.asset_warehouse_01).toBe(1450);
    expect(result.ledger).toHaveLength(1);
    expect(result.ledger[0]).toMatchObject({
      type: "subscription",
      status: "settled"
    });
  });
});


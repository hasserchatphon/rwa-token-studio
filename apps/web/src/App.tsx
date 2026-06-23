import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  Coins,
  FileText,
  Landmark,
  Plus,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import creditImage from "./assets/asset-credit.png";
import logisticsImage from "./assets/asset-logistics.png";
import propertyImage from "./assets/asset-property.png";
import solarImage from "./assets/asset-solar.png";
import {
  AssetCategory,
  LedgerEntry,
  TokenizedAsset,
  demoAssets,
  demoInvestor,
  demoLedger,
  evaluatePurchase,
  formatBps,
  formatMoney,
  getAvailableTokens,
  getFundingPercent,
  getMinimumInvestmentCents,
  getPortfolioValueCents,
  getWeightedDistributionBps,
  settlePurchase,
  toTitleCase
} from "@rwa-token-studio/domain";

type ViewMode = "assets" | "ledger" | "admin";

interface AdminAssetForm {
  name: string;
  category: AssetCategory;
  tokenSymbol: string;
  tokenSupply: string;
  tokenPrice: string;
  minOrder: string;
  distributionRate: string;
}

const categoryOptions: AssetCategory[] = [
  "real_estate",
  "private_credit",
  "renewable_energy",
  "collectible"
];

const riskTone: Record<TokenizedAsset["riskRating"], string> = {
  low: "success",
  medium: "warning",
  high: "danger"
};

const starterForm: AdminAssetForm = {
  name: "",
  category: "real_estate",
  tokenSymbol: "",
  tokenSupply: "100000",
  tokenPrice: "10",
  minOrder: "100",
  distributionRate: "7.5"
};

const assetImageMap: Record<string, string> = {
  asset_warehouse_01: logisticsImage,
  asset_solar_01: solarImage,
  asset_credit_01: creditImage
};

const demoAssetsWithImages: TokenizedAsset[] = demoAssets.map((asset) => ({
  ...asset,
  imageUrl: assetImageMap[asset.id] ?? propertyImage
}));

function App() {
  const [assets, setAssets] = useState<TokenizedAsset[]>(demoAssetsWithImages);
  const [investor, setInvestor] = useState(demoInvestor);
  const [ledger, setLedger] = useState<LedgerEntry[]>(demoLedger);
  const [selectedAssetId, setSelectedAssetId] = useState(
    demoAssetsWithImages[0].id
  );
  const [viewMode, setViewMode] = useState<ViewMode>("assets");
  const [orderQuantity, setOrderQuantity] = useState("250");
  const [orderMessage, setOrderMessage] = useState("");
  const [adminForm, setAdminForm] = useState<AdminAssetForm>(starterForm);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? assets[0],
    [assets, selectedAssetId]
  );

  const portfolioValue = useMemo(
    () => getPortfolioValueCents(assets, investor),
    [assets, investor]
  );

  const totalAvailable = useMemo(
    () => assets.reduce((total, asset) => total + getAvailableTokens(asset), 0),
    [assets]
  );

  const averageDistribution = useMemo(
    () => getWeightedDistributionBps(assets),
    [assets]
  );

  const selectedDecision = useMemo(() => {
    const quantity = Number(orderQuantity);
    return selectedAsset
      ? evaluatePurchase(selectedAsset, investor, quantity)
      : undefined;
  }, [investor, orderQuantity, selectedAsset]);

  function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAsset || !selectedDecision) {
      return;
    }

    if (!selectedDecision.ok) {
      setOrderMessage(selectedDecision.message);
      return;
    }

    const settled = settlePurchase(
      assets,
      investor,
      ledger,
      selectedDecision.order
    );

    setAssets(settled.assets);
    setInvestor(settled.investor);
    setLedger(settled.ledger);
    setOrderMessage(
      `${selectedDecision.order.tokens.toLocaleString()} ${selectedAsset.tokenSymbol} settled.`
    );
  }

  function handleCreateAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tokenSupply = Number(adminForm.tokenSupply);
    const tokenPriceCents = Math.round(Number(adminForm.tokenPrice) * 100);
    const minTokensPerOrder = Number(adminForm.minOrder);
    const distributionRateBps = Math.round(
      Number(adminForm.distributionRate) * 100
    );

    if (
      !adminForm.name.trim() ||
      !adminForm.tokenSymbol.trim() ||
      !Number.isInteger(tokenSupply) ||
      tokenSupply <= 0 ||
      !Number.isInteger(minTokensPerOrder) ||
      minTokensPerOrder <= 0 ||
      tokenPriceCents <= 0 ||
      distributionRateBps < 0
    ) {
      return;
    }

    const nextAsset: TokenizedAsset = {
      id: `asset_custom_${Date.now()}`,
      slug: adminForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: adminForm.name.trim(),
      sponsor: "Studio Issuer",
      category: adminForm.category,
      location: "Demo Market",
      description:
        "Locally created demo asset with simulated issuance, compliance, and ledger behavior.",
      imageUrl: propertyImage,
      tokenSymbol: adminForm.tokenSymbol.trim().toUpperCase().slice(0, 8),
      tokenSupply,
      tokenPriceCents,
      tokensSold: 0,
      minTokensPerOrder,
      maxTokensPerInvestor: Math.max(minTokensPerOrder * 20, minTokensPerOrder),
      acceptedJurisdictions: ["US", "EU", "GB"],
      distributionRateBps,
      riskRating: "medium",
      highlights: [
        "Draft issuance profile",
        "Document review pending",
        "Transfer restrictions enabled"
      ],
      complianceNotes: [
        "Issuer approval required before launch",
        "Investor eligibility rules must be reviewed"
      ],
      documents: [
        {
          id: `doc_${Date.now()}`,
          title: "Draft asset profile",
          kind: "offering_memo",
          updatedAt: new Date().toISOString().slice(0, 10)
        }
      ]
    };

    setAssets((current) => [nextAsset, ...current]);
    setSelectedAssetId(nextAsset.id);
    setViewMode("assets");
    setAdminForm(starterForm);
    setOrderMessage("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <Landmark size={24} />
          </div>
          <div>
            <h1>RWA Token Studio</h1>
            <p>Simulated tokenized asset operations</p>
          </div>
        </div>

        <div className="wallet-chip">
          <Wallet size={18} />
          <span>{formatMoney(investor.cashBalanceCents)}</span>
        </div>
      </header>

      <section className="status-grid" aria-label="Portfolio metrics">
        <MetricTile
          icon={<Building2 size={20} />}
          label="Assets"
          value={assets.length.toLocaleString()}
        />
        <MetricTile
          icon={<Coins size={20} />}
          label="Portfolio"
          value={formatMoney(portfolioValue)}
        />
        <MetricTile
          icon={<ArrowRightLeft size={20} />}
          label="Available Tokens"
          value={totalAvailable.toLocaleString()}
        />
        <MetricTile
          icon={<BarChart3 size={20} />}
          label="Weighted Distribution"
          value={formatBps(averageDistribution)}
        />
      </section>

      <nav className="view-switch" aria-label="Primary views">
        <button
          className={viewMode === "assets" ? "active" : ""}
          type="button"
          onClick={() => setViewMode("assets")}
        >
          <Building2 size={17} />
          Assets
        </button>
        <button
          className={viewMode === "ledger" ? "active" : ""}
          type="button"
          onClick={() => setViewMode("ledger")}
        >
          <FileText size={17} />
          Ledger
        </button>
        <button
          className={viewMode === "admin" ? "active" : ""}
          type="button"
          onClick={() => setViewMode("admin")}
        >
          <Plus size={17} />
          Admin
        </button>
      </nav>

      {viewMode === "assets" && selectedAsset ? (
        <section className="workspace">
          <aside className="asset-list" aria-label="Tokenized assets">
            {assets.map((asset) => (
              <button
                className={`asset-card ${
                  selectedAsset.id === asset.id ? "selected" : ""
                }`}
                key={asset.id}
                type="button"
                onClick={() => {
                  setSelectedAssetId(asset.id);
                  setOrderMessage("");
                }}
              >
                <img src={asset.imageUrl} alt="" />
                <span className={`risk-pill ${riskTone[asset.riskRating]}`}>
                  {asset.riskRating}
                </span>
                <strong>{asset.name}</strong>
                <span>{asset.location}</span>
                <div className="progress-track">
                  <span style={{ width: `${getFundingPercent(asset)}%` }} />
                </div>
                <small>
                  {getFundingPercent(asset).toFixed(1)}% funded ·{" "}
                  {asset.tokenSymbol}
                </small>
              </button>
            ))}
          </aside>

          <AssetDetail
            asset={selectedAsset}
            orderQuantity={orderQuantity}
            orderMessage={orderMessage}
            decisionMessage={
              selectedDecision && !selectedDecision.ok
                ? selectedDecision.message
                : ""
            }
            onOrderQuantityChange={setOrderQuantity}
            onPurchase={handlePurchase}
          />
        </section>
      ) : null}

      {viewMode === "ledger" ? (
        <section className="ledger-panel">
          <div className="panel-heading">
            <h2>Ownership Ledger</h2>
            <span>{ledger.length} entries</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Tokens</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => {
                  const asset = assets.find((item) => item.id === entry.assetId);
                  return (
                    <tr key={entry.id}>
                      <td>{entry.createdAt}</td>
                      <td>{asset?.name ?? entry.assetId}</td>
                      <td>{toTitleCase(entry.type)}</td>
                      <td>{entry.tokens.toLocaleString()}</td>
                      <td>{formatMoney(entry.amountCents)}</td>
                      <td>
                        <span className="status-pill">{entry.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {viewMode === "admin" ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>Asset Setup</h2>
            <span>Local draft</span>
          </div>
          <form className="admin-form" onSubmit={handleCreateAsset}>
            <label>
              Asset Name
              <input
                value={adminForm.name}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Civic Storage Portfolio"
              />
            </label>
            <label>
              Category
              <select
                value={adminForm.category}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    category: event.target.value as AssetCategory
                  }))
                }
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {toTitleCase(category)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Token Symbol
              <input
                value={adminForm.tokenSymbol}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    tokenSymbol: event.target.value
                  }))
                }
                placeholder="CSP"
              />
            </label>
            <label>
              Token Supply
              <input
                inputMode="numeric"
                value={adminForm.tokenSupply}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    tokenSupply: event.target.value
                  }))
                }
              />
            </label>
            <label>
              Token Price
              <input
                inputMode="decimal"
                value={adminForm.tokenPrice}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    tokenPrice: event.target.value
                  }))
                }
              />
            </label>
            <label>
              Minimum Order
              <input
                inputMode="numeric"
                value={adminForm.minOrder}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    minOrder: event.target.value
                  }))
                }
              />
            </label>
            <label>
              Distribution %
              <input
                inputMode="decimal"
                value={adminForm.distributionRate}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    distributionRate: event.target.value
                  }))
                }
              />
            </label>
            <button className="primary-action" type="submit">
              <Plus size={18} />
              Create Draft Asset
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}

function MetricTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-tile">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function AssetDetail({
  asset,
  orderQuantity,
  orderMessage,
  decisionMessage,
  onOrderQuantityChange,
  onPurchase
}: {
  asset: TokenizedAsset;
  orderQuantity: string;
  orderMessage: string;
  decisionMessage: string;
  onOrderQuantityChange: (value: string) => void;
  onPurchase: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className="asset-detail">
      <img className="asset-hero" src={asset.imageUrl} alt="" />
      <div className="detail-body">
        <div className="detail-heading">
          <div>
            <p>{toTitleCase(asset.category)}</p>
            <h2>{asset.name}</h2>
            <span>{asset.sponsor}</span>
          </div>
          <span className={`risk-pill ${riskTone[asset.riskRating]}`}>
            {asset.riskRating} risk
          </span>
        </div>

        <p className="asset-description">{asset.description}</p>

        <div className="metric-strip">
          <div>
            <span>Token Price</span>
            <strong>{formatMoney(asset.tokenPriceCents)}</strong>
          </div>
          <div>
            <span>Minimum</span>
            <strong>{formatMoney(getMinimumInvestmentCents(asset))}</strong>
          </div>
          <div>
            <span>Available</span>
            <strong>{getAvailableTokens(asset).toLocaleString()}</strong>
          </div>
          <div>
            <span>Distribution</span>
            <strong>{formatBps(asset.distributionRateBps)}</strong>
          </div>
        </div>

        <div className="detail-grid">
          <section>
            <h3>Highlights</h3>
            <ul>
              {asset.highlights.map((highlight) => (
                <li key={highlight}>
                  <CheckCircle2 size={16} />
                  {highlight}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Compliance</h3>
            <ul>
              {asset.complianceNotes.map((note) => (
                <li key={note}>
                  <ShieldCheck size={16} />
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="documents-row" aria-label="Documents">
          {asset.documents.map((document) => (
            <span key={document.id}>
              <FileText size={16} />
              {document.title}
            </span>
          ))}
        </section>

        <form className="order-panel" onSubmit={onPurchase}>
          <label>
            Token Quantity
            <input
              inputMode="numeric"
              value={orderQuantity}
              onChange={(event) => onOrderQuantityChange(event.target.value)}
            />
          </label>
          <button className="primary-action" type="submit">
            <Coins size={18} />
            Simulate Purchase
          </button>
          {orderMessage ? (
            <p className="order-message success">{orderMessage}</p>
          ) : null}
          {!orderMessage && decisionMessage ? (
            <p className="order-message warning">
              <AlertTriangle size={16} />
              {decisionMessage}
            </p>
          ) : null}
        </form>
      </div>
    </article>
  );
}

export default App;

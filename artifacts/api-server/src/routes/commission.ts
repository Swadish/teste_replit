import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  activityTable,
  calculationsTable,
  dashboardsTable,
  datasourcesTable,
  paymentRunsTable,
} from "@workspace/db";
import {
  CreateCalculationBody,
  CreateDashboardBody,
  CreateDatasourceBody,
  CreatePaymentRunBody,
  CreateCalculationResponse,
  CreateDashboardResponse,
  CreateDatasourceResponse,
  CreatePaymentRunResponse,
  DeleteCalculationParams,
  DeleteDashboardParams,
  DeleteDatasourceParams,
  ExportPaymentRunParams,
  ExportPaymentRunResponse,
  GetOverviewResponse,
  ListActivityResponse,
  ListCalculationsResponse,
  ListDashboardsResponse,
  ListDatasourcesResponse,
  ListPaymentRunsResponse,
  RunCalculationParams,
  RunCalculationResponse,
  SendPaymentWebhookParams,
  SendPaymentWebhookResponse,
  ShareDashboardBody,
  ShareDashboardParams,
  ShareDashboardResponse,
  SyncDatasourceParams,
  SyncDatasourceResponse,
  UpdateCalculationBody,
  UpdateCalculationParams,
  UpdateCalculationResponse,
  UpdateDashboardBody,
  UpdateDashboardParams,
  UpdateDashboardResponse,
  UpdateDatasourceBody,
  UpdateDatasourceParams,
  UpdateDatasourceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
let seeded = false;

const sampleAccess = [
  { email: "maya@northstar.io", role: "salesperson" },
  { email: "finance@northstar.io", role: "recipient" },
];

async function ensureSeedData(): Promise<void> {
  if (seeded) return;
  const existing = await db.select({ id: datasourcesTable.id }).from(datasourcesTable).limit(1);
  if (existing.length) {
    seeded = true;
    return;
  }

  const now = new Date();
  await db.insert(datasourcesTable).values([
    {
      name: "Northstar Sales CRM",
      type: "api",
      status: "connected",
      rows: 1842,
      lastSync: new Date(now.getTime() - 1000 * 60 * 18),
      source: "Salesforce REST API",
    },
    {
      name: "Q3 commission ledger",
      type: "spreadsheet",
      status: "connected",
      rows: 3291,
      lastSync: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      source: "Google Sheets",
    },
    {
      name: "Partner referrals",
      type: "api",
      status: "needs_attention",
      rows: 694,
      lastSync: new Date(now.getTime() - 1000 * 60 * 60 * 27),
      source: "PartnerStack API",
    },
  ]);

  await db.insert(calculationsTable).values([
    {
      name: "Standard new business",
      description: "10% of closed-won revenue, excluding renewals",
      status: "active",
      formula: "closed_won_revenue * 0.10",
      filters: ["deal_type = new_business", "stage = closed_won"],
      groupBy: ["salesperson", "team"],
      lastRun: new Date(now.getTime() - 1000 * 60 * 42),
      output: "Commission amount",
    },
    {
      name: "Accelerator tiers",
      description: "Progressive rate based on quarterly attainment",
      status: "active",
      formula: "revenue * rate_for(attainment_percent)",
      filters: ["stage = closed_won", "quarter = current"],
      groupBy: ["salesperson", "territory"],
      lastRun: new Date(now.getTime() - 1000 * 60 * 95),
      output: "Payout by recipient",
    },
    {
      name: "Renewal kicker",
      description: "Draft rule for retained account expansions",
      status: "draft",
      formula: "expansion_revenue * 0.04",
      filters: ["deal_type = renewal", "expansion = true"],
      groupBy: ["account_owner"],
      lastRun: null,
      output: "Commission amount",
    },
  ]);

  await db.insert(dashboardsTable).values([
    {
      name: "Leadership overview",
      description: "A clean view of payout liability and team attainment.",
      visibility: "shared",
      audience: "Leadership + finance",
      widgets: ["commission_trend", "team_breakdown", "payout_status"],
      access: sampleAccess,
    },
    {
      name: "My commission",
      description: "Personal attainment, payout history, and next milestone.",
      visibility: "private",
      audience: "Salespeople",
      widgets: ["attainment", "payout_history", "next_milestone"],
      access: [{ email: "maya@northstar.io", role: "salesperson" }],
    },
  ]);

  await db.insert(paymentRunsTable).values([
    {
      period: "Aug 2026",
      calculationId: 1,
      status: "paid",
      amount: 68420,
      recipients: 14,
      exportStatus: "exported",
      webhookStatus: "delivered",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
    },
    {
      period: "Sep 2026",
      calculationId: 2,
      status: "ready",
      amount: 72480,
      recipients: 16,
      exportStatus: "not_exported",
      webhookStatus: "not_sent",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5),
    },
  ]);

  await db.insert(activityTable).values([
    {
      type: "payment",
      title: "September payment run ready",
      detail: "16 recipients · $72,480.00 to review",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5),
    },
    {
      type: "calculation",
      title: "Accelerator tiers completed",
      detail: "5,827 rows processed in 18 seconds",
      createdAt: new Date(now.getTime() - 1000 * 60 * 95),
    },
    {
      type: "sync",
      title: "Northstar Sales CRM synced",
      detail: "1842 rows added · 18 minutes ago",
      createdAt: new Date(now.getTime() - 1000 * 60 * 18),
    },
    {
      type: "share",
      title: "My commission shared",
      detail: "Access granted to Maya Chen",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 22),
    },
  ]);
  seeded = true;
}

async function addActivity(type: string, title: string, detail: string): Promise<void> {
  await db.insert(activityTable).values({ type, title, detail });
}

function parseId(raw: string | string[]): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

router.get("/overview", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const [datasources, payments] = await Promise.all([
    db.select().from(datasourcesTable),
    db.select().from(paymentRunsTable),
  ]);
  const totalCommission = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const dataRows = datasources.reduce((sum, datasource) => sum + datasource.rows, 0);
  const response = {
    totalCommission,
    totalCommissionDelta: 12.8,
    activeSalespeople: 24,
    activeSalespeopleDelta: 8.3,
    pendingPayments: payments
      .filter((payment) => payment.status === "ready")
      .reduce((sum, payment) => sum + payment.amount, 0),
    pendingPaymentsCount: payments.filter((payment) => payment.status === "ready").length,
    dataRows,
    dataRowsDelta: 16.4,
    commissionTrend: [
      { label: "Apr", value: 48100 },
      { label: "May", value: 53200 },
      { label: "Jun", value: 49600 },
      { label: "Jul", value: 61100 },
      { label: "Aug", value: 68420 },
      { label: "Sep", value: 72480 },
    ],
    commissionByTeam: [
      { team: "Enterprise", value: 33800, color: "#4f46e5" },
      { team: "Mid-market", value: 22800, color: "#0ea5a4" },
      { team: "SMB", value: 15880, color: "#f59e0b" },
    ],
  };
  res.json(GetOverviewResponse.parse(response));
});

router.get("/datasources", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(ListDatasourcesResponse.parse(await db.select().from(datasourcesTable).orderBy(desc(datasourcesTable.createdAt))));
});

router.post("/datasources", async (req, res): Promise<void> => {
  const parsed = CreateDatasourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [datasource] = await db.insert(datasourcesTable).values({
    ...parsed.data,
    status: "connected",
    rows: 0,
    lastSync: new Date(),
  }).returning();
  await addActivity("sync", `${datasource.name} connected`, `${datasource.source} is ready to sync`);
  res.status(201).json(CreateDatasourceResponse.parse(datasource));
});

router.patch("/datasources/:id", async (req, res): Promise<void> => {
  const params = UpdateDatasourceParams.safeParse({ id: parseId(req.params.id) });
  const parsed = UpdateDatasourceBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid data source update" });
    return;
  }
  const [datasource] = await db.update(datasourcesTable).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(datasourcesTable.id, params.data.id)).returning();
  if (!datasource) {
    res.status(404).json({ error: "Data source not found" });
    return;
  }
  res.json(UpdateDatasourceResponse.parse(datasource));
});

router.delete("/datasources/:id", async (req, res): Promise<void> => {
  const params = DeleteDatasourceParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid data source id" });
    return;
  }
  const [datasource] = await db.delete(datasourcesTable).where(eq(datasourcesTable.id, params.data.id)).returning();
  if (!datasource) {
    res.status(404).json({ error: "Data source not found" });
    return;
  }
  await addActivity("sync", `${datasource.name} removed`, "The source was removed from this workspace");
  res.status(204).send();
});

router.post("/datasources/:id/sync", async (req, res): Promise<void> => {
  const params = SyncDatasourceParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid data source id" });
    return;
  }
  const [current] = await db.select().from(datasourcesTable).where(eq(datasourcesTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Data source not found" });
    return;
  }
  const [datasource] = await db.update(datasourcesTable).set({
    status: "connected",
    rows: current.rows + (current.type === "api" ? 126 : 84),
    lastSync: new Date(),
    updatedAt: new Date(),
  }).where(eq(datasourcesTable.id, params.data.id)).returning();
  await addActivity("sync", `${datasource.name} synced`, `${datasource.rows.toLocaleString()} rows are now available`);
  res.json(SyncDatasourceResponse.parse(datasource));
});

router.get("/calculations", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(ListCalculationsResponse.parse(await db.select().from(calculationsTable).orderBy(desc(calculationsTable.updatedAt))));
});

router.post("/calculations", async (req, res): Promise<void> => {
  const parsed = CreateCalculationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [calculation] = await db.insert(calculationsTable).values({
    ...parsed.data,
    status: "draft",
    lastRun: null,
  }).returning();
  await addActivity("calculation", `${calculation.name} created`, "New calculation rule saved as a draft");
  res.status(201).json(CreateCalculationResponse.parse(calculation));
});

router.patch("/calculations/:id", async (req, res): Promise<void> => {
  const params = UpdateCalculationParams.safeParse({ id: parseId(req.params.id) });
  const parsed = UpdateCalculationBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid calculation update" });
    return;
  }
  const [calculation] = await db.update(calculationsTable).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(calculationsTable.id, params.data.id)).returning();
  if (!calculation) {
    res.status(404).json({ error: "Calculation not found" });
    return;
  }
  res.json(UpdateCalculationResponse.parse(calculation));
});

router.delete("/calculations/:id", async (req, res): Promise<void> => {
  const params = DeleteCalculationParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid calculation id" });
    return;
  }
  const [calculation] = await db.delete(calculationsTable).where(eq(calculationsTable.id, params.data.id)).returning();
  if (!calculation) {
    res.status(404).json({ error: "Calculation not found" });
    return;
  }
  res.status(204).send();
});

router.post("/calculations/:id/run", async (req, res): Promise<void> => {
  const params = RunCalculationParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid calculation id" });
    return;
  }
  const [calculation] = await db.select().from(calculationsTable).where(eq(calculationsTable.id, params.data.id));
  if (!calculation) {
    res.status(404).json({ error: "Calculation not found" });
    return;
  }
  const sources = await db.select().from(datasourcesTable);
  const rowsProcessed = sources.reduce((sum, datasource) => sum + datasource.rows, 0);
  const completedAt = new Date();
  const totalCommission = Math.round(rowsProcessed * (calculation.id === 2 ? 11.3 : 10.6));
  await db.update(calculationsTable).set({
    status: "active",
    lastRun: completedAt,
    updatedAt: completedAt,
  }).where(eq(calculationsTable.id, calculation.id));
  await addActivity("calculation", `${calculation.name} completed`, `${rowsProcessed.toLocaleString()} rows processed`);
  res.json(RunCalculationResponse.parse({
    calculationId: calculation.id,
    status: "completed",
    rowsProcessed,
    totalCommission,
    completedAt,
  }));
});

router.get("/dashboards", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(ListDashboardsResponse.parse(await db.select().from(dashboardsTable).orderBy(desc(dashboardsTable.updatedAt))));
});

router.post("/dashboards", async (req, res): Promise<void> => {
  const parsed = CreateDashboardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [dashboard] = await db.insert(dashboardsTable).values({
    ...parsed.data,
    access: [],
  }).returning();
  await addActivity("dashboard", `${dashboard.name} created`, "New dashboard is private until shared");
  res.status(201).json(CreateDashboardResponse.parse(dashboard));
});

router.patch("/dashboards/:id", async (req, res): Promise<void> => {
  const params = UpdateDashboardParams.safeParse({ id: parseId(req.params.id) });
  const parsed = UpdateDashboardBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid dashboard update" });
    return;
  }
  const [dashboard] = await db.update(dashboardsTable).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(dashboardsTable.id, params.data.id)).returning();
  if (!dashboard) {
    res.status(404).json({ error: "Dashboard not found" });
    return;
  }
  res.json(UpdateDashboardResponse.parse(dashboard));
});

router.delete("/dashboards/:id", async (req, res): Promise<void> => {
  const params = DeleteDashboardParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid dashboard id" });
    return;
  }
  const [dashboard] = await db.delete(dashboardsTable).where(eq(dashboardsTable.id, params.data.id)).returning();
  if (!dashboard) {
    res.status(404).json({ error: "Dashboard not found" });
    return;
  }
  res.status(204).send();
});

router.post("/dashboards/:id/share", async (req, res): Promise<void> => {
  const params = ShareDashboardParams.safeParse({ id: parseId(req.params.id) });
  const parsed = ShareDashboardBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid dashboard access" });
    return;
  }
  const [current] = await db.select().from(dashboardsTable).where(eq(dashboardsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Dashboard not found" });
    return;
  }
  const access = [
    ...(current.access ?? []).filter((entry: { email: string }) => entry.email !== parsed.data.email),
    parsed.data,
  ];
  const [dashboard] = await db.update(dashboardsTable).set({
    access,
    visibility: current.visibility === "private" ? "shared" : current.visibility,
    updatedAt: new Date(),
  }).where(eq(dashboardsTable.id, params.data.id)).returning();
  await addActivity("share", `${dashboard.name} shared`, `Access granted to ${parsed.data.email}`);
  res.json(ShareDashboardResponse.parse(dashboard));
});

router.get("/payments/runs", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(ListPaymentRunsResponse.parse(await db.select().from(paymentRunsTable).orderBy(desc(paymentRunsTable.createdAt))));
});

router.post("/payments/runs", async (req, res): Promise<void> => {
  const parsed = CreatePaymentRunBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [calculation] = await db.select().from(calculationsTable).where(eq(calculationsTable.id, parsed.data.calculationId));
  if (!calculation) {
    res.status(404).json({ error: "Calculation not found" });
    return;
  }
  const [payment] = await db.insert(paymentRunsTable).values({
    period: parsed.data.period,
    calculationId: parsed.data.calculationId,
    status: "ready",
    amount: 72480,
    recipients: 16,
    exportStatus: "not_exported",
    webhookStatus: "not_sent",
  }).returning();
  await addActivity("payment", `${payment.period} payment run created`, `${payment.recipients} recipients · $${payment.amount.toLocaleString()}`);
  res.status(201).json(CreatePaymentRunResponse.parse(payment));
});

router.post("/payments/runs/:id/export", async (req, res): Promise<void> => {
  const params = ExportPaymentRunParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid payment run id" });
    return;
  }
  const [payment] = await db.update(paymentRunsTable).set({ exportStatus: "exported" }).where(eq(paymentRunsTable.id, params.data.id)).returning();
  if (!payment) {
    res.status(404).json({ error: "Payment run not found" });
    return;
  }
  await addActivity("payment", `${payment.period} CSV exported`, "The payout file is ready to download");
  res.json(ExportPaymentRunResponse.parse(payment));
});

router.post("/payments/runs/:id/webhook", async (req, res): Promise<void> => {
  const params = SendPaymentWebhookParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid payment run id" });
    return;
  }
  const [payment] = await db.update(paymentRunsTable).set({ webhookStatus: "delivered" }).where(eq(paymentRunsTable.id, params.data.id)).returning();
  if (!payment) {
    res.status(404).json({ error: "Payment run not found" });
    return;
  }
  await addActivity("payment", `${payment.period} webhook delivered`, "Payout payload accepted by the destination");
  res.json(SendPaymentWebhookResponse.parse(payment));
});

router.get("/activity", async (_req, res): Promise<void> => {
  await ensureSeedData();
  res.json(ListActivityResponse.parse(await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(8)));
});

export default router;
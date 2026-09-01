import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const datasourcesTable = pgTable("commission_datasources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("connected"),
  rows: integer("rows").notNull().default(0),
  lastSync: timestamp("last_sync", { withTimezone: true }),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const calculationsTable = pgTable("commission_calculations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("draft"),
  formula: text("formula").notNull(),
  filters: text("filters").array().notNull().default([]),
  groupBy: text("group_by").array().notNull().default([]),
  lastRun: timestamp("last_run", { withTimezone: true }),
  output: text("output").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const dashboardsTable = pgTable("commission_dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  visibility: text("visibility").notNull().default("private"),
  audience: text("audience").notNull(),
  widgets: text("widgets").array().notNull().default([]),
  access: jsonb("access").$type<Array<{ email: string; role: string }>>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const paymentRunsTable = pgTable("commission_payment_runs", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(),
  calculationId: integer("calculation_id").notNull(),
  status: text("status").notNull().default("ready"),
  amount: doublePrecision("amount").notNull().default(0),
  recipients: integer("recipients").notNull().default(0),
  exportStatus: text("export_status").notNull().default("not_exported"),
  webhookStatus: text("webhook_status").notNull().default("not_sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityTable = pgTable("commission_activity", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDatasourceSchema = createInsertSchema(datasourcesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCalculationSchema = createInsertSchema(calculationsTable).omit({
  id: true,
  updatedAt: true,
});
export const insertDashboardSchema = createInsertSchema(dashboardsTable).omit({
  id: true,
  updatedAt: true,
});
export const insertPaymentRunSchema = createInsertSchema(paymentRunsTable).omit({
  id: true,
  createdAt: true,
});
export const insertActivitySchema = createInsertSchema(activityTable).omit({
  id: true,
  createdAt: true,
});

export type Datasource = typeof datasourcesTable.$inferSelect;
export type Calculation = typeof calculationsTable.$inferSelect;
export type Dashboard = typeof dashboardsTable.$inferSelect;
export type PaymentRun = typeof paymentRunsTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type InsertDatasource = z.infer<typeof insertDatasourceSchema>;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type InsertPaymentRun = z.infer<typeof insertPaymentRunSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
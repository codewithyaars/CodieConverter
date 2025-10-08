import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status", { enum: ["uploading", "processing", "completed", "failed"] }).notNull().default("uploading"),
  progress: integer("progress").notNull().default(0),
  jsonData: json("json_data"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const updateConversionSchema = createInsertSchema(conversions).partial().omit({
  id: true,
  createdAt: true,
});

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type UpdateConversion = z.infer<typeof updateConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;

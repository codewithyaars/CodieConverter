import { type Conversion, type InsertConversion, type UpdateConversion } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getConversion(id: string): Promise<Conversion | undefined>;
  updateConversion(id: string, updates: UpdateConversion): Promise<Conversion | undefined>;
  getAllConversions(): Promise<Conversion[]>;
}

export class MemStorage implements IStorage {
  private conversions: Map<string, Conversion>;

  constructor() {
    this.conversions = new Map();
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = randomUUID();
    const now = new Date();
    const conversion: Conversion = {
      ...insertConversion,
      id,
      createdAt: now,
      completedAt: null,
      progress: insertConversion.progress ?? 0,
      status: insertConversion.status ?? "uploading",
      jsonData: insertConversion.jsonData ?? null,
      errorMessage: insertConversion.errorMessage ?? null,
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async getConversion(id: string): Promise<Conversion | undefined> {
    return this.conversions.get(id);
  }

  async updateConversion(id: string, updates: UpdateConversion): Promise<Conversion | undefined> {
    const existing = this.conversions.get(id);
    if (!existing) return undefined;

    const updated: Conversion = {
      ...existing,
      ...updates,
      completedAt: updates.status === "completed" || updates.status === "failed" ? new Date() : existing.completedAt,
    };
    
    this.conversions.set(id, updated);
    return updated;
  }

  async getAllConversions(): Promise<Conversion[]> {
    return Array.from(this.conversions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();

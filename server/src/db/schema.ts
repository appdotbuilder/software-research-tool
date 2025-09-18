import { serial, text, pgTable, timestamp, json } from 'drizzle-orm/pg-core';

export const productResearchTable = pgTable('product_research', {
  id: serial('id').primaryKey(),
  product_name: text('product_name').notNull(),
  description: text('description'), // Nullable by default
  advantages: json('advantages').notNull(), // JSON array of advantages
  disadvantages: json('disadvantages').notNull(), // JSON array of disadvantages
  market_analysis: text('market_analysis'), // Nullable detailed analysis
  sources: json('sources').notNull(), // JSON array of source URLs
  research_date: timestamp('research_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type ProductResearch = typeof productResearchTable.$inferSelect; // For SELECT operations
export type NewProductResearch = typeof productResearchTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { 
  productResearch: productResearchTable 
};
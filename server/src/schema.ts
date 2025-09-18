import { z } from 'zod';

// Product research schema
export const productResearchSchema = z.object({
  id: z.number(),
  product_name: z.string(),
  description: z.string().nullable(),
  advantages: z.string().array(), // JSON array of advantages
  disadvantages: z.string().array(), // JSON array of disadvantages
  market_analysis: z.string().nullable(), // Detailed market analysis text
  sources: z.string().array(), // JSON array of source URLs
  research_date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ProductResearch = z.infer<typeof productResearchSchema>;

// Input schema for creating product research
export const createProductResearchInputSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  description: z.string().nullable().optional(),
  advantages: z.string().array().default([]),
  disadvantages: z.string().array().default([]),
  market_analysis: z.string().nullable().optional(),
  sources: z.string().url().array().default([]) // Validate URLs
});

export type CreateProductResearchInput = z.infer<typeof createProductResearchInputSchema>;

// Input schema for updating product research
export const updateProductResearchInputSchema = z.object({
  id: z.number(),
  product_name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  advantages: z.string().array().optional(),
  disadvantages: z.string().array().optional(),
  market_analysis: z.string().nullable().optional(),
  sources: z.string().url().array().optional()
});

export type UpdateProductResearchInput = z.infer<typeof updateProductResearchInputSchema>;

// Search input schema
export const searchProductInputSchema = z.object({
  product_name: z.string().min(1, "Product name is required")
});

export type SearchProductInput = z.infer<typeof searchProductInputSchema>;

// Export format schema
export const exportFormatSchema = z.enum(['json', 'csv', 'pdf']);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

// Export input schema
export const exportResearchInputSchema = z.object({
  research_id: z.number(),
  format: exportFormatSchema
});

export type ExportResearchInput = z.infer<typeof exportResearchInputSchema>;

// Research analysis result schema (for search results)
export const researchAnalysisSchema = z.object({
  product_name: z.string(),
  advantages: z.string().array(),
  disadvantages: z.string().array(),
  market_analysis: z.string().nullable(),
  sources: z.string().array(),
  confidence_score: z.number().min(0).max(1) // Confidence in the analysis
});

export type ResearchAnalysis = z.infer<typeof researchAnalysisSchema>;
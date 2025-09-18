import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { type CreateProductResearchInput, type ProductResearch } from '../schema';

export const saveResearch = async (input: CreateProductResearchInput): Promise<ProductResearch> => {
  try {
    // Insert product research record
    const result = await db.insert(productResearchTable)
      .values({
        product_name: input.product_name,
        description: input.description || null,
        advantages: input.advantages || [], // Ensure array is never null
        disadvantages: input.disadvantages || [], // Ensure array is never null
        market_analysis: input.market_analysis || null,
        sources: input.sources || [], // Ensure array is never null
        research_date: new Date() // Set current date as research date
      })
      .returning()
      .execute();

    // Return the created research record
    const productResearch = result[0];
    return {
      ...productResearch,
      advantages: productResearch.advantages as string[],
      disadvantages: productResearch.disadvantages as string[],
      sources: productResearch.sources as string[]
    };
  } catch (error) {
    console.error('Product research creation failed:', error);
    throw error;
  }
};
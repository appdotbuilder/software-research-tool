import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { type ProductResearch } from '../schema';
import { desc } from 'drizzle-orm';

export const getSavedResearch = async (): Promise<ProductResearch[]> => {
  try {
    // Query all saved research results, ordered by most recent first
    const results = await db.select()
      .from(productResearchTable)
      .orderBy(desc(productResearchTable.created_at))
      .execute();

    // Cast JSON fields to correct types and return results
    return results.map(result => ({
      ...result,
      advantages: result.advantages as string[],
      disadvantages: result.disadvantages as string[],
      sources: result.sources as string[]
    }));
  } catch (error) {
    console.error('Failed to fetch saved research:', error);
    throw error;
  }
};
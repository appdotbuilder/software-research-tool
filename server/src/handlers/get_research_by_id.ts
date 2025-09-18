import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type ProductResearch } from '../schema';

export const getResearchById = async (id: number): Promise<ProductResearch | null> => {
  try {
    // Query the product_research table for the specific ID
    const results = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, id))
      .execute();

    // Return the research result if found, null otherwise
    if (results.length === 0) {
      return null;
    }

    const research = results[0];
    
    // Return the research data with proper type conversion
    return {
      ...research,
      // JSON fields are already properly parsed by Drizzle
      advantages: research.advantages as string[],
      disadvantages: research.disadvantages as string[],
      sources: research.sources as string[]
    };
  } catch (error) {
    console.error('Failed to get research by ID:', error);
    throw error;
  }
};
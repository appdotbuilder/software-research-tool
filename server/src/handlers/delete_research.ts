import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteResearch = async (id: number): Promise<boolean> => {
  try {
    // Check if the research record exists
    const existingResearch = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, id))
      .limit(1)
      .execute();

    // If record doesn't exist, return false
    if (existingResearch.length === 0) {
      return false;
    }

    // Delete the record from the product_research table
    const result = await db.delete(productResearchTable)
      .where(eq(productResearchTable.id, id))
      .returning({ id: productResearchTable.id })
      .execute();

    // Return true if successfully deleted
    return result.length > 0;
  } catch (error) {
    console.error('Research deletion failed:', error);
    throw error;
  }
};
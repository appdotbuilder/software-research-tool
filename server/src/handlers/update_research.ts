import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateProductResearchInput, type ProductResearch } from '../schema';

export const updateResearch = async (input: UpdateProductResearchInput): Promise<ProductResearch | null> => {
  try {
    // First check if the record exists
    const existingRecord = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, input.id))
      .execute();

    if (existingRecord.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof productResearchTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.product_name !== undefined) {
      updateData.product_name = input.product_name;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.advantages !== undefined) {
      updateData.advantages = input.advantages;
    }

    if (input.disadvantages !== undefined) {
      updateData.disadvantages = input.disadvantages;
    }

    if (input.market_analysis !== undefined) {
      updateData.market_analysis = input.market_analysis;
    }

    if (input.sources !== undefined) {
      updateData.sources = input.sources;
    }

    // Update the record
    const result = await db.update(productResearchTable)
      .set(updateData)
      .where(eq(productResearchTable.id, input.id))
      .returning()
      .execute();

    // Convert the result to match the ProductResearch schema
    const updatedRecord = result[0];
    if (!updatedRecord) {
      return null;
    }

    return {
      id: updatedRecord.id,
      product_name: updatedRecord.product_name,
      description: updatedRecord.description,
      advantages: updatedRecord.advantages as string[],
      disadvantages: updatedRecord.disadvantages as string[],
      market_analysis: updatedRecord.market_analysis,
      sources: updatedRecord.sources as string[],
      research_date: updatedRecord.research_date,
      created_at: updatedRecord.created_at,
      updated_at: updatedRecord.updated_at
    };
  } catch (error) {
    console.error('Research update failed:', error);
    throw error;
  }
};
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { deleteResearch } from '../handlers/delete_research';
import { eq } from 'drizzle-orm';

// Test data for creating a research record
const testResearchData = {
  product_name: 'Test Product',
  description: 'A test product for deletion testing',
  advantages: ['Fast', 'Reliable', 'Cost-effective'],
  disadvantages: ['Limited features', 'Small market'],
  market_analysis: 'Strong market potential with growing demand',
  sources: ['https://example.com/source1', 'https://example.com/source2'],
  research_date: new Date('2024-01-15')
};

describe('deleteResearch', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing research record', async () => {
    // Create a test research record first
    const created = await db.insert(productResearchTable)
      .values(testResearchData)
      .returning()
      .execute();

    const researchId = created[0].id;

    // Verify the record exists before deletion
    const beforeDeletion = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, researchId))
      .execute();

    expect(beforeDeletion).toHaveLength(1);

    // Delete the research record
    const result = await deleteResearch(researchId);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify the record no longer exists in the database
    const afterDeletion = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, researchId))
      .execute();

    expect(afterDeletion).toHaveLength(0);
  });

  it('should return false for non-existent research record', async () => {
    // Try to delete a non-existent record
    const nonExistentId = 99999;
    const result = await deleteResearch(nonExistentId);

    // Should return false since record doesn't exist
    expect(result).toBe(false);
  });

  it('should not affect other research records when deleting one', async () => {
    // Create two test research records
    const firstRecord = await db.insert(productResearchTable)
      .values({
        ...testResearchData,
        product_name: 'First Product'
      })
      .returning()
      .execute();

    const secondRecord = await db.insert(productResearchTable)
      .values({
        ...testResearchData,
        product_name: 'Second Product'
      })
      .returning()
      .execute();

    const firstId = firstRecord[0].id;
    const secondId = secondRecord[0].id;

    // Verify both records exist
    const beforeDeletion = await db.select()
      .from(productResearchTable)
      .execute();

    expect(beforeDeletion).toHaveLength(2);

    // Delete only the first record
    const result = await deleteResearch(firstId);
    expect(result).toBe(true);

    // Verify only one record remains and it's the second record
    const afterDeletion = await db.select()
      .from(productResearchTable)
      .execute();

    expect(afterDeletion).toHaveLength(1);
    expect(afterDeletion[0].id).toBe(secondId);
    expect(afterDeletion[0].product_name).toBe('Second Product');
  });

  it('should handle multiple deletion attempts on same record', async () => {
    // Create a test research record
    const created = await db.insert(productResearchTable)
      .values(testResearchData)
      .returning()
      .execute();

    const researchId = created[0].id;

    // First deletion should succeed
    const firstResult = await deleteResearch(researchId);
    expect(firstResult).toBe(true);

    // Second deletion attempt should return false (record no longer exists)
    const secondResult = await deleteResearch(researchId);
    expect(secondResult).toBe(false);

    // Verify the record is still gone
    const afterSecondAttempt = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, researchId))
      .execute();

    expect(afterSecondAttempt).toHaveLength(0);
  });

  it('should handle deletion of record with complex JSON data', async () => {
    // Create a research record with more complex data structures
    const complexData = {
      product_name: 'Complex Product',
      description: 'Product with complex data structures',
      advantages: [
        'Advanced features',
        'Multi-platform support',
        'Strong security',
        'Scalable architecture'
      ],
      disadvantages: [
        'High learning curve',
        'Resource intensive',
        'Complex setup process'
      ],
      market_analysis: 'Comprehensive analysis of market trends, competitor landscape, and growth opportunities in the enterprise software sector.',
      sources: [
        'https://market-research.com/enterprise-software',
        'https://industry-reports.com/2024/tech-trends',
        'https://competitor-analysis.com/product-comparison',
        'https://user-surveys.com/feedback-2024'
      ],
      research_date: new Date('2024-02-20')
    };

    const created = await db.insert(productResearchTable)
      .values(complexData)
      .returning()
      .execute();

    const researchId = created[0].id;

    // Delete the complex record
    const result = await deleteResearch(researchId);
    expect(result).toBe(true);

    // Verify deletion was successful
    const afterDeletion = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, researchId))
      .execute();

    expect(afterDeletion).toHaveLength(0);
  });
});
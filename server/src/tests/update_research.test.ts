import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateProductResearchInput } from '../schema';
import { updateResearch } from '../handlers/update_research';

describe('updateResearch', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testResearchId: number;

  beforeEach(async () => {
    // Create a test research record for each test
    const result = await db.insert(productResearchTable)
      .values({
        product_name: 'Original Product',
        description: 'Original description',
        advantages: ['advantage1', 'advantage2'],
        disadvantages: ['disadvantage1'],
        market_analysis: 'Original market analysis',
        sources: ['https://example.com/source1'],
        research_date: new Date('2024-01-01')
      })
      .returning()
      .execute();
    
    testResearchId = result[0].id;
  });

  it('should update product name only', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      product_name: 'Updated Product Name'
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.id).toBe(testResearchId);
    expect(result!.product_name).toBe('Updated Product Name');
    expect(result!.description).toBe('Original description'); // Should remain unchanged
    expect(result!.advantages).toEqual(['advantage1', 'advantage2']);
    expect(result!.disadvantages).toEqual(['disadvantage1']);
    expect(result!.market_analysis).toBe('Original market analysis');
    expect(result!.sources).toEqual(['https://example.com/source1']);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(result!.created_at.getTime());
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      product_name: 'Multi-Update Product',
      description: 'Updated description',
      advantages: ['new advantage 1', 'new advantage 2', 'new advantage 3'],
      market_analysis: 'Updated market analysis'
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.product_name).toBe('Multi-Update Product');
    expect(result!.description).toBe('Updated description');
    expect(result!.advantages).toEqual(['new advantage 1', 'new advantage 2', 'new advantage 3']);
    expect(result!.disadvantages).toEqual(['disadvantage1']); // Should remain unchanged
    expect(result!.market_analysis).toBe('Updated market analysis');
    expect(result!.sources).toEqual(['https://example.com/source1']); // Should remain unchanged
  });

  it('should update arrays (advantages, disadvantages, sources)', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      advantages: ['updated advantage'],
      disadvantages: ['updated disadvantage 1', 'updated disadvantage 2'],
      sources: ['https://updated.com/source1', 'https://updated.com/source2']
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.product_name).toBe('Original Product'); // Should remain unchanged
    expect(result!.advantages).toEqual(['updated advantage']);
    expect(result!.disadvantages).toEqual(['updated disadvantage 1', 'updated disadvantage 2']);
    expect(result!.sources).toEqual(['https://updated.com/source1', 'https://updated.com/source2']);
  });

  it('should update nullable fields to null', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      description: null,
      market_analysis: null
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.description).toBeNull();
    expect(result!.market_analysis).toBeNull();
    expect(result!.product_name).toBe('Original Product'); // Should remain unchanged
  });

  it('should update empty arrays', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      advantages: [],
      disadvantages: [],
      sources: []
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.advantages).toEqual([]);
    expect(result!.disadvantages).toEqual([]);
    expect(result!.sources).toEqual([]);
  });

  it('should return null for non-existent research', async () => {
    const input: UpdateProductResearchInput = {
      id: 99999, // Non-existent ID
      product_name: 'Should not update'
    };

    const result = await updateResearch(input);
    expect(result).toBeNull();
  });

  it('should update the database record', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      product_name: 'Database Test Product',
      description: 'Database test description'
    };

    await updateResearch(input);

    // Verify the database was updated
    const dbRecord = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, testResearchId))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].product_name).toBe('Database Test Product');
    expect(dbRecord[0].description).toBe('Database test description');
    expect(dbRecord[0].updated_at).toBeInstanceOf(Date);
  });

  it('should always update the updated_at timestamp', async () => {
    // Get original timestamp
    const original = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, testResearchId))
      .execute();
    
    const originalTimestamp = original[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateProductResearchInput = {
      id: testResearchId,
      product_name: 'Timestamp Test'
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });

  it('should handle partial updates correctly', async () => {
    const input: UpdateProductResearchInput = {
      id: testResearchId,
      advantages: ['only updating advantages']
    };

    const result = await updateResearch(input);

    expect(result).toBeDefined();
    expect(result!.advantages).toEqual(['only updating advantages']);
    // Verify other fields remain unchanged
    expect(result!.product_name).toBe('Original Product');
    expect(result!.description).toBe('Original description');
    expect(result!.disadvantages).toEqual(['disadvantage1']);
    expect(result!.market_analysis).toBe('Original market analysis');
    expect(result!.sources).toEqual(['https://example.com/source1']);
  });
});
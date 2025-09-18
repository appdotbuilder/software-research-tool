import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { getSavedResearch } from '../handlers/get_saved_research';

describe('getSavedResearch', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no research exists', async () => {
    const result = await getSavedResearch();

    expect(result).toEqual([]);
  });

  it('should return all saved research records', async () => {
    // Insert first record
    const firstRecord = await db.insert(productResearchTable)
      .values({
        product_name: 'Product A',
        description: 'Description A',
        advantages: ['Advantage 1', 'Advantage 2'],
        disadvantages: ['Disadvantage 1'],
        market_analysis: 'Market analysis A',
        sources: ['https://example.com/source1'],
        research_date: new Date('2023-01-15')
      })
      .returning()
      .execute();

    // Insert second record (will have later created_at due to sequential insertion)
    const secondRecord = await db.insert(productResearchTable)
      .values({
        product_name: 'Product B',
        description: null,
        advantages: ['Advantage B1', 'Advantage B2', 'Advantage B3'],
        disadvantages: ['Disadvantage B1', 'Disadvantage B2'],
        market_analysis: null,
        sources: ['https://example.com/source2', 'https://example.com/source3'],
        research_date: new Date('2023-01-20')
      })
      .returning()
      .execute();

    const result = await getSavedResearch();

    expect(result).toHaveLength(2);
    
    // Verify first record (should be most recent due to ordering by created_at desc)
    expect(result[0].product_name).toEqual('Product B');
    expect(result[0].description).toBeNull();
    expect(result[0].advantages).toEqual(['Advantage B1', 'Advantage B2', 'Advantage B3']);
    expect(result[0].disadvantages).toEqual(['Disadvantage B1', 'Disadvantage B2']);
    expect(result[0].market_analysis).toBeNull();
    expect(result[0].sources).toEqual(['https://example.com/source2', 'https://example.com/source3']);
    expect(result[0].research_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();

    // Verify second record
    expect(result[1].product_name).toEqual('Product A');
    expect(result[1].description).toEqual('Description A');
    expect(result[1].advantages).toEqual(['Advantage 1', 'Advantage 2']);
    expect(result[1].disadvantages).toEqual(['Disadvantage 1']);
    expect(result[1].market_analysis).toEqual('Market analysis A');
    expect(result[1].sources).toEqual(['https://example.com/source1']);

    // Verify ordering - second inserted record should be first in results
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(result[1].created_at.getTime());
  });

  it('should order results by created_at descending (most recent first)', async () => {
    // Insert records with specific creation times
    const now = new Date();
    const older = new Date(now.getTime() - 60000); // 1 minute ago
    const newest = new Date(now.getTime() + 60000); // 1 minute in the future

    // Insert older record first
    await db.insert(productResearchTable)
      .values({
        product_name: 'Older Product',
        advantages: ['Old advantage'],
        disadvantages: ['Old disadvantage'],
        sources: ['https://example.com/old'],
        research_date: older,
        created_at: older,
        updated_at: older
      })
      .execute();

    // Insert newest record
    await db.insert(productResearchTable)
      .values({
        product_name: 'Newest Product',
        advantages: ['New advantage'],
        disadvantages: ['New disadvantage'],
        sources: ['https://example.com/new'],
        research_date: newest,
        created_at: newest,
        updated_at: newest
      })
      .execute();

    // Insert middle record
    await db.insert(productResearchTable)
      .values({
        product_name: 'Middle Product',
        advantages: ['Middle advantage'],
        disadvantages: ['Middle disadvantage'],
        sources: ['https://example.com/middle'],
        research_date: now,
        created_at: now,
        updated_at: now
      })
      .execute();

    const result = await getSavedResearch();

    expect(result).toHaveLength(3);
    expect(result[0].product_name).toEqual('Newest Product');
    expect(result[1].product_name).toEqual('Middle Product');
    expect(result[2].product_name).toEqual('Older Product');

    // Verify ordering is correct by checking timestamps
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeGreaterThan(result[2].created_at.getTime());
  });

  it('should handle JSON arrays correctly', async () => {
    // Test with various JSON array structures
    await db.insert(productResearchTable)
      .values({
        product_name: 'JSON Test Product',
        description: 'Testing JSON arrays',
        advantages: [], // Empty array
        disadvantages: ['Single item'],
        market_analysis: 'Analysis text',
        sources: ['https://source1.com', 'https://source2.com', 'https://source3.com'], // Multiple items
        research_date: new Date()
      })
      .execute();

    const result = await getSavedResearch();

    expect(result).toHaveLength(1);
    expect(result[0].advantages).toEqual([]);
    expect(result[0].disadvantages).toEqual(['Single item']);
    expect(result[0].sources).toEqual(['https://source1.com', 'https://source2.com', 'https://source3.com']);
    expect(Array.isArray(result[0].advantages)).toBe(true);
    expect(Array.isArray(result[0].disadvantages)).toBe(true);
    expect(Array.isArray(result[0].sources)).toBe(true);
  });

  it('should handle null values correctly', async () => {
    await db.insert(productResearchTable)
      .values({
        product_name: 'Minimal Product',
        description: null,
        advantages: ['Some advantage'],
        disadvantages: ['Some disadvantage'],
        market_analysis: null,
        sources: ['https://example.com'],
        research_date: new Date()
      })
      .execute();

    const result = await getSavedResearch();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].market_analysis).toBeNull();
    expect(result[0].product_name).toEqual('Minimal Product');
    expect(result[0].advantages).toEqual(['Some advantage']);
  });
});
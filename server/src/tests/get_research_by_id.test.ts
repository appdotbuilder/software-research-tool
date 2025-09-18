import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { getResearchById } from '../handlers/get_research_by_id';

describe('getResearchById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product research by ID', async () => {
    // Create test research data
    const testData = {
      product_name: 'Test Product',
      description: 'A product for testing',
      advantages: ['Easy to use', 'Cost effective'],
      disadvantages: ['Limited features', 'No support'],
      market_analysis: 'Strong market potential with growing demand',
      sources: ['https://example.com/research1', 'https://example.com/research2'],
      research_date: new Date('2024-01-15')
    };

    // Insert test data
    const insertResult = await db.insert(productResearchTable)
      .values(testData)
      .returning()
      .execute();

    const insertedId = insertResult[0].id;

    // Test the handler
    const result = await getResearchById(insertedId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedId);
    expect(result!.product_name).toBe('Test Product');
    expect(result!.description).toBe('A product for testing');
    expect(result!.advantages).toEqual(['Easy to use', 'Cost effective']);
    expect(result!.disadvantages).toEqual(['Limited features', 'No support']);
    expect(result!.market_analysis).toBe('Strong market potential with growing demand');
    expect(result!.sources).toEqual(['https://example.com/research1', 'https://example.com/research2']);
    expect(result!.research_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent ID', async () => {
    // Test with ID that doesn't exist
    const result = await getResearchById(999999);

    expect(result).toBeNull();
  });

  it('should handle research with null optional fields', async () => {
    // Create test data with null optional fields
    const testData = {
      product_name: 'Minimal Product',
      description: null,
      advantages: ['Basic functionality'],
      disadvantages: [],
      market_analysis: null,
      sources: [],
      research_date: new Date('2024-01-20')
    };

    // Insert test data
    const insertResult = await db.insert(productResearchTable)
      .values(testData)
      .returning()
      .execute();

    const insertedId = insertResult[0].id;

    // Test the handler
    const result = await getResearchById(insertedId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedId);
    expect(result!.product_name).toBe('Minimal Product');
    expect(result!.description).toBeNull();
    expect(result!.advantages).toEqual(['Basic functionality']);
    expect(result!.disadvantages).toEqual([]);
    expect(result!.market_analysis).toBeNull();
    expect(result!.sources).toEqual([]);
    expect(result!.research_date).toBeInstanceOf(Date);
  });

  it('should handle research with comprehensive data', async () => {
    // Create test data with comprehensive information
    const testData = {
      product_name: 'Comprehensive Product Analysis',
      description: 'Detailed product analysis with extensive research',
      advantages: [
        'Market leader in innovation',
        'Strong brand recognition',
        'Excellent customer support',
        'Competitive pricing'
      ],
      disadvantages: [
        'Limited international presence',
        'High dependency on suppliers',
        'Regulatory compliance challenges'
      ],
      market_analysis: `
        The product shows strong potential in the current market landscape.
        Key growth drivers include increasing demand and technological advancement.
        Market size is estimated at $50M with 15% annual growth rate.
        Competitive landscape includes 3 major players with 60% market share.
      `,
      sources: [
        'https://marketresearch.com/analysis/2024',
        'https://industry-report.com/tech-trends',
        'https://financial-times.com/market-outlook',
        'https://techcrunch.com/startup-analysis'
      ],
      research_date: new Date('2024-02-01')
    };

    // Insert test data
    const insertResult = await db.insert(productResearchTable)
      .values(testData)
      .returning()
      .execute();

    const insertedId = insertResult[0].id;

    // Test the handler
    const result = await getResearchById(insertedId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedId);
    expect(result!.product_name).toBe('Comprehensive Product Analysis');
    expect(result!.description).toBe('Detailed product analysis with extensive research');
    expect(result!.advantages).toHaveLength(4);
    expect(result!.advantages).toContain('Market leader in innovation');
    expect(result!.disadvantages).toHaveLength(3);
    expect(result!.disadvantages).toContain('Limited international presence');
    expect(result!.market_analysis).toContain('strong potential');
    expect(result!.sources).toHaveLength(4);
    expect(result!.sources[0]).toBe('https://marketresearch.com/analysis/2024');
    expect(result!.research_date).toEqual(new Date('2024-02-01'));
  });

  it('should verify data types are correct', async () => {
    // Create test data
    const testData = {
      product_name: 'Type Test Product',
      description: 'Testing data types',
      advantages: ['Advantage 1'],
      disadvantages: ['Disadvantage 1'],
      market_analysis: 'Market analysis text',
      sources: ['https://example.com'],
      research_date: new Date()
    };

    // Insert test data
    const insertResult = await db.insert(productResearchTable)
      .values(testData)
      .returning()
      .execute();

    const insertedId = insertResult[0].id;

    // Test the handler
    const result = await getResearchById(insertedId);

    // Verify data types
    expect(result).not.toBeNull();
    expect(typeof result!.id).toBe('number');
    expect(typeof result!.product_name).toBe('string');
    expect(typeof result!.description).toBe('string');
    expect(Array.isArray(result!.advantages)).toBe(true);
    expect(Array.isArray(result!.disadvantages)).toBe(true);
    expect(typeof result!.market_analysis).toBe('string');
    expect(Array.isArray(result!.sources)).toBe(true);
    expect(result!.research_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
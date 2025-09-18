import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { type CreateProductResearchInput } from '../schema';
import { saveResearch } from '../handlers/save_research';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateProductResearchInput = {
  product_name: 'iPhone 15 Pro',
  description: 'Apple flagship smartphone with titanium design',
  advantages: [
    'Titanium construction for durability',
    'Advanced A17 Pro chip',
    'Improved camera system'
  ],
  disadvantages: [
    'High price point',
    'Limited customization options',
    'Battery life could be better'
  ],
  market_analysis: 'The iPhone 15 Pro continues Apple dominance in the premium smartphone segment with 23% market share.',
  sources: [
    'https://www.apple.com/iphone-15-pro',
    'https://www.techcrunch.com/iphone-15-review',
    'https://www.gsmarena.com/apple_iphone_15_pro-12518.php'
  ]
};

// Minimal test input (with defaults)
const minimalInput: CreateProductResearchInput = {
  product_name: 'Basic Product',
  advantages: [],
  disadvantages: [],
  sources: []
};

describe('saveResearch', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should save complete product research', async () => {
    const result = await saveResearch(testInput);

    // Basic field validation
    expect(result.product_name).toEqual('iPhone 15 Pro');
    expect(result.description).toEqual('Apple flagship smartphone with titanium design');
    expect(result.advantages).toEqual([
      'Titanium construction for durability',
      'Advanced A17 Pro chip',
      'Improved camera system'
    ]);
    expect(result.disadvantages).toEqual([
      'High price point',
      'Limited customization options',
      'Battery life could be better'
    ]);
    expect(result.market_analysis).toEqual('The iPhone 15 Pro continues Apple dominance in the premium smartphone segment with 23% market share.');
    expect(result.sources).toEqual([
      'https://www.apple.com/iphone-15-pro',
      'https://www.techcrunch.com/iphone-15-review',
      'https://www.gsmarena.com/apple_iphone_15_pro-12518.php'
    ]);
    
    // Generated field validation
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.research_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save minimal product research with defaults', async () => {
    const result = await saveResearch(minimalInput);

    // Basic field validation
    expect(result.product_name).toEqual('Basic Product');
    expect(result.description).toBeNull();
    expect(result.advantages).toEqual([]);
    expect(result.disadvantages).toEqual([]);
    expect(result.market_analysis).toBeNull();
    expect(result.sources).toEqual([]);
    
    // Generated field validation
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.research_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should persist product research to database', async () => {
    const result = await saveResearch(testInput);

    // Query database to verify persistence
    const savedResearch = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, result.id))
      .execute();

    expect(savedResearch).toHaveLength(1);
    expect(savedResearch[0].product_name).toEqual('iPhone 15 Pro');
    expect(savedResearch[0].description).toEqual('Apple flagship smartphone with titanium design');
    
    // Verify JSON arrays are properly stored
    expect(savedResearch[0].advantages).toEqual([
      'Titanium construction for durability',
      'Advanced A17 Pro chip',
      'Improved camera system'
    ]);
    expect(savedResearch[0].disadvantages).toEqual([
      'High price point',
      'Limited customization options',
      'Battery life could be better'
    ]);
    expect(savedResearch[0].sources).toEqual([
      'https://www.apple.com/iphone-15-pro',
      'https://www.techcrunch.com/iphone-15-review',
      'https://www.gsmarena.com/apple_iphone_15_pro-12518.php'
    ]);
    
    expect(savedResearch[0].market_analysis).toEqual('The iPhone 15 Pro continues Apple dominance in the premium smartphone segment with 23% market share.');
    expect(savedResearch[0].research_date).toBeInstanceOf(Date);
    expect(savedResearch[0].created_at).toBeInstanceOf(Date);
    expect(savedResearch[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty arrays correctly', async () => {
    const inputWithEmptyArrays: CreateProductResearchInput = {
      product_name: 'Empty Arrays Product',
      advantages: [],
      disadvantages: [],
      sources: []
    };

    const result = await saveResearch(inputWithEmptyArrays);

    expect(result.advantages).toEqual([]);
    expect(result.disadvantages).toEqual([]);
    expect(result.sources).toEqual([]);
    
    // Verify in database
    const savedResearch = await db.select()
      .from(productResearchTable)
      .where(eq(productResearchTable.id, result.id))
      .execute();

    expect(savedResearch[0].advantages).toEqual([]);
    expect(savedResearch[0].disadvantages).toEqual([]);
    expect(savedResearch[0].sources).toEqual([]);
  });

  it('should set research_date to current time', async () => {
    const beforeTime = new Date();
    const result = await saveResearch(testInput);
    const afterTime = new Date();

    // Research date should be between before and after times
    expect(result.research_date.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(result.research_date.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  it('should handle special characters in text fields', async () => {
    const specialCharsInput: CreateProductResearchInput = {
      product_name: 'Product with "quotes" & symbols',
      description: 'Description with émojis 🚀 and special chars: @#$%^&*()',
      advantages: ['Advantage with "quotes"', 'Another with symbols: <>?'],
      disadvantages: ['Disadvantage with émojis 📱', 'Unicode test: ñáéíóú'],
      market_analysis: 'Analysis with newlines\nand tabs\t and more special chars',
      sources: ['https://example.com/path?param=value&other=test']
    };

    const result = await saveResearch(specialCharsInput);

    expect(result.product_name).toEqual('Product with "quotes" & symbols');
    expect(result.description).toEqual('Description with émojis 🚀 and special chars: @#$%^&*()');
    expect(result.advantages).toEqual(['Advantage with "quotes"', 'Another with symbols: <>?']);
    expect(result.disadvantages).toEqual(['Disadvantage with émojis 📱', 'Unicode test: ñáéíóú']);
    expect(result.market_analysis).toEqual('Analysis with newlines\nand tabs\t and more special chars');
    expect(result.sources).toEqual(['https://example.com/path?param=value&other=test']);
  });
});
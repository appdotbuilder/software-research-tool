import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type SearchProductInput } from '../schema';
import { searchProduct } from '../handlers/search_product';

describe('searchProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Test input for known product
  const knownProductInput: SearchProductInput = {
    product_name: 'React'
  };

  // Test input for unknown product
  const unknownProductInput: SearchProductInput = {
    product_name: 'SomeUnknownLibrary'
  };

  // Test input for edge cases
  const edgeCaseInput: SearchProductInput = {
    product_name: 'x'
  };

  it('should return detailed analysis for known products', async () => {
    const result = await searchProduct(knownProductInput);

    // Verify basic structure
    expect(result.product_name).toEqual('React');
    expect(Array.isArray(result.advantages)).toBe(true);
    expect(Array.isArray(result.disadvantages)).toBe(true);
    expect(Array.isArray(result.sources)).toBe(true);
    expect(typeof result.market_analysis).toBe('string');
    expect(typeof result.confidence_score).toBe('number');

    // Verify content quality for known products
    expect(result.advantages.length).toBeGreaterThan(3);
    expect(result.disadvantages.length).toBeGreaterThan(3);
    expect(result.sources.length).toBeGreaterThan(2);
    expect(result.market_analysis).toBeTruthy();
    expect(result.market_analysis!.length).toBeGreaterThan(50);
    expect(result.confidence_score).toBeGreaterThan(0.8);

    // Verify advantages contain meaningful content
    expect(result.advantages.some(adv => adv.includes('ecosystem') || adv.includes('community'))).toBe(true);
    
    // Verify sources are valid URLs
    result.sources.forEach(source => {
      expect(source).toMatch(/^https?:\/\/.+/);
    });
  });

  it('should handle case insensitive product names', async () => {
    const lowerCaseResult = await searchProduct({ product_name: 'react' });
    const upperCaseResult = await searchProduct({ product_name: 'REACT' });
    const mixedCaseResult = await searchProduct({ product_name: 'ReAcT' });

    // All should return the same detailed analysis
    expect(lowerCaseResult.advantages).toEqual(upperCaseResult.advantages);
    expect(lowerCaseResult.advantages).toEqual(mixedCaseResult.advantages);
    expect(lowerCaseResult.confidence_score).toEqual(upperCaseResult.confidence_score);
  });

  it('should return generic analysis for unknown products', async () => {
    const result = await searchProduct(unknownProductInput);

    // Verify basic structure
    expect(result.product_name).toEqual('SomeUnknownLibrary');
    expect(Array.isArray(result.advantages)).toBe(true);
    expect(Array.isArray(result.disadvantages)).toBe(true);
    expect(Array.isArray(result.sources)).toBe(true);
    expect(typeof result.market_analysis).toBe('string');
    expect(typeof result.confidence_score).toBe('number');

    // Verify generic content characteristics
    expect(result.advantages.length).toBeGreaterThan(0);
    expect(result.disadvantages.length).toBeGreaterThan(0);
    expect(result.sources.length).toEqual(3);
    expect(result.confidence_score).toBeLessThan(0.8);
    expect(result.confidence_score).toBeGreaterThan(0.1);

    // Verify market analysis mentions limited information
    expect(result.market_analysis).toMatch(/limited.*market.*analysis/i);

    // Verify sources are search URLs
    expect(result.sources[0]).toMatch(/github\.com\/search/);
    expect(result.sources[1]).toMatch(/stackoverflow\.com\/search/);
    expect(result.sources[2]).toMatch(/reddit\.com\/search/);
  });

  it('should handle different known products correctly', async () => {
    const vueResult = await searchProduct({ product_name: 'vue' });
    const angularResult = await searchProduct({ product_name: 'angular' });

    // Both should have detailed analysis
    expect(vueResult.confidence_score).toBeGreaterThan(0.8);
    expect(angularResult.confidence_score).toBeGreaterThan(0.8);

    // Should have different content
    expect(vueResult.advantages).not.toEqual(angularResult.advantages);
    expect(vueResult.market_analysis).not.toEqual(angularResult.market_analysis);

    // Vue should mention beginner-friendly
    expect(vueResult.advantages.some(adv => adv.toLowerCase().includes('beginner') || adv.toLowerCase().includes('learning'))).toBe(true);

    // Angular should mention enterprise
    expect(angularResult.advantages.some(adv => adv.toLowerCase().includes('enterprise'))).toBe(true);
  });

  it('should adjust confidence score based on product name quality', async () => {
    const shortNameResult = await searchProduct({ product_name: 'x' });
    const goodNameResult = await searchProduct({ product_name: 'MyLibrary' });
    const numbericNameResult = await searchProduct({ product_name: 'tool12345' });

    // Short names should have lower confidence
    expect(shortNameResult.confidence_score).toBeLessThan(goodNameResult.confidence_score);

    // Numeric names should have lower confidence
    expect(numbericNameResult.confidence_score).toBeLessThan(goodNameResult.confidence_score);

    // All should be within valid range
    expect(shortNameResult.confidence_score).toBeGreaterThanOrEqual(0.1);
    expect(shortNameResult.confidence_score).toBeLessThanOrEqual(0.8);
    expect(goodNameResult.confidence_score).toBeGreaterThanOrEqual(0.1);
    expect(goodNameResult.confidence_score).toBeLessThanOrEqual(0.8);
  });

  it('should preserve original product name casing in response', async () => {
    const testInput = { product_name: 'MySpecialProduct' };
    const result = await searchProduct(testInput);

    expect(result.product_name).toEqual('MySpecialProduct');
  });

  it('should handle whitespace in product names', async () => {
    const testInput = { product_name: '  react  ' };
    const result = await searchProduct(testInput);

    // Should still match known product after trimming
    expect(result.confidence_score).toBeGreaterThan(0.8);
    expect(result.product_name).toEqual('  react  '); // Original casing preserved
  });

  it('should return valid URL sources for all products', async () => {
    const knownResult = await searchProduct({ product_name: 'react' });
    const unknownResult = await searchProduct({ product_name: 'unknownlib' });

    // Test known product sources
    knownResult.sources.forEach(source => {
      expect(source).toMatch(/^https:\/\/.+\..+/);
      expect(() => new URL(source)).not.toThrow();
    });

    // Test unknown product sources
    unknownResult.sources.forEach(source => {
      expect(source).toMatch(/^https:\/\/.+\..+/);
      expect(() => new URL(source)).not.toThrow();
    });
  });

  it('should handle special characters in product names', async () => {
    const specialCharInput = { product_name: 'my-lib.js' };
    const result = await searchProduct(specialCharInput);

    expect(result.product_name).toEqual('my-lib.js');
    expect(result.confidence_score).toBeGreaterThan(0.1);
    
    // Sources should properly encode special characters
    result.sources.forEach(source => {
      expect(() => new URL(source)).not.toThrow();
    });
  });

  it('should complete within reasonable time', async () => {
    const startTime = Date.now();
    await searchProduct({ product_name: 'test' });
    const endTime = Date.now();
    
    // Should complete within 1 second (accounting for simulated delay)
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
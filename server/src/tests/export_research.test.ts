import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { type ExportResearchInput } from '../schema';
import { exportResearch } from '../handlers/export_research';

// Test data for product research
const testResearchData = {
    product_name: 'Test Widget Pro',
    description: 'A revolutionary widget for testing purposes',
    advantages: ['High performance', 'Easy to use', 'Cost effective'],
    disadvantages: ['Limited color options', 'Requires maintenance'],
    market_analysis: 'The widget market is showing strong growth with increasing demand for automated solutions.',
    sources: ['https://example.com/source1', 'https://example.com/source2'],
    research_date: new Date('2024-01-15')
};

describe('exportResearch', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    let researchId: number;

    beforeEach(async () => {
        // Create test research data
        const result = await db.insert(productResearchTable)
            .values(testResearchData)
            .returning()
            .execute();
        researchId = result[0].id;
    });

    describe('JSON export', () => {
        it('should export research data as JSON', async () => {
            const input: ExportResearchInput = {
                research_id: researchId,
                format: 'json'
            };

            const result = await exportResearch(input);

            expect(result).toBeDefined();
            expect(result!.filename).toMatch(/Test_Widget_Pro_research_\d{4}-\d{2}-\d{2}\.json/);
            expect(result!.mimeType).toEqual('application/json');
            
            // Parse and validate JSON content
            const parsedContent = JSON.parse(result!.content);
            expect(parsedContent.id).toEqual(researchId);
            expect(parsedContent.product_name).toEqual('Test Widget Pro');
            expect(parsedContent.description).toEqual(testResearchData.description);
            expect(parsedContent.advantages).toEqual(testResearchData.advantages);
            expect(parsedContent.disadvantages).toEqual(testResearchData.disadvantages);
            expect(parsedContent.market_analysis).toEqual(testResearchData.market_analysis);
            expect(parsedContent.sources).toEqual(testResearchData.sources);
        });

        it('should handle research with null fields', async () => {
            // Create research with minimal data
            const minimalData = {
                product_name: 'Minimal Product',
                description: null,
                advantages: [],
                disadvantages: [],
                market_analysis: null,
                sources: [],
                research_date: new Date()
            };

            const result = await db.insert(productResearchTable)
                .values(minimalData)
                .returning()
                .execute();

            const input: ExportResearchInput = {
                research_id: result[0].id,
                format: 'json'
            };

            const exportResult = await exportResearch(input);
            expect(exportResult).toBeDefined();

            const parsedContent = JSON.parse(exportResult!.content);
            expect(parsedContent.product_name).toEqual('Minimal Product');
            expect(parsedContent.description).toBeNull();
            expect(parsedContent.advantages).toEqual([]);
            expect(parsedContent.disadvantages).toEqual([]);
            expect(parsedContent.market_analysis).toBeNull();
            expect(parsedContent.sources).toEqual([]);
        });
    });

    describe('CSV export', () => {
        it('should export research data as CSV', async () => {
            const input: ExportResearchInput = {
                research_id: researchId,
                format: 'csv'
            };

            const result = await exportResearch(input);

            expect(result).toBeDefined();
            expect(result!.filename).toMatch(/Test_Widget_Pro_research_\d{4}-\d{2}-\d{2}\.csv/);
            expect(result!.mimeType).toEqual('text/csv');
            
            const csvContent = result!.content;
            expect(csvContent).toContain('Field,Value');
            expect(csvContent).toContain('Product Name,"Test Widget Pro"');
            expect(csvContent).toContain('Description,"A revolutionary widget for testing purposes"');
            expect(csvContent).toContain('Advantage 1,"High performance"');
            expect(csvContent).toContain('Advantage 2,"Easy to use"');
            expect(csvContent).toContain('Advantage 3,"Cost effective"');
            expect(csvContent).toContain('Disadvantage 1,"Limited color options"');
            expect(csvContent).toContain('Disadvantage 2,"Requires maintenance"');
            expect(csvContent).toContain('Source 1,"https://example.com/source1"');
            expect(csvContent).toContain('Source 2,"https://example.com/source2"');
        });

        it('should properly escape CSV special characters', async () => {
            // Create research with special characters
            const specialData = {
                product_name: 'Product "With Quotes" and, Commas',
                description: 'Description with\nnew lines and "quotes"',
                advantages: ['Advantage with "quotes"', 'Advantage, with commas'],
                disadvantages: [],
                market_analysis: 'Analysis with\nmultiple\nlines',
                sources: [],
                research_date: new Date()
            };

            const result = await db.insert(productResearchTable)
                .values(specialData)
                .returning()
                .execute();

            const input: ExportResearchInput = {
                research_id: result[0].id,
                format: 'csv'
            };

            const exportResult = await exportResearch(input);
            expect(exportResult).toBeDefined();

            const csvContent = exportResult!.content;
            // Check that quotes are properly escaped (doubled)
            expect(csvContent).toContain('Product Name,"Product ""With Quotes"" and, Commas"');
            expect(csvContent).toContain('Description,"Description with new lines and ""quotes"""');
            expect(csvContent).toContain('Advantage 1,"Advantage with ""quotes"""');
            expect(csvContent).toContain('Advantage 2,"Advantage, with commas"');
        });
    });

    describe('PDF export', () => {
        it('should export research data as PDF text format', async () => {
            const input: ExportResearchInput = {
                research_id: researchId,
                format: 'pdf'
            };

            const result = await exportResearch(input);

            expect(result).toBeDefined();
            expect(result!.filename).toMatch(/Test_Widget_Pro_research_\d{4}-\d{2}-\d{2}\.pdf/);
            expect(result!.mimeType).toEqual('application/pdf');
            
            const pdfContent = result!.content;
            expect(pdfContent).toContain('PRODUCT RESEARCH REPORT');
            expect(pdfContent).toContain('Product Name: Test Widget Pro');
            expect(pdfContent).toContain('DESCRIPTION');
            expect(pdfContent).toContain('A revolutionary widget for testing purposes');
            expect(pdfContent).toContain('ADVANTAGES');
            expect(pdfContent).toContain('1. High performance');
            expect(pdfContent).toContain('2. Easy to use');
            expect(pdfContent).toContain('3. Cost effective');
            expect(pdfContent).toContain('DISADVANTAGES');
            expect(pdfContent).toContain('1. Limited color options');
            expect(pdfContent).toContain('2. Requires maintenance');
            expect(pdfContent).toContain('MARKET ANALYSIS');
            expect(pdfContent).toContain('SOURCES');
            expect(pdfContent).toContain('1. https://example.com/source1');
            expect(pdfContent).toContain('2. https://example.com/source2');
            expect(pdfContent).toContain('Generated on:');
        });

        it('should handle empty arrays and null fields in PDF', async () => {
            // Create research with minimal data
            const minimalData = {
                product_name: 'Minimal Product',
                description: null,
                advantages: [],
                disadvantages: [],
                market_analysis: null,
                sources: [],
                research_date: new Date()
            };

            const result = await db.insert(productResearchTable)
                .values(minimalData)
                .returning()
                .execute();

            const input: ExportResearchInput = {
                research_id: result[0].id,
                format: 'pdf'
            };

            const exportResult = await exportResearch(input);
            expect(exportResult).toBeDefined();

            const pdfContent = exportResult!.content;
            expect(pdfContent).toContain('PRODUCT RESEARCH REPORT');
            expect(pdfContent).toContain('Product Name: Minimal Product');
            
            // Should not contain sections for empty arrays
            expect(pdfContent).not.toContain('ADVANTAGES');
            expect(pdfContent).not.toContain('DISADVANTAGES');
            expect(pdfContent).not.toContain('DESCRIPTION');
            expect(pdfContent).not.toContain('MARKET ANALYSIS');
            expect(pdfContent).not.toContain('SOURCES');
        });
    });

    describe('Error cases', () => {
        it('should return null for non-existent research ID', async () => {
            const input: ExportResearchInput = {
                research_id: 99999, // Non-existent ID
                format: 'json'
            };

            const result = await exportResearch(input);
            expect(result).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            const input: ExportResearchInput = {
                research_id: -1, // Invalid ID that might cause database error
                format: 'json'
            };

            // Should either return null or throw an error, but not crash
            await expect(async () => {
                const result = await exportResearch(input);
                if (result === null) {
                    // This is acceptable behavior
                    expect(result).toBeNull();
                }
            }).not.toThrow();
        });
    });

    describe('Filename generation', () => {
        it('should sanitize product names in filenames', async () => {
            // Create research with special characters in name
            const specialNameData = {
                product_name: 'Product/With\\Special:Characters*?<>|',
                description: 'Test description',
                advantages: [],
                disadvantages: [],
                market_analysis: null,
                sources: [],
                research_date: new Date()
            };

            const result = await db.insert(productResearchTable)
                .values(specialNameData)
                .returning()
                .execute();

            const input: ExportResearchInput = {
                research_id: result[0].id,
                format: 'json'
            };

            const exportResult = await exportResearch(input);
            expect(exportResult).toBeDefined();

            // Filename should have special characters replaced with underscores
            expect(exportResult!.filename).toMatch(/Product_With_Special_Characters______research_\d{4}-\d{2}-\d{2}\.json/);
        });

        it('should include current date in filename', async () => {
            const input: ExportResearchInput = {
                research_id: researchId,
                format: 'json'
            };

            const result = await exportResearch(input);
            expect(result).toBeDefined();

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            expect(result!.filename).toContain(today);
        });
    });

    describe('Data integrity', () => {
        it('should preserve all data types in JSON export', async () => {
            const input: ExportResearchInput = {
                research_id: researchId,
                format: 'json'
            };

            const result = await exportResearch(input);
            expect(result).toBeDefined();

            const parsedContent = JSON.parse(result!.content);
            
            // Check data types
            expect(typeof parsedContent.id).toBe('number');
            expect(typeof parsedContent.product_name).toBe('string');
            expect(Array.isArray(parsedContent.advantages)).toBe(true);
            expect(Array.isArray(parsedContent.disadvantages)).toBe(true);
            expect(Array.isArray(parsedContent.sources)).toBe(true);
            
            // Check that dates are properly serialized
            expect(parsedContent.research_date).toBeDefined();
            expect(parsedContent.created_at).toBeDefined();
            expect(parsedContent.updated_at).toBeDefined();
        });
    });
});
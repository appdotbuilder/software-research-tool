import { db } from '../db';
import { productResearchTable } from '../db/schema';
import { type ExportResearchInput } from '../schema';
import { eq } from 'drizzle-orm';

export interface ExportResult {
    filename: string;
    content: string;
    mimeType: string;
}

export const exportResearch = async (input: ExportResearchInput): Promise<ExportResult | null> => {
    try {
        // Fetch the research data by ID
        const results = await db.select()
            .from(productResearchTable)
            .where(eq(productResearchTable.id, input.research_id))
            .execute();

        if (results.length === 0) {
            return null; // Research not found
        }

        const research = results[0];

        // Generate filename with current timestamp
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const sanitizedProductName = research.product_name.replace(/[^a-zA-Z0-9]/g, '_');
        
        switch (input.format) {
            case 'json':
                return {
                    filename: `${sanitizedProductName}_research_${timestamp}.json`,
                    content: JSON.stringify({
                        id: research.id,
                        product_name: research.product_name,
                        description: research.description,
                        advantages: research.advantages,
                        disadvantages: research.disadvantages,
                        market_analysis: research.market_analysis,
                        sources: research.sources,
                        research_date: research.research_date,
                        created_at: research.created_at,
                        updated_at: research.updated_at
                    }, null, 2),
                    mimeType: 'application/json'
                };

            case 'csv':
                // Create CSV format with proper escaping
                const csvRows = [];
                
                // Header row
                csvRows.push('Field,Value');
                
                // Add basic fields
                csvRows.push(`Product Name,"${escapeCSV(research.product_name)}"`);
                csvRows.push(`Description,"${escapeCSV(research.description || '')}"`);
                csvRows.push(`Market Analysis,"${escapeCSV(research.market_analysis || '')}"`);
                csvRows.push(`Research Date,"${research.research_date?.toISOString() || ''}"`);
                csvRows.push(`Created At,"${research.created_at?.toISOString() || ''}"`);
                csvRows.push(`Updated At,"${research.updated_at?.toISOString() || ''}"`);
                
                // Add advantages
                const advantages = Array.isArray(research.advantages) ? research.advantages : [];
                advantages.forEach((advantage: string, index: number) => {
                    csvRows.push(`Advantage ${index + 1},"${escapeCSV(advantage)}"`);
                });
                
                // Add disadvantages
                const disadvantages = Array.isArray(research.disadvantages) ? research.disadvantages : [];
                disadvantages.forEach((disadvantage: string, index: number) => {
                    csvRows.push(`Disadvantage ${index + 1},"${escapeCSV(disadvantage)}"`);
                });
                
                // Add sources
                const sources = Array.isArray(research.sources) ? research.sources : [];
                sources.forEach((source: string, index: number) => {
                    csvRows.push(`Source ${index + 1},"${escapeCSV(source)}"`);
                });

                return {
                    filename: `${sanitizedProductName}_research_${timestamp}.csv`,
                    content: csvRows.join('\n'),
                    mimeType: 'text/csv'
                };

            case 'pdf':
                // Generate a simple PDF-like text format
                // In a real implementation, you'd use a PDF library like jsPDF or puppeteer
                const pdfContent = generatePDFContent(research);
                
                return {
                    filename: `${sanitizedProductName}_research_${timestamp}.pdf`,
                    content: pdfContent,
                    mimeType: 'application/pdf'
                };

            default:
                throw new Error(`Unsupported export format: ${input.format}`);
        }
    } catch (error) {
        console.error('Research export failed:', error);
        throw error;
    }
};

// Helper function to escape CSV values
function escapeCSV(value: string): string {
    if (typeof value !== 'string') return '';
    // Escape quotes by doubling them and handle line breaks
    return value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
}

// Helper function to generate PDF-like content
function generatePDFContent(research: any): string {
    const lines = [];
    
    lines.push('PRODUCT RESEARCH REPORT');
    lines.push('========================');
    lines.push('');
    
    lines.push(`Product Name: ${research.product_name}`);
    lines.push(`Research Date: ${research.research_date?.toLocaleDateString() || 'N/A'}`);
    lines.push('');
    
    if (research.description) {
        lines.push('DESCRIPTION');
        lines.push('-----------');
        lines.push(research.description);
        lines.push('');
    }
    
    // Advantages section
    const advantages = Array.isArray(research.advantages) ? research.advantages : [];
    if (advantages.length > 0) {
        lines.push('ADVANTAGES');
        lines.push('----------');
        advantages.forEach((advantage: string, index: number) => {
            lines.push(`${index + 1}. ${advantage}`);
        });
        lines.push('');
    }
    
    // Disadvantages section
    const disadvantages = Array.isArray(research.disadvantages) ? research.disadvantages : [];
    if (disadvantages.length > 0) {
        lines.push('DISADVANTAGES');
        lines.push('-------------');
        disadvantages.forEach((disadvantage: string, index: number) => {
            lines.push(`${index + 1}. ${disadvantage}`);
        });
        lines.push('');
    }
    
    // Market analysis section
    if (research.market_analysis) {
        lines.push('MARKET ANALYSIS');
        lines.push('---------------');
        lines.push(research.market_analysis);
        lines.push('');
    }
    
    // Sources section
    const sources = Array.isArray(research.sources) ? research.sources : [];
    if (sources.length > 0) {
        lines.push('SOURCES');
        lines.push('-------');
        sources.forEach((source: string, index: number) => {
            lines.push(`${index + 1}. ${source}`);
        });
        lines.push('');
    }
    
    lines.push('Generated on: ' + new Date().toLocaleString());
    
    return lines.join('\n');
}
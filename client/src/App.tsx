import './App.css';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductSearchForm } from '@/components/ProductSearchForm';
import { ResearchResultsCard } from '@/components/ResearchResultsCard';
import { SavedResearchList } from '@/components/SavedResearchList';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
// Using type-only imports for proper TypeScript compliance
import type { 
  ProductResearch, 
  CreateProductResearchInput, 
  UpdateProductResearchInput, 
  SearchProductInput, 
  ResearchAnalysis, 
  ExportFormat 
} from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [searchResult, setSearchResult] = useState<ResearchAnalysis | null>(null);
  const [savedResearch, setSavedResearch] = useState<ProductResearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load saved research on component mount
  const loadSavedResearch = useCallback(async () => {
    try {
      const result = await trpc.getSavedResearch.query();
      setSavedResearch(result);
    } catch (error) {
      console.error('Failed to load saved research:', error);
      showAlert('error', 'Failed to load saved research');
    }
  }, []);

  useEffect(() => {
    loadSavedResearch();
  }, [loadSavedResearch]);

  // Show alert messages
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Handle product search
  const handleSearch = async (data: SearchProductInput) => {
    setIsSearching(true);
    try {
      const result = await trpc.searchProduct.mutate(data);
      setSearchResult(result);
      showAlert('success', `Research completed for ${result.product_name}! Confidence: ${(result.confidence_score * 100).toFixed(1)}%`);
    } catch (error) {
      console.error('Search failed:', error);
      showAlert('error', 'Failed to search product. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle saving research
  const handleSave = async (data: CreateProductResearchInput) => {
    setIsSaving(true);
    try {
      const saved = await trpc.saveResearch.mutate(data);
      setSavedResearch((prev: ProductResearch[]) => [...prev, saved]);
      showAlert('success', 'Research saved successfully!');
    } catch (error) {
      console.error('Failed to save research:', error);
      showAlert('error', 'Failed to save research');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle updating research
  const handleUpdate = async (data: UpdateProductResearchInput) => {
    setIsUpdating(true);
    try {
      const updated = await trpc.updateResearch.mutate(data);
      if (updated) {
        setSavedResearch((prev: ProductResearch[]) =>
          prev.map(r => r.id === updated.id ? updated : r)
        );
        showAlert('success', 'Research updated successfully!');
      } else {
        showAlert('error', 'Research not found or could not be updated');
      }
    } catch (error) {
      console.error('Failed to update research:', error);
      showAlert('error', 'Failed to update research');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting research
  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteResearch.mutate({ id });
      setSavedResearch((prev: ProductResearch[]) => prev.filter(r => r.id !== id));
      showAlert('success', 'Research deleted successfully!');
    } catch (error) {
      console.error('Failed to delete research:', error);
      showAlert('error', 'Failed to delete research');
    }
  };

  // Handle export
  const handleExport = async (researchId: number, format: ExportFormat) => {
    setIsExporting(true);
    try {
      const result = await trpc.exportResearch.mutate({
        research_id: researchId,
        format: format
      });
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: format === 'json' ? 'application/json' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_${researchId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showAlert('success', 'Research exported successfully!');
    } catch (error) {
      console.error('Failed to export research:', error);
      showAlert('error', 'Failed to export research');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🔍 Product Research Hub
              </h1>
              <p className="text-gray-600">Discover insights about software products from across the web</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Messages */}
        {alertMessage && (
          <Alert className={`mb-6 animate-fade-in ${alertMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <div className="mb-8">
          <ProductSearchForm onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="mb-8">
            <ResearchResultsCard 
              result={searchResult} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          </div>
        )}

        {/* Saved Research */}
        <SavedResearchList
          research={savedResearch}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onExport={handleExport}
          isUpdating={isUpdating}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}

export default App;
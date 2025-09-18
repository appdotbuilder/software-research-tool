import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Search, Edit, Trash2, Eye, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import type { ProductResearch, CreateProductResearchInput, UpdateProductResearchInput, ExportFormat } from '../../../server/src/schema';

interface SavedResearchListProps {
  research: ProductResearch[];
  onUpdate: (data: UpdateProductResearchInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onExport: (researchId: number, format: ExportFormat) => Promise<void>;
  isUpdating?: boolean;
  isExporting?: boolean;
}

export function SavedResearchList({ 
  research, 
  onUpdate, 
  onDelete, 
  onExport, 
  isUpdating = false, 
  isExporting = false 
}: SavedResearchListProps) {
  const [selectedResearch, setSelectedResearch] = useState<ProductResearch | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [formData, setFormData] = useState<CreateProductResearchInput>({
    product_name: '',
    description: null,
    advantages: [],
    disadvantages: [],
    market_analysis: null,
    sources: []
  });

  const openEditDialog = (researchItem: ProductResearch) => {
    setSelectedResearch(researchItem);
    setFormData({
      product_name: researchItem.product_name,
      description: researchItem.description,
      advantages: researchItem.advantages,
      disadvantages: researchItem.disadvantages,
      market_analysis: researchItem.market_analysis,
      sources: researchItem.sources
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (researchItem: ProductResearch) => {
    setSelectedResearch(researchItem);
    setIsViewDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedResearch) return;
    
    const updateData: UpdateProductResearchInput = {
      id: selectedResearch.id,
      ...formData
    };
    await onUpdate(updateData);
    setIsEditDialogOpen(false);
    setSelectedResearch(null);
  };

  const handleExport = async (researchId: number) => {
    await onExport(researchId, exportFormat);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📚 Saved Research ({research.length})
        </CardTitle>
        <CardDescription>
          Your collection of product research and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {research.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No saved research yet</p>
            <p className="text-gray-400">Search for products above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {research.map((researchItem: ProductResearch) => (
              <Card key={researchItem.id} className="research-card animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {researchItem.product_name}
                      </h3>
                      {researchItem.description && (
                        <p className="text-gray-600 mt-1">{researchItem.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="badge-success">
                          ✅ {researchItem.advantages.length} Advantages
                        </Badge>
                        <Badge variant="outline" className="badge-error">
                          ❌ {researchItem.disadvantages.length} Disadvantages
                        </Badge>
                        <Badge variant="outline" className="badge-info">
                          🔗 {researchItem.sources.length} Sources
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 mobile-stack">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(researchItem)}
                        className="focus-ring"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(researchItem)}
                        className="focus-ring"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(researchItem.id)}
                        disabled={isExporting}
                        className="focus-ring"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 focus-ring">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Research</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the research for "{researchItem.product_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(researchItem.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <Separator />
                  <div className="mt-4 text-sm text-gray-500">
                    Research Date: {researchItem.research_date.toLocaleDateString()} • 
                    Last Updated: {researchItem.updated_at.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Edit Research</DialogTitle>
            <DialogDescription>
              Update the research information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_product_name">Product Name</Label>
              <Input
                id="edit_product_name"
                value={formData.product_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProductResearchInput) => ({ ...prev, product_name: e.target.value }))
                }
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateProductResearchInput) => ({
                    ...prev,
                    description: e.target.value || null
                  }))
                }
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="edit_market_analysis">Market Analysis</Label>
              <Textarea
                id="edit_market_analysis"
                value={formData.market_analysis || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateProductResearchInput) => ({
                    ...prev,
                    market_analysis: e.target.value || null
                  }))
                }
                rows={4}
                className="form-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={isUpdating} className="btn-gradient">
              {isUpdating ? 'Updating...' : 'Update Research'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          {selectedResearch && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedResearch.product_name}</DialogTitle>
                {selectedResearch.description && (
                  <DialogDescription className="text-lg">
                    {selectedResearch.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Advantages ({selectedResearch.advantages.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedResearch.advantages.map((advantage: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-green-800">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Disadvantages ({selectedResearch.disadvantages.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedResearch.disadvantages.map((disadvantage: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-red-800">{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {selectedResearch.market_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="prose text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedResearch.market_analysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Sources ({selectedResearch.sources.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedResearch.sources.length > 0 ? (
                      <div className="space-y-3">
                        {selectedResearch.sources.map((source: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant="outline">{index + 1}</Badge>
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline flex-1 break-all"
                            >
                              {source}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No sources available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
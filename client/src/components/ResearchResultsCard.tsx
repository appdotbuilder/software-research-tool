import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import type { ResearchAnalysis, CreateProductResearchInput } from '../../../server/src/schema';

interface ResearchResultsCardProps {
  result: ResearchAnalysis;
  onSave: (data: CreateProductResearchInput) => Promise<void>;
  isSaving?: boolean;
}

export function ResearchResultsCard({ result, onSave, isSaving = false }: ResearchResultsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductResearchInput>({
    product_name: result.product_name,
    description: null,
    advantages: result.advantages,
    disadvantages: result.disadvantages,
    market_analysis: result.market_analysis,
    sources: result.sources
  });

  const handleSave = async () => {
    await onSave(formData);
    setIsDialogOpen(false);
  };

  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm search-result-enter">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              🎯 {result.product_name}
            </CardTitle>
            <CardDescription>
              Analysis Confidence: <Badge variant="outline" className="ml-1 badge-success">
                {(result.confidence_score * 100).toFixed(1)}%
              </Badge>
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Research
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle>Save Research Results</DialogTitle>
                <DialogDescription>
                  Review and modify the research data before saving
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateProductResearchInput) => ({ ...prev, product_name: e.target.value }))
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData((prev: CreateProductResearchInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    placeholder="Add a custom description..."
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="market_analysis">Market Analysis</Label>
                  <Textarea
                    id="market_analysis"
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
                <Button onClick={handleSave} disabled={isSaving} className="btn-gradient">
                  {isSaving ? 'Saving...' : 'Save Research'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="market">Market Insights</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50 card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Advantages ({result.advantages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.advantages.length > 0 ? (
                    <ul className="space-y-2">
                      {result.advantages.map((advantage: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 animate-slide-in">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 italic">No advantages found</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Disadvantages ({result.disadvantages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.disadvantages.length > 0 ? (
                    <ul className="space-y-2">
                      {result.disadvantages.map((disadvantage: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 animate-slide-in">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-red-800">{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 italic">No disadvantages found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <Card className="card-hover">
              <CardContent className="pt-6">
                {result.market_analysis ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {result.market_analysis}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No market analysis available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="card-hover">
              <CardContent className="pt-6">
                {result.sources.length > 0 ? (
                  <div className="space-y-3">
                    {result.sources.map((source: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Badge variant="outline">{index + 1}</Badge>
                        <a 
                          href={source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex-1 break-all transition-colors"
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
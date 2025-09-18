import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { SearchProductInput } from '../../../server/src/schema';

interface ProductSearchFormProps {
  onSearch: (data: SearchProductInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProductSearchForm({ onSearch, isLoading = false }: ProductSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    await onSearch({ product_name: searchQuery });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Search Software Products
        </CardTitle>
        <CardDescription>
          Enter a software product name to get comprehensive market analysis and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="e.g., Visual Studio Code, Slack, Docker..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1 form-input"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !searchQuery.trim()} 
            className="btn-gradient"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Research
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
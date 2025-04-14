
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { FilterSidebar } from '@/components/FilterSidebar';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sidebarFilters: any;
  onFilterChange: (filters: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sidebarFilters,
  onFilterChange,
  onApplyFilters,
  onResetFilters
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <h1 className="text-2xl font-bold">Find Your Roommate</h1>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, company..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:max-w-sm">
            <FilterSidebar 
              filters={sidebarFilters} 
              onFilterChange={onFilterChange}
              onApplyFilters={onApplyFilters}
              onResetFilters={onResetFilters}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

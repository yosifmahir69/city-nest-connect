
import React from 'react';
import { Button } from '@/components/ui/button';
import { RoommateFilters } from '@/hooks/useRoommates';

interface ActiveFiltersProps {
  filters: RoommateFilters;
  onFilterChange: (filters: Partial<RoommateFilters>) => void;
  onResetFilters: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const hasActiveFilters = 
    filters.gender.length > 0 || 
    filters.company.length > 0 || 
    filters.neighborhood.length > 0 || 
    filters.lifestyleTags.length > 0 || 
    filters.hasCar !== null;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      {filters.gender.length > 0 && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFilterChange({ gender: [] })}>
          Gender: {filters.gender.join(', ')} ×
        </Button>
      )}
      {filters.company.length > 0 && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFilterChange({ company: [] })}>
          Company: {filters.company.join(', ')} ×
        </Button>
      )}
      {filters.neighborhood.length > 0 && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFilterChange({ neighborhood: [] })}>
          Neighborhoods: {filters.neighborhood.length} selected ×
        </Button>
      )}
      {filters.lifestyleTags.length > 0 && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFilterChange({ lifestyleTags: [] })}>
          Lifestyle: {filters.lifestyleTags.length} selected ×
        </Button>
      )}
      {filters.hasCar !== null && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFilterChange({ hasCar: null })}>
          Car: {filters.hasCar ? 'Yes' : 'No'} ×
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onResetFilters}>
        Clear all
      </Button>
    </div>
  );
};

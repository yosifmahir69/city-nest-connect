
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FilterSidebar } from '@/components/FilterSidebar';
import { useRoommates } from '@/hooks/useRoommates';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ActiveFilters } from '@/components/dashboard/ActiveFilters';
import { RoommateResults } from '@/components/dashboard/RoommateResults';

interface SidebarFilterState {
  gender: string[];
  company: string[];
  officeLocation: string[];
  neighborhood: string[];
  budgetMin: number;
  budgetMax: number;
  hasCar: boolean;
  lifestyleTags: string[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const {
    roommates,
    isLoading,
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    applyFilters,
    resetFilters
  } = useRoommates(user?.id);

  const convertToSidebarFilters = (): SidebarFilterState => {
    return {
      gender: filters.gender,
      company: filters.company,
      officeLocation: filters.officeLocation,
      neighborhood: filters.neighborhood,
      budgetMin: filters.budgetMin,
      budgetMax: filters.budgetMax,
      hasCar: filters.hasCar === null ? false : filters.hasCar,
      lifestyleTags: filters.lifestyleTags
    };
  };

  const handleSidebarFilterChange = (sidebarFilters: Partial<SidebarFilterState>) => {
    const updatedFilters = {
      ...sidebarFilters,
    };
    handleFilterChange(updatedFilters);
  };

  const sidebarFilters = convertToSidebarFilters();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block w-80 border-r border-gray-200 overflow-y-auto">
        <FilterSidebar 
          filters={sidebarFilters} 
          onFilterChange={handleSidebarFilterChange}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sidebarFilters={sidebarFilters}
            onFilterChange={handleSidebarFilterChange}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
          />

          <ActiveFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onResetFilters={resetFilters}
          />

          <RoommateResults 
            isLoading={isLoading} 
            roommates={roommates} 
            onResetFilters={resetFilters} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

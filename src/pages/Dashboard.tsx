import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoommateCard } from '@/components/RoommateCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { User } from '@/types';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getRoommates } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FilterState {
  gender: string[];
  company: string[];
  officeLocation: string[];
  neighborhood: string[];
  budgetMin: number;
  budgetMax: number;
  hasCar: boolean | null;
  lifestyleTags: string[];
}

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    company: [],
    officeLocation: [],
    neighborhood: [],
    budgetMin: 500,
    budgetMax: 5000,
    hasCar: null,
    lifestyleTags: []
  });
  const [roommates, setRoommates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoommates = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching roommates with filters:', filters);
      
      const { data, error } = await getRoommates(filters);
      
      if (error) {
        throw error;
      }
      
      console.log('Roommates data from server:', data);
      
      let filteredData = data || [];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(roommate => 
          roommate.fullName?.toLowerCase().includes(query) ||
          roommate.company?.toLowerCase().includes(query) ||
          roommate.officeLocation?.toLowerCase().includes(query)
        );
      }
      
      setRoommates(filteredData);
    } catch (error: any) {
      console.error('Error fetching roommates:', error);
      toast({
        title: "Error",
        description: "Failed to load roommates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("Dashboard mounted, fetching roommates");
      fetchRoommates();
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchRoommates();
    }
  }, [searchQuery]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const convertToSidebarFilters = (filters: FilterState): SidebarFilterState => {
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
    const updatedFilters: Partial<FilterState> = {
      ...sidebarFilters,
    };
    handleFilterChange(updatedFilters);
  };

  const applyFilters = () => {
    fetchRoommates();
  };

  const resetFilters = () => {
    setFilters({
      gender: [],
      company: [],
      officeLocation: [],
      neighborhood: [],
      budgetMin: 500,
      budgetMax: 5000,
      hasCar: null,
      lifestyleTags: []
    });
    fetchRoommates();
  };

  const sidebarFilters = convertToSidebarFilters(filters);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold">Find Your Roommate</h1>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, company..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    onFilterChange={handleSidebarFilterChange}
                    onApplyFilters={applyFilters}
                    onResetFilters={resetFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {(filters.gender.length > 0 || 
            filters.company.length > 0 || 
            filters.neighborhood.length > 0 || 
            filters.lifestyleTags.length > 0 || 
            filters.hasCar !== null) && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {filters.gender.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFilterChange({ gender: [] })}>
                  Gender: {filters.gender.join(', ')} ×
                </Button>
              )}
              {filters.company.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFilterChange({ company: [] })}>
                  Company: {filters.company.join(', ')} ×
                </Button>
              )}
              {filters.neighborhood.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFilterChange({ neighborhood: [] })}>
                  Neighborhoods: {filters.neighborhood.length} selected ×
                </Button>
              )}
              {filters.lifestyleTags.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFilterChange({ lifestyleTags: [] })}>
                  Lifestyle: {filters.lifestyleTags.length} selected ×
                </Button>
              )}
              {filters.hasCar !== null && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFilterChange({ hasCar: null })}>
                  Car: {filters.hasCar ? 'Yes' : 'No'} ×
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                Clear all
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roommate-blue"></div>
            </div>
          ) : roommates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roommates.map((roommate) => (
                <RoommateCard key={roommate.id} roommate={roommate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl font-medium text-gray-600">No roommates found matching your criteria</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
              <Button className="mt-4" onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

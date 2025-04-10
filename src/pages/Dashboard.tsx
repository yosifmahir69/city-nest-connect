
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoommateCard } from '@/components/RoommateCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { User } from '@/types';
import { Search, Filter, Sliders } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getRoommates } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Placeholder data until Supabase integration
const SAMPLE_ROOMMATES: User[] = [
  {
    id: '1',
    email: 'alex@example.com',
    fullName: 'Alex Johnson',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    jobType: 'internship',
    company: 'Google',
    officeLocation: 'Google – NYC 111 8th Ave',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    gender: 'male',
    preferredRoommateGenders: ['male', 'female'],
    hasCar: true,
    preferredNeighborhoods: ['Chelsea', 'West Village'],
    budgetMin: 1200,
    budgetMax: 2000,
    lifestyleTags: ['Gym enthusiast', 'Early bird', 'Tech', 'Clean'],
    firstTimeInCity: true,
    additionalPreferences: ['Private bathroom', 'In-unit laundry'],
    createdAt: '2025-04-01',
    updatedAt: '2025-04-01'
  },
  {
    id: '2',
    email: 'maya@example.com',
    fullName: 'Maya Rodriguez',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    jobType: 'fulltime',
    company: 'Amazon',
    officeLocation: 'Amazon – NYC 7 W 34th St',
    startDate: '2025-07-15',
    gender: 'female',
    preferredRoommateGenders: ['female'],
    hasCar: false,
    preferredNeighborhoods: ['Midtown', 'Upper East Side'],
    budgetMin: 1500,
    budgetMax: 2500,
    lifestyleTags: ['Social', 'Music', 'Travel', 'Non-smoker'],
    firstTimeInCity: false,
    additionalPreferences: ['Near subway', 'Pet-friendly building'],
    createdAt: '2025-04-02',
    updatedAt: '2025-04-02'
  },
  {
    id: '3',
    email: 'tyler@example.com',
    fullName: 'Tyler Chang',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    jobType: 'internship',
    company: 'Microsoft',
    officeLocation: 'Microsoft – NYC 11 Times Square',
    startDate: '2025-05-15',
    endDate: '2025-08-15',
    gender: 'male',
    preferredRoommateGenders: ['male'],
    hasCar: false,
    preferredNeighborhoods: ['Financial District', 'Brooklyn'],
    budgetMin: 1000,
    budgetMax: 1800,
    lifestyleTags: ['Night owl', 'Tech', 'Reading', 'Outdoors'],
    firstTimeInCity: true,
    additionalPreferences: ['Furnished apartment', 'Utilities included'],
    createdAt: '2025-04-03',
    updatedAt: '2025-04-03'
  },
  {
    id: '4',
    email: 'jordan@example.com',
    fullName: 'Jordan Smith',
    profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
    jobType: 'fulltime',
    company: 'Facebook',
    officeLocation: 'Facebook – NYC 770 Broadway',
    startDate: '2025-06-01',
    gender: 'nonbinary',
    preferredRoommateGenders: ['male', 'female', 'nonbinary', 'other'],
    hasCar: true,
    preferredNeighborhoods: ['East Village', 'Brooklyn'],
    budgetMin: 1300,
    budgetMax: 2200,
    lifestyleTags: ['Vegetarian', 'Arts', 'Social', 'Non-drinker'],
    firstTimeInCity: false,
    additionalPreferences: ['Quiet building', 'Outdoor space'],
    createdAt: '2025-04-04',
    updatedAt: '2025-04-04'
  }
];

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
  const [roommates, setRoommates] = useState<User[]>(SAMPLE_ROOMMATES);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch roommates with filters after Supabase integration
  const fetchRoommates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getRoommates(filters);
      
      if (error) {
        throw error;
      }
      
      // For now, we'll filter the sample data based on search query
      let filteredData = SAMPLE_ROOMMATES;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(roommate => 
          roommate.fullName.toLowerCase().includes(query) ||
          roommate.company.toLowerCase().includes(query) ||
          roommate.officeLocation.toLowerCase().includes(query)
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

  // Call fetchRoommates when filters or search query changes
  React.useEffect(() => {
    fetchRoommates();
  }, [searchQuery]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-200 overflow-y-auto">
        <FilterSidebar 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Main Content */}
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
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:max-w-sm">
                  <FilterSidebar 
                    filters={filters} 
                    onFilterChange={handleFilterChange}
                    onApplyFilters={applyFilters}
                    onResetFilters={resetFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(filter => 
            Array.isArray(filter) ? filter.length > 0 : filter !== null
          ) && (
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

          {/* Roommate Cards */}
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

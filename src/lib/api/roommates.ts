
import { supabase } from '@/integrations/supabase/client';
import { RoommateFilters, RPCFunctions } from '../db-types';

// Function to get roommates with optional filters
export async function getRoommates(filters: RoommateFilters = {}) {
  try {
    console.log('Fetching roommates with filters:', filters);
    
    // Call the get_roommates RPC function
    const { data, error } = await supabase.rpc<
      RPCFunctions['get_roommates']['Returns'],
      RPCFunctions['get_roommates']['Args']
    >('get_roommates');
    
    if (error) {
      throw error;
    }
    
    // Apply client-side filtering based on the provided filters
    let filteredData = data || [];
    
    // Filter by gender if specified
    if (filters.gender && filters.gender.length > 0) {
      filteredData = filteredData.filter(roommate => 
        filters.gender!.includes(roommate.gender)
      );
    }
    
    // Filter by company if specified
    if (filters.company && filters.company.length > 0) {
      filteredData = filteredData.filter(roommate => 
        filters.company!.includes(roommate.company)
      );
    }
    
    // Filter by officeLocation if specified
    if (filters.officeLocation && filters.officeLocation.length > 0) {
      filteredData = filteredData.filter(roommate => 
        filters.officeLocation!.includes(roommate.officeLocation)
      );
    }
    
    // Filter by neighborhood if specified
    if (filters.neighborhood && filters.neighborhood.length > 0) {
      filteredData = filteredData.filter(roommate => 
        roommate.preferredNeighborhoods.some(n => 
          filters.neighborhood!.includes(n)
        )
      );
    }
    
    // Filter by budget range
    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      filteredData = filteredData.filter(roommate => {
        if (filters.budgetMin !== undefined && roommate.budgetMax < filters.budgetMin) {
          return false;
        }
        if (filters.budgetMax !== undefined && roommate.budgetMin > filters.budgetMax) {
          return false;
        }
        return true;
      });
    }
    
    // Filter by car ownership
    if (filters.hasCar !== null && filters.hasCar !== undefined) {
      filteredData = filteredData.filter(roommate => 
        roommate.hasCar === filters.hasCar
      );
    }
    
    // Filter by lifestyle tags
    if (filters.lifestyleTags && filters.lifestyleTags.length > 0) {
      filteredData = filteredData.filter(roommate => 
        roommate.lifestyleTags.some(tag => 
          filters.lifestyleTags!.includes(tag)
        )
      );
    }
    
    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}

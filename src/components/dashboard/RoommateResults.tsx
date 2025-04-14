
import React from 'react';
import { RoommateCard } from '@/components/RoommateCard';
import { User } from '@/types';

interface RoommateResultsProps {
  isLoading: boolean;
  roommates: User[];
}

export const RoommateResults: React.FC<RoommateResultsProps> = ({
  isLoading,
  roommates
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roommate-blue"></div>
      </div>
    );
  }

  if (roommates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-medium text-gray-600">No roommates found</p>
        <p className="text-gray-500 mt-2">Check back later for more potential roommates</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roommates.map((roommate) => (
        <RoommateCard key={roommate.id} roommate={roommate} />
      ))}
    </div>
  );
};

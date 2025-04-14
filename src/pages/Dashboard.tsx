
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoommates } from '@/hooks/useRoommates';
import { RoommateResults } from '@/components/dashboard/RoommateResults';

const Dashboard = () => {
  const { user } = useAuth();
  const { roommates, isLoading } = useRoommates(user?.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Find Your Roommate</h1>
      <RoommateResults 
        isLoading={isLoading} 
        roommates={roommates} 
      />
    </div>
  );
};

export default Dashboard;

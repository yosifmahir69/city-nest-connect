
import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import UserTable from './UserTable';

interface UserManagementProps {
  users: User[];
  userSearch: string;
  setUserSearch: (value: string) => void;
}

const UserManagement = ({ users, userSearch, setUserSearch }: UserManagementProps) => {
  const filteredUsers = users.filter(user => {
    const searchLower = userSearch.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.company.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and search all registered users</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-full sm:w-64"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UserTable users={filteredUsers} />
      </CardContent>
    </Card>
  );
};

export default UserManagement;

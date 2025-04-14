
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, InviteCode } from '@/types';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Users, Key } from 'lucide-react';
import { getInviteCodes } from '@/lib/api/admin';
import { getAllUsers } from '@/lib/api/profiles';
import UserManagement from '@/components/admin/UserManagement';
import InviteCodeManagement from '@/components/admin/InviteCodeManagement';
import AccessDenied from '@/components/admin/AccessDenied';

// Sample data until Supabase integration is complete
import { SAMPLE_USERS, SAMPLE_INVITE_CODES } from './AdminSampleData';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(SAMPLE_INVITE_CODES);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Fetch users and invite codes
    const fetchData = async () => {
      try {
        const [usersResponse, codesResponse] = await Promise.all([
          getAllUsers(),
          getInviteCodes()
        ]);
        
        if (usersResponse.error) {
          throw usersResponse.error;
        }
        
        if (codesResponse.error) {
          throw codesResponse.error;
        }
        
        // For now, use sample data
        setUsers(SAMPLE_USERS);
        setInviteCodes(SAMPLE_INVITE_CODES);
      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, []);

  // Admin access check would go here in a real app
  const isAdmin = true; // This would be a real check in production

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage users and invite codes</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="invites">
              <Key className="h-4 w-4 mr-2" />
              Invite Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement 
              users={users} 
              userSearch={userSearch} 
              setUserSearch={setUserSearch}
            />
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <InviteCodeManagement 
              inviteCodes={inviteCodes} 
              setInviteCodes={setInviteCodes}
              userId={user?.id || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { User, InviteCode } from '@/types';
import { generateInviteCode, getInviteCodes } from '@/lib/api/admin';
import { getAllUsers } from '@/lib/api/profiles';
import { Copy, Users, Key, Search, ClipboardCopy, CheckCircle2 } from 'lucide-react';

// Sample data until Supabase integration
const SAMPLE_USERS: User[] = [
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

const SAMPLE_INVITE_CODES: InviteCode[] = [
  {
    id: '1',
    code: 'ROOMMATE-NYC-2025',
    createdBy: 'admin',
    createdAt: '2025-03-15T10:00:00Z',
    usedBy: 'alex@example.com',
    usedAt: '2025-04-01T14:30:00Z'
  },
  {
    id: '2',
    code: 'GOOGLE-SUMMER',
    createdBy: 'admin',
    createdAt: '2025-03-20T11:15:00Z',
    usedBy: 'tyler@example.com',
    usedAt: '2025-04-03T09:45:00Z'
  },
  {
    id: '3',
    code: 'AMAZON-NEWGRAD',
    createdBy: 'admin',
    createdAt: '2025-03-25T15:30:00Z',
    usedBy: 'maya@example.com',
    usedAt: '2025-04-02T16:20:00Z'
  },
  {
    id: '4',
    code: 'FB-NYC-2025',
    createdBy: 'admin',
    createdAt: '2025-04-01T09:00:00Z',
    usedBy: 'jordan@example.com',
    usedAt: '2025-04-04T11:10:00Z'
  },
  {
    id: '5',
    code: 'SUMMER-NYC-2025',
    createdBy: 'admin',
    createdAt: '2025-04-05T14:45:00Z'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(SAMPLE_INVITE_CODES);
  const [userSearch, setUserSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
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

  const handleGenerateInviteCode = async () => {
    if (!user) return;
    
    try {
      setIsGeneratingCode(true);
      const { data, error } = await generateInviteCode(user.id);
      
      if (error) {
        throw error;
      }
      
      // For now, generate a mock invite code
      const newCode: InviteCode = {
        id: `${Date.now()}`,
        code: `NYC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      };
      
      setInviteCodes(prev => [newCode, ...prev]);
      
      toast({
        title: "Invite Code Generated",
        description: "New invite code has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast({
        title: "Error",
        description: "Failed to generate invite code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
    
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = userSearch.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.company.toLowerCase().includes(searchLower)
    );
  });

  const filteredInviteCodes = inviteCodes.filter(code => {
    const searchLower = codeSearch.toLowerCase();
    return (
      code.code.toLowerCase().includes(searchLower) ||
      (code.usedBy && code.usedBy.toLowerCase().includes(searchLower))
    );
  });

  // Admin access check would go here in a real app
  const isAdmin = true; // This would be a real check in production

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead className="text-right">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                                  <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.company}</TableCell>
                            <TableCell>
                              <Badge variant={user.jobType === 'internship' ? 'outline' : 'default'}>
                                {user.jobType === 'internship' ? 'Intern' : 'Full-time'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>${user.budgetMin} - ${user.budgetMax}</TableCell>
                            <TableCell className="text-right">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                            No users found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Invite Codes</CardTitle>
                    <CardDescription>Manage invite codes for new users</CardDescription>
                  </div>
                  <Button onClick={handleGenerateInviteCode} disabled={isGeneratingCode}>
                    {isGeneratingCode ? 'Generating...' : 'Generate New Code'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search invite codes..."
                      className="pl-8"
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInviteCodes.length > 0 ? (
                        filteredInviteCodes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell className="font-mono">{code.code}</TableCell>
                            <TableCell>{new Date(code.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={code.usedBy ? 'default' : 'outline'}>
                                {code.usedBy ? 'Used' : 'Available'}
                              </Badge>
                            </TableCell>
                            <TableCell>{code.usedBy || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(code.code, code.id)}
                                disabled={!!code.usedBy}
                              >
                                {copiedCodeId === code.id ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ClipboardCopy className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No invite codes found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

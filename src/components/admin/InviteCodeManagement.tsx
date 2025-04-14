
import React, { useState } from 'react';
import { InviteCode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateInviteCode } from '@/lib/api/admin';
import InviteCodeTable from './InviteCodeTable';

interface InviteCodeManagementProps {
  inviteCodes: InviteCode[];
  setInviteCodes: React.Dispatch<React.SetStateAction<InviteCode[]>>;
  userId: string;
}

const InviteCodeManagement = ({ inviteCodes, setInviteCodes, userId }: InviteCodeManagementProps) => {
  const { toast } = useToast();
  const [codeSearch, setCodeSearch] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGenerateInviteCode = async () => {
    try {
      setIsGeneratingCode(true);
      const { data, error } = await generateInviteCode(userId);
      
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

  const filteredInviteCodes = inviteCodes.filter(code => {
    const searchLower = codeSearch.toLowerCase();
    return (
      code.code.toLowerCase().includes(searchLower) ||
      (code.usedBy && code.usedBy.toLowerCase().includes(searchLower))
    );
  });

  return (
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
        <InviteCodeTable inviteCodes={filteredInviteCodes} />
      </CardContent>
    </Card>
  );
};

export default InviteCodeManagement;

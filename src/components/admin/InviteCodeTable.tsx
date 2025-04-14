
import React, { useState } from 'react';
import { InviteCode } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardCopy, CheckCircle2 } from 'lucide-react';

interface InviteCodeTableProps {
  inviteCodes: InviteCode[];
}

const InviteCodeTable = ({ inviteCodes }: InviteCodeTableProps) => {
  const { toast } = useToast();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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

  return (
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
          {inviteCodes.length > 0 ? (
            inviteCodes.map((code) => (
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
  );
};

export default InviteCodeTable;

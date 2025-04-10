
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { sendMessage } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface RoommateCardProps {
  roommate: User;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ roommate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleMessageClick = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to message other users.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      // Send an initial empty message to create the conversation
      await sendMessage(user.id, roommate.id, `Hey! I'm interested in connecting as potential roommates.`);
      navigate('/messaging');
      
      toast({
        title: "Conversation started",
        description: `You can now chat with ${roommate.fullName}.`,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {roommate.profileImage ? (
          <img 
            src={roommate.profileImage} 
            alt={roommate.fullName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Avatar className="h-24 w-24">
              <AvatarFallback>{roommate.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{roommate.fullName}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Building className="h-3.5 w-3.5 mr-1" />
              <span>{roommate.company}</span>
            </div>
          </div>
          <Badge variant={roommate.jobType === 'internship' ? 'outline' : 'default'}>
            {roommate.jobType === 'internship' ? 'Intern' : 'Full-time'}
          </Badge>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="truncate">{roommate.officeLocation}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mt-1">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>
            {formatDate(roommate.startDate)}
            {roommate.endDate && ` - ${formatDate(roommate.endDate)}`}
          </span>
        </div>
        
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">Budget:</p>
          <p className="text-sm text-gray-600">${roommate.budgetMin} - ${roommate.budgetMax}</p>
        </div>
        
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">Preferred neighborhoods:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {roommate.preferredNeighborhoods.slice(0, 3).map((neighborhood) => (
              <Badge key={neighborhood} variant="outline" className="text-xs">
                {neighborhood}
              </Badge>
            ))}
            {roommate.preferredNeighborhoods.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{roommate.preferredNeighborhoods.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {roommate.lifestyleTags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-roommate-paleBlue text-roommate-blue">
                {tag}
              </Badge>
            ))}
            {roommate.lifestyleTags.length > 5 && (
              <Badge variant="secondary" className="text-xs bg-roommate-paleBlue text-roommate-blue">
                +{roommate.lifestyleTags.length - 5}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-roommate-blue"
            onClick={handleMessageClick}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-roommate-blue hover:bg-roommate-darkBlue"
            asChild
          >
            <Link to={`/roommate/${roommate.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

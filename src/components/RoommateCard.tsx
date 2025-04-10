
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types';
import { Building, Car, MapPin, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoommateCardProps {
  roommate: User;
}

export const RoommateCard = ({ roommate }: RoommateCardProps) => {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    // In a real app, we would create or navigate to a conversation with this roommate
    // For now, we'll just navigate to the messaging page
    navigate('/messaging');
  };

  // Format budget range
  const formattedBudget = `$${roommate.budgetMin} - $${roommate.budgetMax}`;

  // Limit the number of tags shown
  const displayTags = roommate.lifestyleTags.slice(0, 3);
  const extraTags = roommate.lifestyleTags.length > 3 ? roommate.lifestyleTags.length - 3 : 0;

  // Format date range
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const dateRange = roommate.jobType === 'internship' && roommate.endDate
    ? `${formatDate(roommate.startDate)} - ${formatDate(roommate.endDate)}`
    : `Starting ${formatDate(roommate.startDate)}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative bg-gray-100">
        <Avatar className="h-full w-full rounded-none">
          <AvatarImage 
            src={roommate.profileImage} 
            alt={roommate.fullName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-none">{roommate.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{roommate.fullName}</h3>
            <div className="flex items-center text-sm text-gray-600 gap-1">
              <Building className="h-3.5 w-3.5" />
              <span>{roommate.company}</span>
            </div>
          </div>
          <Badge variant={roommate.jobType === 'internship' ? 'outline' : 'default'}>
            {roommate.jobType === 'internship' ? 'Intern' : 'Full-time'}
          </Badge>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Office Location</p>
              <p className="text-sm text-gray-600">{roommate.officeLocation}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Timeline</p>
              <p className="text-sm text-gray-600">{dateRange}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Preferred Neighborhoods</p>
              <p className="text-sm text-gray-600">
                {roommate.preferredNeighborhoods.slice(0, 2).join(', ')}
                {roommate.preferredNeighborhoods.length > 2 && 
                  ` +${roommate.preferredNeighborhoods.length - 2} more`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Budget Range</p>
              <p className="text-sm text-gray-600">{formattedBudget}/month</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Car className={cn(
              "h-4 w-4 mt-0.5",
              roommate.hasCar ? "text-green-500" : "text-gray-400"
            )} />
            <p className="text-sm text-gray-600">
              {roommate.hasCar ? 'Has a car' : 'No car'}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="text-sm font-medium mb-2">Lifestyle & Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {extraTags > 0 && (
              <Badge variant="outline" className="text-xs">
                +{extraTags} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleMessageClick} className="w-full">
          Message
        </Button>
      </CardFooter>
    </Card>
  );
};

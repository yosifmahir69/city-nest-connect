import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Calendar, 
  Car, 
  DollarSign, 
  Edit, 
  Loader2, 
  MapPin, 
  Save,
  User as UserIcon,
  X
} from 'lucide-react';
import { updateUserProfile, uploadProfileImage } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import CreateProfile from './CreateProfile';

const SAMPLE_USER = {
  id: 'current-user',
  email: 'you@example.com',
  fullName: 'Sam Taylor',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  jobType: 'internship',
  company: 'Amazon',
  officeLocation: 'Amazon – NYC 7 W 34th St',
  startDate: '2025-06-01',
  endDate: '2025-08-31',
  gender: 'male',
  preferredRoommateGenders: ['male', 'female'],
  hasCar: true,
  preferredNeighborhoods: ['Chelsea', 'West Village', 'SoHo'],
  budgetMin: 1200,
  budgetMax: 2400,
  lifestyleTags: ['Gym enthusiast', 'Early bird', 'Tech', 'Clean', 'Social'],
  firstTimeInCity: true,
  additionalPreferences: ['Private bathroom', 'In-unit laundry', 'Near subway'],
  createdAt: '2025-03-15',
  updatedAt: '2025-03-15'
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(SAMPLE_USER);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await updateUserProfile(user.id, profileData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await uploadProfileImage(user.id, file);
      
      if (error) {
        throw error;
      }
      
      setProfileData(prev => ({
        ...prev,
        profileImage: data?.url || prev.profileImage
      }));
      
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!profileData) {
    return <CreateProfile />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="relative pb-0">
            <div className="absolute top-4 right-4">
              {isEditMode ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditMode(false)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={profileData.profileImage} alt={profileData.fullName} />
                  <AvatarFallback>{profileData.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-roommate-blue text-white p-1 rounded-full cursor-pointer shadow-md"
                  >
                    <Edit className="h-4 w-4" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                )}
              </div>
              
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profileData.fullName}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <div className="flex items-center justify-center sm:justify-start text-gray-600">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{profileData.company}</span>
                  </div>
                  <Badge className="sm:ml-2" variant={profileData.jobType === 'internship' ? 'outline' : 'default'}>
                    {profileData.jobType === 'internship' ? 'Intern' : 'Full-time'}
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profileData.officeLocation}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="profile" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-roommate-blue" />
                        Personal Info
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Full Name</p>
                          <p>{profileData.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p>{profileData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p className="capitalize">{profileData.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">First Time In City</p>
                          <p>{profileData.firstTimeInCity ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Building className="h-5 w-5 mr-2 text-roommate-blue" />
                        Work Details
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Company</p>
                          <p>{profileData.company}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Office Location</p>
                          <p>{profileData.officeLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Job Type</p>
                          <p className="capitalize">{profileData.jobType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-roommate-blue" />
                        Timeline
                      </h3>
                      <div className="mt-2 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Start Date</p>
                          <p>{formatDate(profileData.startDate)}</p>
                        </div>
                        {profileData.endDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">End Date</p>
                            <p>{formatDate(profileData.endDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-roommate-blue" />
                        Budget
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Monthly Rent Range</p>
                        <p>${profileData.budgetMin} - ${profileData.budgetMax}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Car className="h-5 w-5 mr-2 text-roommate-blue" />
                        Transportation
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Has Car</p>
                        <p>{profileData.hasCar ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-roommate-blue" />
                      Roommate Preferences
                    </h3>
                    <div className="mt-2 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Preferred Roommate Gender(s)</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profileData.preferredRoommateGenders.map((gender) => (
                            <Badge key={gender} variant="outline" className="capitalize">
                              {gender === "nonbinary" ? "Non-binary" : gender}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-roommate-blue" />
                      Neighborhood Preferences
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500">Preferred Neighborhoods</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profileData.preferredNeighborhoods.map((neighborhood) => (
                          <Badge key={neighborhood} variant="outline">
                            {neighborhood}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Lifestyle & Interests</h3>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {profileData.lifestyleTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-roommate-paleBlue text-roommate-blue">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Additional Preferences</h3>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {profileData.additionalPreferences.map((preference) => (
                          <Badge key={preference} variant="outline">
                            {preference}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

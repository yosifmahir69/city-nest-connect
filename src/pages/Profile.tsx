
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getUserProfile, updateUserProfile, uploadProfileImage } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import CreateProfile from './CreateProfile';
import { User } from '@/types';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch the user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await getUserProfile(user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData(data);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast, navigate]);

  // Redirect to create profile if no profile exists
  if (!isLoading && !profileData && user) {
    return <CreateProfile />;
  }
  
  const handleProfileUpdate = async () => {
    if (!user || !profileData) return;
    
    try {
      setIsSaving(true);
      
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
      setIsSaving(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profileData) return;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await uploadProfileImage(user.id, file);
      
      if (error) {
        throw error;
      }
      
      setProfileData(prev => prev ? {
        ...prev,
        profileImage: data?.url || prev.profileImage
      } : null);
      
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
      setIsSaving(false);
    }
  };

  // Handle field changes in edit mode
  const handleChange = (field: keyof User, value: any) => {
    if (!profileData) return;
    
    setProfileData(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-roommate-blue" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
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
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                  >
                    {isSaving ? (
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
                          {isEditMode ? (
                            <input 
                              type="text"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.fullName}
                              onChange={(e) => handleChange('fullName', e.target.value)}
                            />
                          ) : (
                            <p>{profileData.fullName}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p>{user?.email || profileData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          {isEditMode ? (
                            <select
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.gender}
                              onChange={(e) => handleChange('gender', e.target.value)}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="nonbinary">Non-binary</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <p className="capitalize">{profileData.gender}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">First Time In City</p>
                          {isEditMode ? (
                            <select
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.firstTimeInCity ? 'true' : 'false'}
                              onChange={(e) => handleChange('firstTimeInCity', e.target.value === 'true')}
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <p>{profileData.firstTimeInCity ? 'Yes' : 'No'}</p>
                          )}
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
                          {isEditMode ? (
                            <input 
                              type="text"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.company}
                              onChange={(e) => handleChange('company', e.target.value)}
                            />
                          ) : (
                            <p>{profileData.company}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Office Location</p>
                          {isEditMode ? (
                            <input 
                              type="text"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.officeLocation}
                              onChange={(e) => handleChange('officeLocation', e.target.value)}
                            />
                          ) : (
                            <p>{profileData.officeLocation}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Job Type</p>
                          {isEditMode ? (
                            <select
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.jobType}
                              onChange={(e) => handleChange('jobType', e.target.value)}
                            >
                              <option value="internship">Internship</option>
                              <option value="fulltime">Full-time</option>
                            </select>
                          ) : (
                            <p className="capitalize">{profileData.jobType}</p>
                          )}
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
                          {isEditMode ? (
                            <input 
                              type="date"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.startDate ? new Date(profileData.startDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleChange('startDate', e.target.value)}
                            />
                          ) : (
                            <p>{formatDate(profileData.startDate)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">End Date</p>
                          {isEditMode ? (
                            <input 
                              type="date"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.endDate ? new Date(profileData.endDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleChange('endDate', e.target.value)}
                            />
                          ) : (
                            profileData.endDate ? <p>{formatDate(profileData.endDate)}</p> : <p>N/A</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-roommate-blue" />
                        Budget
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Monthly Rent Range</p>
                        {isEditMode ? (
                          <div className="flex gap-2 items-center">
                            <span>$</span>
                            <input 
                              type="number"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.budgetMin}
                              onChange={(e) => handleChange('budgetMin', parseInt(e.target.value))}
                            />
                            <span>-</span>
                            <input 
                              type="number"
                              className="border border-gray-300 rounded p-2 w-full"
                              value={profileData.budgetMax}
                              onChange={(e) => handleChange('budgetMax', parseInt(e.target.value))}
                            />
                          </div>
                        ) : (
                          <p>${profileData.budgetMin} - ${profileData.budgetMax}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Car className="h-5 w-5 mr-2 text-roommate-blue" />
                        Transportation
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Has Car</p>
                        {isEditMode ? (
                          <select
                            className="border border-gray-300 rounded p-2 w-full"
                            value={profileData.hasCar ? 'true' : 'false'}
                            onChange={(e) => handleChange('hasCar', e.target.value === 'true')}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <p>{profileData.hasCar ? 'Yes' : 'No'}</p>
                        )}
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
                        {isEditMode ? (
                          <div className="space-y-2 mt-2">
                            {['male', 'female', 'nonbinary', 'other'].map((gender) => (
                              <div key={gender} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`gender-${gender}`}
                                  checked={(profileData.preferredRoommateGenders || []).includes(gender)}
                                  onChange={(e) => {
                                    const currentGenders = [...(profileData.preferredRoommateGenders || [])];
                                    if (e.target.checked) {
                                      currentGenders.push(gender);
                                    } else {
                                      const index = currentGenders.indexOf(gender);
                                      if (index !== -1) currentGenders.splice(index, 1);
                                    }
                                    handleChange('preferredRoommateGenders', currentGenders);
                                  }}
                                  className="mr-2"
                                />
                                <label htmlFor={`gender-${gender}`} className="capitalize">
                                  {gender === "nonbinary" ? "Non-binary" : gender}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(profileData.preferredRoommateGenders || []).map((gender) => (
                              <Badge key={gender} variant="outline" className="capitalize">
                                {gender === "nonbinary" ? "Non-binary" : gender}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                      {isEditMode ? (
                        <textarea
                          className="border border-gray-300 rounded p-2 w-full mt-2"
                          value={(profileData.preferredNeighborhoods || []).join(', ')}
                          onChange={(e) => {
                            const neighborhoods = e.target.value
                              .split(',')
                              .map(n => n.trim())
                              .filter(n => n !== '');
                            handleChange('preferredNeighborhoods', neighborhoods);
                          }}
                          placeholder="Enter neighborhoods separated by commas"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(profileData.preferredNeighborhoods || []).map((neighborhood) => (
                            <Badge key={neighborhood} variant="outline">
                              {neighborhood}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Lifestyle & Interests</h3>
                    <div className="mt-2">
                      {isEditMode ? (
                        <textarea
                          className="border border-gray-300 rounded p-2 w-full mt-2"
                          value={(profileData.lifestyleTags || []).join(', ')}
                          onChange={(e) => {
                            const tags = e.target.value
                              .split(',')
                              .map(tag => tag.trim())
                              .filter(tag => tag !== '');
                            handleChange('lifestyleTags', tags);
                          }}
                          placeholder="Enter lifestyle tags separated by commas"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(profileData.lifestyleTags || []).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-roommate-paleBlue text-roommate-blue">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Additional Preferences</h3>
                    <div className="mt-2">
                      {isEditMode ? (
                        <textarea
                          className="border border-gray-300 rounded p-2 w-full mt-2"
                          value={(profileData.additionalPreferences || []).join(', ')}
                          onChange={(e) => {
                            const preferences = e.target.value
                              .split(',')
                              .map(pref => pref.trim())
                              .filter(pref => pref !== '');
                            handleChange('additionalPreferences', preferences);
                          }}
                          placeholder="Enter additional preferences separated by commas"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(profileData.additionalPreferences || []).map((preference) => (
                            <Badge key={preference} variant="outline">
                              {preference}
                            </Badge>
                          ))}
                        </div>
                      )}
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

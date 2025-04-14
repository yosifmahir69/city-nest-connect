import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateUserProfile, uploadProfileImage, getUserProfile } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const LIFESTYLE_TAGS = [
  "Early bird", "Night owl", "Gym enthusiast", "Cook at home",
  "Vegetarian", "Vegan", "Social", "Quiet", "Clean", "Studious",
  "Pet-friendly", "Non-smoker", "Occasional drinker", "Non-drinker",
  "Tech", "Arts", "Music", "Outdoors", "Travel", "Reading"
];

const NEIGHBORHOODS = [
  "Downtown", "Midtown", "Uptown", "Financial District", 
  "SoHo", "West Village", "East Village", "Chelsea", "Brooklyn",
  "Queens", "Harlem", "The Bronx", "Jersey City", "Hoboken"
];

const ADDITIONAL_PREFERENCES = [
  "Private bathroom", "No pets", "Furnished apartment", "Utilities included",
  "In-unit laundry", "Gym in building", "Parking", "Doorman", "Elevator",
  "Outdoor space", "Near subway", "Quiet building", "Pet-friendly building"
];

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  jobType: z.enum(["internship", "fulltime"], { required_error: "Please select job type" }),
  company: z.string().min(1, { message: "Company name is required" }),
  officeLocation: z.string().min(1, { message: "Office location is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  gender: z.string({ required_error: "Please select a gender" }),
  preferredRoommateGenders: z.array(z.string()).min(1, { message: "Select at least one preferred roommate gender" }),
  hasCar: z.boolean(),
  preferredNeighborhoods: z.array(z.string()).min(1, { message: "Select at least one neighborhood" }),
  budgetRange: z.array(z.number()).length(2),
  lifestyleTags: z.array(z.string()).min(1, { message: "Select at least one lifestyle tag" }),
  firstTimeInCity: z.boolean(),
  additionalPreferences: z.array(z.string()),
  profileImage: z.any().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CreateProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      jobType: "internship",
      company: "",
      officeLocation: "",
      gender: "",
      preferredRoommateGenders: [],
      hasCar: false,
      preferredNeighborhoods: [],
      budgetRange: [1000, 3000],
      lifestyleTags: [],
      firstTimeInCity: false,
      additionalPreferences: []
    },
  });

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await getUserProfile(user.id);
          
          console.log("Checking for existing profile:", data);
          
          if (data && data.fullName) {
            setExistingProfile(data);
            navigate('/profile');
          }
        } catch (error) {
          console.error("Error checking for existing profile:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkExistingProfile();
  }, [user, navigate]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('profileImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const profileData = {
        ...data,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        budgetMin: data.budgetRange[0],
        budgetMax: data.budgetRange[1],
      };

      console.log("Submitting profile data:", profileData);

      let profileImageUrl;
      if (data.profileImage) {
        const uploadResult = await uploadProfileImage(user.id, data.profileImage);
        if (uploadResult.error) {
          throw uploadResult.error;
        }
        profileImageUrl = uploadResult.data?.url;
      }

      const { error } = await updateUserProfile(user.id, {
        ...profileData,
        profileImage: profileImageUrl
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile created!",
        description: "Your profile has been successfully created.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roommate-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
          <p className="text-gray-600 mt-2">Complete your profile to find compatible roommates</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-roommate-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span className={step >= 1 ? "text-roommate-blue font-medium" : ""}>Basic Info</span>
            <span className={step >= 2 ? "text-roommate-blue font-medium" : ""}>Work Details</span>
            <span className={step >= 3 ? "text-roommate-blue font-medium" : ""}>Preferences</span>
            <span className={step >= 4 ? "text-roommate-blue font-medium" : ""}>Lifestyle</span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div 
                        className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300"
                      >
                        {profileImagePreview ? (
                          <img 
                            src={profileImagePreview} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400">Photo</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <label htmlFor="profile-image" className="cursor-pointer text-sm text-roommate-blue hover:text-roommate-lightBlue">
                          Upload Profile Photo
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageChange}
                          />
                        </label>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="nonbinary" />
                                </FormControl>
                                <FormLabel className="font-normal">Non-binary</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredRoommateGenders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Roommate Gender(s)</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                          <div className="space-y-2">
                            {["male", "female", "nonbinary", "other"].map((gender) => (
                              <FormItem
                                key={gender}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(gender)}
                                    onCheckedChange={(checked) => {
                                      const updatedGenders = checked
                                        ? [...field.value, gender]
                                        : field.value.filter((val) => val !== gender);
                                      field.onChange(updatedGenders);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">
                                  {gender === "nonbinary" ? "Non-binary" : gender}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="firstTimeInCity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              First time in the city
                            </FormLabel>
                            <FormDescription>
                              Check this if it's your first time living in this city
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="button" onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange as (value: string) => void}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="internship" />
                                </FormControl>
                                <FormLabel className="font-normal">Internship</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="fulltime" />
                                </FormControl>
                                <FormLabel className="font-normal">Full-time Role</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="officeLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Google – NYC 111 8th Ave" {...field} />
                          </FormControl>
                          <FormDescription>
                            Include specific office address if possible
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("jobType") === "internship" && (
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < form.watch("startDate") || date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Optional for full-time roles
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                      <Button type="button" onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasCar"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I have a car
                            </FormLabel>
                            <FormDescription>
                              Check this if you'll have a car in the city
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredNeighborhoods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Neighborhoods</FormLabel>
                          <FormDescription>
                            Select all neighborhoods you're interested in living in
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {NEIGHBORHOODS.map((neighborhood) => (
                              <FormItem
                                key={neighborhood}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(neighborhood)}
                                    onCheckedChange={(checked) => {
                                      const updatedNeighborhoods = checked
                                        ? [...field.value, neighborhood]
                                        : field.value.filter((val) => val !== neighborhood);
                                      field.onChange(updatedNeighborhoods);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {neighborhood}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Budget Range</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Slider
                                defaultValue={field.value}
                                max={5000}
                                min={500}
                                step={100}
                                onValueChange={field.onChange}
                              />
                              <div className="flex justify-between">
                                <span>${field.value[0]}</span>
                                <span>${field.value[1]}</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set your minimum and maximum monthly rent budget
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                      <Button type="button" onClick={nextStep}>Next</Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="lifestyleTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lifestyle and Interests</FormLabel>
                          <FormDescription>
                            Select tags that describe your lifestyle and interests
                          </FormDescription>
                          <div className="mt-2">
                            <div className="mb-3 flex flex-wrap gap-2">
                              {field.value.map((tag) => (
                                <Badge 
                                  key={tag} 
                                  className="bg-roommate-blue"
                                  onClick={() => {
                                    const updatedTags = field.value.filter((t) => t !== tag);
                                    field.onChange(updatedTags);
                                  }}
                                >
                                  {tag} ×
                                </Badge>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {LIFESTYLE_TAGS.filter(tag => !field.value.includes(tag)).map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    if (!field.value.includes(tag)) {
                                      const updatedTags = [...field.value, tag];
                                      field.onChange(updatedTags);
                                    }
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalPreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Preferences</FormLabel>
                          <FormDescription>
                            Select any additional housing preferences
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {ADDITIONAL_PREFERENCES.map((preference) => (
                              <FormItem
                                key={preference}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(preference)}
                                    onCheckedChange={(checked) => {
                                      const updatedPreferences = checked
                                        ? [...field.value, preference]
                                        : field.value.filter((val) => val !== preference);
                                      field.onChange(updatedPreferences);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {preference}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Complete Profile"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProfile;

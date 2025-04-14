
import { User, InviteCode } from '@/types';

// Sample user data for development
export const SAMPLE_USERS: User[] = [
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

// Sample invite codes for development
export const SAMPLE_INVITE_CODES: InviteCode[] = [
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

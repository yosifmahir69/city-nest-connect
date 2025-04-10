
export interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  jobType: 'internship' | 'fulltime';
  company: string;
  officeLocation: string;
  startDate: string;
  endDate?: string;
  gender: string;
  preferredRoommateGenders: string[];
  hasCar: boolean;
  preferredNeighborhoods: string[];
  budgetMin: number;
  budgetMax: number;
  lifestyleTags: string[];
  firstTimeInCity: boolean;
  additionalPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageId: string;
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
  otherUser: User;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
}

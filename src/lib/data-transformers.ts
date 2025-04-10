
import { User, Message, Conversation } from '@/types';
import { ProfileRow, MessageRow, ConversationRow } from './db-types';

/**
 * Transform a raw profile row to a User object
 */
export function transformProfile(profile: ProfileRow): User {
  return {
    id: profile.id,
    email: '', // We don't store email in profiles table
    fullName: profile.full_name || '',
    profileImage: profile.profile_image_url || undefined,
    jobType: (profile.job_type || 'fulltime') as 'internship' | 'fulltime',
    company: profile.company || '',
    officeLocation: profile.office_location || '',
    startDate: profile.start_date || '',
    endDate: profile.end_date || undefined,
    gender: profile.gender || '',
    preferredRoommateGenders: profile.preferred_roommate_genders || [],
    hasCar: profile.has_car || false,
    preferredNeighborhoods: profile.preferred_neighborhoods || [],
    budgetMin: profile.budget_min || 0,
    budgetMax: profile.budget_max || 0,
    lifestyleTags: profile.lifestyle_tags || [],
    firstTimeInCity: profile.first_time_in_city || false,
    additionalPreferences: profile.additional_preferences || [],
    createdAt: profile.created_at || '',
    updatedAt: profile.updated_at || ''
  };
}

/**
 * Transform a raw message row to a Message object
 */
export function transformMessage(message: any): Message {
  return {
    id: message.id || '',
    senderId: message.sender_id || '',
    receiverId: message.receiver_id || '',
    content: message.content || '',
    read: message.read || false,
    createdAt: message.created_at || ''
  };
}

/**
 * Transform a raw conversation row with a user to a Conversation object
 */
export function transformConversation(
  conversation: any, 
  otherUser: User,
  lastMessage?: any,
  unreadCount = 0
): Conversation {
  return {
    id: conversation.id || '',
    participantIds: [conversation.participant1_id || '', conversation.participant2_id || ''],
    lastMessageId: lastMessage?.id || '',
    lastMessageContent: lastMessage?.content || 'Start a conversation',
    lastMessageTime: lastMessage?.created_at || conversation.created_at || '',
    unreadCount,
    otherUser
  };
}

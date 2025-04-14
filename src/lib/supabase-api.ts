
// This file is being deprecated in favor of more modular files in src/lib/api
// Please import from src/lib/supabase.ts instead

import { 
  getAllProfiles,
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  getRoommates,
} from './api';

// Re-export for backward compatibility
export { 
  getAllProfiles,
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  getRoommates,
};

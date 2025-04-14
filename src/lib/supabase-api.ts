
// This file is being deprecated in favor of more modular files in src/lib/api
// Please import from src/lib/supabase.ts instead

import { 
  getAllUsers,
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getRoommates,
} from './api';

// Re-export for backward compatibility
export { 
  getAllUsers,
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  uploadProfileImage,
  getRoommates,
};


// Re-export all functions from our API modules
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
  getRoommates
} from './api';

// Export auth functions for backward compatibility
export {
  getCurrentUser,
  signIn,
  signOut,
  signUp
} from './api/auth';

// Export additional messaging functions
export {
  getOrCreateConversation
} from './api/messaging';

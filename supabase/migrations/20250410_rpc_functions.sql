
-- Function to get conversations for a user
CREATE OR REPLACE FUNCTION public.get_conversations(user_id UUID)
RETURNS SETOF conversations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM conversations
  WHERE participant1_id = user_id OR participant2_id = user_id
  ORDER BY updated_at DESC;
$$;

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  participant1_id_param UUID,
  participant2_id_param UUID
)
RETURNS conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_conversation conversations;
  new_conversation conversations;
BEGIN
  -- Try to find an existing conversation
  SELECT * INTO existing_conversation
  FROM conversations
  WHERE 
    (participant1_id = participant1_id_param AND participant2_id = participant2_id_param) OR
    (participant1_id = participant2_id_param AND participant2_id = participant1_id_param)
  LIMIT 1;
  
  -- If found, return it
  IF FOUND THEN
    RETURN existing_conversation;
  END IF;
  
  -- Otherwise, create a new conversation
  INSERT INTO conversations (participant1_id, participant2_id)
  VALUES (participant1_id_param, participant2_id_param)
  RETURNING * INTO new_conversation;
  
  RETURN new_conversation;
END;
$$;

-- Function to get messages for a conversation
CREATE OR REPLACE FUNCTION public.get_messages_for_conversation(conversation_id_param UUID)
RETURNS SETOF messages
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM messages
  WHERE conversation_id = conversation_id_param;
$$;

-- Function to create a message
CREATE OR REPLACE FUNCTION public.create_message(
  conversation_id_param UUID,
  sender_id_param UUID,
  receiver_id_param UUID,
  content_param TEXT
)
RETURNS messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_message messages;
BEGIN
  -- Create the message
  INSERT INTO messages (conversation_id, sender_id, receiver_id, content, read)
  VALUES (conversation_id_param, sender_id_param, receiver_id_param, content_param, false)
  RETURNING * INTO new_message;
  
  -- Update the conversation's updated_at timestamp
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = conversation_id_param;
  
  RETURN new_message;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE 
    conversation_id = conversation_id_param AND 
    receiver_id = user_id_param AND
    read = false;
END;
$$;

-- Function to count unread messages
CREATE OR REPLACE FUNCTION public.count_unread_messages(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM messages
  WHERE 
    conversation_id = conversation_id_param AND 
    receiver_id = user_id_param AND
    read = false;
$$;

-- Function to create an invite code
CREATE OR REPLACE FUNCTION public.create_invite_code(
  code_param TEXT,
  created_by_param UUID
)
RETURNS invite_codes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invite_code invite_codes;
BEGIN
  INSERT INTO invite_codes (code, created_by, created_at)
  VALUES (code_param, created_by_param, NOW())
  RETURNING * INTO new_invite_code;
  
  RETURN new_invite_code;
END;
$$;

-- Function to get all invite codes
CREATE OR REPLACE FUNCTION public.get_invite_codes()
RETURNS SETOF invite_codes
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM invite_codes;
$$;

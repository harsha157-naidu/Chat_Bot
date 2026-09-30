const { query } = require('../config/database');
const { processMultimodalRequest } = require('../services/aiService');

// Get all chats for the authenticated user or default guest user
exports.getChats = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const chats = await query(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    res.json({ chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const title = req.body.title || 'New Conversation';

    const result = await query(
      'INSERT INTO chats (user_id, title) VALUES (?, ?)',
      [userId, title]
    );

    const newChat = {
      id: result.lastID,
      user_id: userId,
      title: title,
      created_at: new Date().toISOString()
    };

    res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Failed to create chat.' });
  }
};

// Get single chat with messages and media
exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chatRows = await query('SELECT * FROM chats WHERE id = ?', [chatId]);
    if (chatRows.length === 0) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    const messages = await query(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY id ASC',
      [chatId]
    );

    // Fetch media associated with these messages
    const media = await query('SELECT * FROM media WHERE chat_id = ?', [chatId]);
    const aiResponses = await query(`
      SELECT ar.* FROM ai_responses ar 
      JOIN messages m ON ar.message_id = m.id 
      WHERE m.chat_id = ?
    `, [chatId]);

    // Attach media and ai response to corresponding messages
    const enrichedMessages = messages.map(msg => {
      const msgMedia = media.filter(m => m.message_id === msg.id);
      const aiResp = aiResponses.find(r => r.message_id === msg.id);
      return {
        ...msg,
        media: msgMedia,
        aiResponse: aiResp || null
      };
    });

    res.json({
      chat: chatRows[0],
      messages: enrichedMessages
    });
  } catch (err) {
    console.error('Error fetching chat details:', err);
    res.status(500).json({ error: 'Failed to retrieve conversation.' });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    await query('DELETE FROM chats WHERE id = ?', [chatId]);
    res.json({ message: 'Conversation deleted successfully.' });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat.' });
  }
};

// Send message & execute multimodal AI pipeline
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    let { chatId, text, messageType = 'text', mediaUrl, fileName, fileType } = req.body;

    // Create chat if not provided
    if (!chatId) {
      const autoTitle = text ? (text.slice(0, 32) + (text.length > 32 ? '...' : '')) : `${messageType.toUpperCase()} Query`;
      const chatRes = await query(
        'INSERT INTO chats (user_id, title) VALUES (?, ?)',
        [userId, autoTitle]
      );
      chatId = chatRes.lastID;
    }

    // 1. Save user message in messages table
    const userMsgRes = await query(
      'INSERT INTO messages (chat_id, sender, message_text, message_type) VALUES (?, ?, ?, ?)',
      [chatId, 'user', text || `[Uploaded ${messageType}]`, messageType]
    );
    const userMessageId = userMsgRes.lastID;

    // 2. If media attached, store in media table
    let savedMedia = null;
    if (mediaUrl) {
      const mediaRes = await query(
        'INSERT INTO media (user_id, chat_id, message_id, file_name, file_type, file_url, cloud_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, chatId, userMessageId, fileName || 'upload', fileType || messageType, mediaUrl, 'local']
      );
      savedMedia = {
        id: mediaRes.lastID,
        file_name: fileName || 'upload',
        file_type: fileType || messageType,
        file_url: mediaUrl
      };
    }

    // Fetch recent prior messages for conversational memory (ChatGPT/Gemini style)
    let chatHistory = [];
    try {
      const priorMsgs = await query(
        'SELECT sender, message_text FROM messages WHERE chat_id = ? AND id != ? ORDER BY id DESC LIMIT 6',
        [chatId, userMessageId]
      );
      if (Array.isArray(priorMsgs)) {
        chatHistory = priorMsgs.reverse().map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.message_text
        }));
      }
    } catch (historyErr) {
      console.warn('Could not retrieve chat history context:', historyErr.message);
    }

    // 3. Process multimodal AI inference
    const aiResult = await processMultimodalRequest({
      text,
      mediaType: messageType,
      mediaUrl,
      fileName,
      chatHistory
    });

    // 4. Save AI message in messages table
    const aiMsgRes = await query(
      'INSERT INTO messages (chat_id, sender, message_text, message_type) VALUES (?, ?, ?, ?)',
      [chatId, 'ai', aiResult.text, 'text']
    );
    const aiMessageId = aiMsgRes.lastID;

    // 5. Save AI response record
    await query(
      'INSERT INTO ai_responses (message_id, model_name, response_text, processing_time) VALUES (?, ?, ?, ?)',
      [aiMessageId, aiResult.model, aiResult.text, aiResult.processingTime]
    );

    // 6. Update chat's updated_at timestamp
    await query('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [chatId]);

    res.json({
      chatId,
      userMessage: {
        id: userMessageId,
        chat_id: chatId,
        sender: 'user',
        message_text: text || `[Uploaded ${messageType}]`,
        message_type: messageType,
        created_at: new Date().toISOString(),
        media: savedMedia ? [savedMedia] : []
      },
      aiMessage: {
        id: aiMessageId,
        chat_id: chatId,
        sender: 'ai',
        message_text: aiResult.text,
        message_type: 'text',
        created_at: new Date().toISOString(),
        aiResponse: {
          model_name: aiResult.model,
          processing_time: aiResult.processingTime
        }
      }
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to process message.' });
  }
};

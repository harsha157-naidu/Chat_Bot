const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Step 1: Secure Identity Isolation (Authentication)
// Dedicated admin login for Harsha Naidu (naiduharsha2006@gmail.com)
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both administrator email and password.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Enforce strict identity isolation for Harsha Naidu
  if (cleanEmail !== 'naiduharsha2006@gmail.com') {
    return res.status(403).json({ error: 'Access denied: Unauthorized administrator identity.' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ? AND role = "admin" LIMIT 1', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(403).json({ error: 'Administrator profile not configured.' });
    }

    const admin = users[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    // Generate secure short-lived admin JWT
    const token = jwt.sign(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Administrator identity verified.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server authentication error.' });
  }
};

// System Telemetry & Statistics
exports.getStats = async (req, res) => {
  try {
    const [userCount] = await query('SELECT COUNT(*) as count FROM users');
    const [chatCount] = await query('SELECT COUNT(*) as count FROM chats');
    const [messageCount] = await query('SELECT COUNT(*) as count FROM messages');
    const [mediaCount] = await query('SELECT COUNT(*) as count FROM media');
    const [aiCount] = await query('SELECT COUNT(*) as count FROM ai_responses');
    const [unresolvedCount] = await query('SELECT COUNT(*) as count FROM unresolved_queries WHERE status = "unresolved"');
    const [errorCount] = await query('SELECT COUNT(*) as count FROM system_errors');
    const [avgLatency] = await query('SELECT AVG(processing_time) as avgTime FROM ai_responses');

    const mediaByType = await query(`
      SELECT file_type, COUNT(*) as count 
      FROM media 
      GROUP BY file_type
    `);

    const recentChats = await query(`
      SELECT c.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count
      FROM chats c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.updated_at DESC
      LIMIT 10
    `);

    res.json({
      stats: {
        totalUsers: userCount?.count || 0,
        totalChats: chatCount?.count || 0,
        totalMessages: messageCount?.count || 0,
        totalMedia: mediaCount?.count || 0,
        totalAIResponses: aiCount?.count || 0,
        unresolvedQueries: unresolvedCount?.count || 0,
        systemErrors: errorCount?.count || 0,
        avgProcessingTimeMs: Math.round(avgLatency?.avgTime || 120),
        databaseEngine: 'MySQL Strict InnoDB',
        adminUser: 'Harsha Naidu (naiduharsha2006@gmail.com)'
      },
      mediaBreakdown: mediaByType,
      recentChats
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin telemetry.' });
  }
};

// Step 4: User Management & Session Overrides
exports.getAllUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC');
    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
};

// Data State Mutation: Toggle user status (active vs blocked)
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'blocked'].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be 'active' or 'blocked'." });
  }

  try {
    await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `User #${id} status mutated to ${status}.`, id, status });
  } catch (err) {
    console.error('User status mutation error:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

// Step 4: Live Sessions & Human Interdiction
exports.getAllChats = async (req, res) => {
  try {
    const chats = await query(`
      SELECT c.*, u.name as user_name, u.email as user_email, u.status as user_status,
             (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count,
             (SELECT message_text FROM messages WHERE chat_id = c.id ORDER BY id DESC LIMIT 1) as last_message
      FROM chats c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.updated_at DESC
    `);
    res.json({ chats });
  } catch (err) {
    console.error('Get all chats error:', err);
    res.status(500).json({ error: 'Failed to retrieve live chat sessions.' });
  }
};

// Toggle human interdiction (is_bot_disabled)
exports.toggleBotForChat = async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await query('SELECT id, is_bot_disabled FROM chats WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    const currentStatus = Boolean(rows[0].is_bot_disabled);
    const newStatus = !currentStatus;

    await query('UPDATE chats SET is_bot_disabled = ? WHERE id = ?', [newStatus, id]);

    res.json({
      message: newStatus ? 'Human Interdiction Activated: Bot is disabled for this session.' : 'Bot Resumed: AI Natural Language Engine restored.',
      chatId: id,
      is_bot_disabled: newStatus
    });
  } catch (err) {
    console.error('Toggle bot error:', err);
    res.status(500).json({ error: 'Failed to toggle human interdiction.' });
  }
};

// Send Human Admin Message into Chat
exports.sendAdminMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message text required.' });
  }

  try {
    const result = await query(
      'INSERT INTO messages (chat_id, sender, message_text, message_type) VALUES (?, "ai", ?, "text")',
      [id, `👤 **[Admin Harsha Naidu - Live Intervention]**\n\n${message.trim()}`]
    );

    await query('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({
      success: true,
      messageId: result.insertId,
      messageText: message.trim()
    });
  } catch (err) {
    console.error('Send admin message error:', err);
    res.status(500).json({ error: 'Failed to transmit admin intervention.' });
  }
};

// Step 3: Bug Tracking & Log Rectification Layer
exports.getUnresolvedQueries = async (req, res) => {
  try {
    const queries = await query(`
      SELECT uq.*, c.title as chat_title 
      FROM unresolved_queries uq
      LEFT JOIN chats c ON uq.chat_id = c.id
      ORDER BY uq.id DESC
      LIMIT 100
    `);
    res.json({ unresolvedQueries: queries });
  } catch (err) {
    console.error('Get unresolved queries error:', err);
    res.status(500).json({ error: 'Failed to retrieve unresolved query logs.' });
  }
};

exports.deleteUnresolvedQuery = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM unresolved_queries WHERE id = ?', [id]);
    res.json({ success: true, message: `Query #${id} cleared.` });
  } catch (err) {
    console.error('Delete unresolved query error:', err);
    res.status(500).json({ error: 'Failed to clear query.' });
  }
};

// System Error Logs
exports.getSystemErrors = async (req, res) => {
  try {
    const errors = await query('SELECT * FROM system_errors ORDER BY id DESC LIMIT 100');
    res.json({ systemErrors: errors });
  } catch (err) {
    console.error('Get system errors error:', err);
    res.status(500).json({ error: 'Failed to retrieve system error logs.' });
  }
};

exports.deleteSystemError = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM system_errors WHERE id = ?', [id]);
    res.json({ success: true, message: `Error log #${id} cleared.` });
  } catch (err) {
    console.error('Delete error log error:', err);
    res.status(500).json({ error: 'Failed to clear error log.' });
  }
};

exports.clearAllSystemErrors = async (req, res) => {
  try {
    await query('TRUNCATE TABLE system_errors');
    res.json({ success: true, message: 'All system error logs purged.' });
  } catch (err) {
    console.error('Clear all error logs error:', err);
    res.status(500).json({ error: 'Failed to purge error logs.' });
  }
};

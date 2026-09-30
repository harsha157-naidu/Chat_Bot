const { query } = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const chatCount = await query('SELECT COUNT(*) as count FROM chats');
    const messageCount = await query('SELECT COUNT(*) as count FROM messages');
    const mediaCount = await query('SELECT COUNT(*) as count FROM media');
    const aiCount = await query('SELECT COUNT(*) as count FROM ai_responses');
    const avgLatency = await query('SELECT AVG(processing_time) as avgTime FROM ai_responses');

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

    const recentMedia = await query(`
      SELECT * FROM media ORDER BY id DESC LIMIT 15
    `);

    res.json({
      stats: {
        totalUsers: userCount[0]?.count || 0,
        totalChats: chatCount[0]?.count || 0,
        totalMessages: messageCount[0]?.count || 0,
        totalMedia: mediaCount[0]?.count || 0,
        totalAIResponses: aiCount[0]?.count || 0,
        avgProcessingTimeMs: Math.round(avgLatency[0]?.avgTime || 120),
        systemStatus: 'Operational',
        databaseEngine: 'SQLite / MySQL Compatible',
        activeModel: 'SenseSphere Omni Multimodal v1'
      },
      mediaBreakdown: mediaByType,
      recentChats,
      recentMedia
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin telemetry.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
};

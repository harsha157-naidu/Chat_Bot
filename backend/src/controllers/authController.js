const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password_hash, 'user']
    );

    const userId = result.lastID;

    // Create default user settings
    await query(
      'INSERT INTO user_settings (user_id, voice_enabled, theme, language) VALUES (?, ?, ?, ?)',
      [userId, 0, 'dark', 'en-US']
    );

    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), name: name.trim(), role: 'user' }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'user' }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Fetch user settings
    const settings = await query('SELECT * FROM user_settings WHERE user_id = ?', [user.id]);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        settings: settings[0] || {}
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, profile_image, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const settings = await query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json({
      user: {
        ...users[0],
        settings: settings[0] || {}
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { voice_enabled, theme, language, speech_rate, speech_pitch } = req.body;
    await query(`
      UPDATE user_settings 
      SET voice_enabled = COALESCE(?, voice_enabled),
          theme = COALESCE(?, theme),
          language = COALESCE(?, language),
          speech_rate = COALESCE(?, speech_rate),
          speech_pitch = COALESCE(?, speech_pitch),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [voice_enabled, theme, language, speech_rate, speech_pitch, req.user.id]);

    const updated = await query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Settings updated successfully', settings: updated[0] });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};

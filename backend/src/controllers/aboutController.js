const { query } = require('../config/database');

// GET /api/about - Returns developer information architecture
exports.getAbout = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM developer_profile ORDER BY id ASC LIMIT 1');
    if (rows && rows.length > 0) {
      return res.json({ profile: rows[0] });
    }

    // Default fallback
    const fallbackProfile = {
      name: 'Arigala Sai Harshavardhan',
      role: 'Admin, Founder and Lead Developer',
      education: 'B.Tech CSE student',
      institution: 'PBR VITS',
      project_name: 'SenseSphere AI',
      description: 'SenseSphere AI is a multimodal AI assistant designed to understand text, images, audio, video, documents, camera input, and voice interactions.',
      purpose: 'My purpose is to provide users with a single AI assistant capable of understanding different types of information and helping them with their questions by combining multiple forms of human-computer interaction into one simple AI assistant.',
      technologies: 'Frontend web technologies (React, Vite, CSS, Lucide), backend APIs (Node.js, Express), AI services, computer vision, speech processing, MySQL relational database, cloud storage, and authentication services.'
    };

    res.json({ profile: fallbackProfile });
  } catch (err) {
    console.error('Error fetching about details:', err);
    res.status(500).json({ error: 'Failed to retrieve developer information.' });
  }
};

// PUT /api/about - Update developer information
exports.updateAbout = async (req, res) => {
  try {
    const { name, role, education, institution, project_name, description, purpose, technologies } = req.body;

    const rows = await query('SELECT id FROM developer_profile LIMIT 1');
    if (rows.length > 0) {
      await query(`
        UPDATE developer_profile
        SET name = COALESCE(?, name),
            role = COALESCE(?, role),
            education = COALESCE(?, education),
            institution = COALESCE(?, institution),
            project_name = COALESCE(?, project_name),
            description = COALESCE(?, description),
            purpose = COALESCE(?, purpose),
            technologies = COALESCE(?, technologies)
        WHERE id = ?
      `, [name, role, education, institution, project_name, description, purpose, technologies, rows[0].id]);
    } else {
      await query(`
        INSERT INTO developer_profile (name, role, education, institution, project_name, description, purpose, technologies)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, role, education, institution, project_name, description, purpose, technologies]);
    }

    const updated = await query('SELECT * FROM developer_profile LIMIT 1');
    res.json({ message: 'Developer profile updated successfully', profile: updated[0] });
  } catch (err) {
    console.error('Error updating about details:', err);
    res.status(500).json({ error: 'Failed to update developer profile.' });
  }
};

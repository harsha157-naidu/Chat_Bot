const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'harsha@2006';
const DB_NAME = process.env.DB_NAME || 'sensesphere_ai';

let mysqlPool = null;
let initPromise = null;

// Initialize connection and schema in MySQL
async function setupDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        // 1. Ensure database exists
        const rootConn = await mysql.createConnection({
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await rootConn.end();

        // 2. Create connection pool for application queries
        mysqlPool = mysql.createPool({
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          waitForConnections: true,
          connectionLimit: 15,
          queueLimit: 0,
          charset: 'utf8mb4'
        });

        // Test connection pool
        await mysqlPool.query('SELECT 1');
        console.log(`✅ Strictly connected to MySQL database [${DB_NAME}] on ${DB_HOST}:${DB_PORT}.`);

        // 3. Initialize MySQL tables & default records
        await initMySQLTables();
        return;
      } catch (err) {
        attempts++;
        console.error(`⚠️ MySQL connection attempt ${attempts}/${maxAttempts} failed:`, err.message);
        if (attempts >= maxAttempts) {
          throw new Error(`CRITICAL: Could not connect to MySQL database [${DB_NAME}]. All data must be stored strictly in MySQL. Error: ${err.message}`);
        }
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  })();

  return initPromise;
}

// Uniform Promise-based query function for all controllers
const query = async (sql, params = []) => {
  if (!mysqlPool) {
    await setupDatabase();
  }

  try {
    const [results] = await mysqlPool.execute(sql, params);
    
    // If it's a SELECT query, return the rows array
    if (Array.isArray(results)) {
      return results;
    }
    
    // For INSERT / UPDATE / DELETE, provide compatible properties
    return {
      insertId: results.insertId,
      lastID: results.insertId,
      affectedRows: results.affectedRows,
      changes: results.affectedRows
    };
  } catch (err) {
    console.error('MySQL query error:', err.message, '| SQL:', sql.slice(0, 100));
    throw err;
  }
};

// Create tables in MySQL
async function initMySQLTables() {
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      profile_image VARCHAR(500) DEFAULT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT NOT NULL,
      sender VARCHAR(20) NOT NULL,
      message_text LONGTEXT NOT NULL,
      message_type VARCHAR(50) NOT NULL DEFAULT 'text',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (chat_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      chat_id INT DEFAULT NULL,
      message_id INT DEFAULT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      cloud_provider VARCHAR(50) DEFAULT 'local',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (chat_id),
      INDEX (message_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS ai_responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_id INT NOT NULL,
      model_name VARCHAR(100) NOT NULL DEFAULT 'SenseSphere-Omni-v1',
      response_text LONGTEXT NOT NULL,
      processing_time INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (message_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      voice_enabled BOOLEAN DEFAULT FALSE,
      theme VARCHAR(50) DEFAULT 'dark',
      language VARCHAR(50) DEFAULT 'en-US',
      speech_rate FLOAT DEFAULT 1.0,
      speech_pitch FLOAT DEFAULT 1.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS developer_profile (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      education VARCHAR(255) NOT NULL,
      institution VARCHAR(255) NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      purpose TEXT NOT NULL,
      technologies TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Bug Tracking & Log Rectification Layer
  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS unresolved_queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT DEFAULT NULL,
      user_query TEXT NOT NULL,
      reason VARCHAR(255) DEFAULT 'fallback',
      status VARCHAR(50) DEFAULT 'unresolved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (chat_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS system_errors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      error_type VARCHAR(100) NOT NULL,
      error_message TEXT NOT NULL,
      stack_trace LONGTEXT DEFAULT NULL,
      endpoint VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure override columns exist on users and chats
  try {
    await mysqlPool.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';");
  } catch (e) {
    // Column already exists
  }
  try {
    await mysqlPool.query("ALTER TABLE chats ADD COLUMN is_bot_disabled BOOLEAN DEFAULT FALSE;");
  } catch (e) {
    // Column already exists
  }

  // Seed developer profile if empty
  const [profile] = await mysqlPool.query('SELECT * FROM developer_profile LIMIT 1');
  if (!profile || profile.length === 0) {
    await mysqlPool.query(`
      INSERT INTO developer_profile (name, role, education, institution, project_name, description, purpose, technologies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Arigala Sai Harshavardhan',
      'Admin, Founder and Lead Developer',
      'B.Tech CSE student',
      'PBR VITS',
      'SenseSphere AI',
      'SenseSphere AI is a multimodal AI assistant designed to understand text, images, audio, video, documents, camera input, and voice interactions.',
      'My purpose is to provide users with a single AI assistant capable of understanding different types of information and helping them with their questions by combining multiple forms of human-computer interaction into one simple AI assistant.',
      'Frontend web technologies (React, Vite, CSS, Lucide), backend APIs (Node.js, Express), AI services, computer vision, speech processing, MySQL relational database, cloud storage, and authentication services.'
    ]);
  }

  // Ensure default guest user exists (id: 1)
  const [users] = await mysqlPool.query('SELECT * FROM users WHERE id = 1');
  if (!users || users.length === 0) {
    await mysqlPool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (1, 'Guest User', 'guest@sensesphere.ai', 'guest_pwd_hash', 'user')
    `);
  }

  // Step 1: Secure Identity Isolation (Authentication)
  // Ensure Harsha Naidu exists with hashed password 'vennela@2007'
  try {
    const bcrypt = require('bcryptjs');
    const [adminUser] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', ['naiduharsha2006@gmail.com']);
    const hashedAdminPassword = await bcrypt.hash('vennela@2007', 10);
    if (!adminUser || adminUser.length === 0) {
      await mysqlPool.query(`
        INSERT INTO users (name, email, password_hash, role, status)
        VALUES (?, ?, ?, 'admin', 'active')
      `, ['Harsha Naidu', 'naiduharsha2006@gmail.com', hashedAdminPassword]);
      console.log('✅ Created Administrator account: naiduharsha2006@gmail.com');
    } else {
      await mysqlPool.query(`
        UPDATE users SET role = 'admin', password_hash = ?, status = 'active' WHERE email = ?
      `, [hashedAdminPassword, 'naiduharsha2006@gmail.com']);
    }
  } catch (adminErr) {
    console.warn('Admin user setup notice:', adminErr.message);
  }

  console.log('✅ All MySQL tables and schema verified strictly in MySQL.');
}

// Start database
setupDatabase();

module.exports = {
  query,
  initDB: setupDatabase,
  mysqlPool
};

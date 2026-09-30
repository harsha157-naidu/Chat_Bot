const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_TYPE = (process.env.DB_TYPE || 'mysql').toLowerCase();
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'harsha@2006';
const DB_NAME = process.env.DB_NAME || 'sensesphere_ai';

let mysqlPool = null;
let sqliteDb = null;
let activeEngine = 'none';

// Initialize connection and schema
async function setupDatabase() {
  if (DB_TYPE === 'mysql') {
    try {
      console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
      
      // 1. Ensure database exists
      const rootConn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await rootConn.end();

      // 2. Create connection pool
      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });

      // Test pool
      await mysqlPool.query('SELECT 1');
      activeEngine = 'mysql';
      console.log(`✅ Connected to MySQL database [${DB_NAME}] on ${DB_HOST}:${DB_PORT}.`);

      // Initialize MySQL tables
      await initMySQLTables();
      return;
    } catch (mysqlErr) {
      console.error('⚠️ MySQL connection failed:', mysqlErr.message);
      console.log('Falling back to SQLite temporary backup...');
    }
  }

  // Fallback to SQLite if MySQL fails
  setupSQLite();
}

function setupSQLite() {
  const dbPath = path.resolve(__dirname, '../../database/sensesphere.sqlite');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite fallback:', err.message);
    } else {
      activeEngine = 'sqlite';
      console.log('Connected to SQLite backup database.');
      initSQLiteTables();
    }
  });
}

// Uniform Promise-based query function for all controllers
const query = async (sql, params = []) => {
  if (activeEngine === 'mysql' && mysqlPool) {
    try {
      const [results] = await mysqlPool.execute(sql, params);
      
      // If it's a SELECT query, return the rows array
      if (Array.isArray(results)) {
        return results;
      }
      
      // For INSERT / UPDATE / DELETE, provide both MySQL & SQLite compatibility properties
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
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      const isSelect = /^\s*SELECT/i.test(sql);
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({
            insertId: this.lastID,
            lastID: this.lastID,
            affectedRows: this.changes,
            changes: this.changes
          });
        });
      }
    });
  } else {
    throw new Error('No active database connection available.');
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

  // Seed developer profile if empty
  const [profiles] = await mysqlPool.query('SELECT * FROM developer_profile LIMIT 1');
  if (!profiles || profiles.length === 0) {
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
      'The system uses frontend web technologies, backend APIs, AI services, computer vision, speech processing, MySQL, cloud storage, and authentication services.'
    ]);
    console.log('Seeded developer profile into MySQL.');
  }

  // Ensure default guest user exists (id: 1)
  const [users] = await mysqlPool.query('SELECT * FROM users WHERE id = 1');
  if (!users || users.length === 0) {
    await mysqlPool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (1, 'Guest User', 'guest@sensesphere.ai', 'guest_pwd_hash', 'user')
    `);
  }

  console.log('✅ All MySQL tables and initial records verified.');
}

// SQLite fallback initializer
async function initSQLiteTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        profile_image TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT 'New Conversation',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message_text TEXT NOT NULL,
        message_type TEXT NOT NULL DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        chat_id INTEGER,
        message_id INTEGER,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        cloud_provider TEXT DEFAULT 'local',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ai_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        model_name TEXT NOT NULL DEFAULT 'SenseSphere-Omni-v1',
        response_text TEXT NOT NULL,
        processing_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        voice_enabled INTEGER DEFAULT 0,
        theme TEXT DEFAULT 'dark',
        language TEXT DEFAULT 'en-US',
        speech_rate REAL DEFAULT 1.0,
        speech_pitch REAL DEFAULT 1.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS developer_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        education TEXT NOT NULL,
        institution TEXT NOT NULL,
        project_name TEXT NOT NULL,
        description TEXT NOT NULL,
        purpose TEXT NOT NULL,
        technologies TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const profile = await query('SELECT * FROM developer_profile LIMIT 1');
    if (!profile || profile.length === 0) {
      await query(`
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
        'The system uses frontend web technologies, backend APIs, AI services, computer vision, speech processing, MySQL, cloud storage, and authentication services.'
      ]);
    }

    const defaultUser = await query('SELECT * FROM users WHERE id = 1');
    if (!defaultUser || defaultUser.length === 0) {
      await query(`
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (1, 'Guest User', 'guest@sensesphere.ai', 'guest_pwd_hash', 'user')
      `);
    }
  } catch (err) {
    console.error('Error initializing SQLite tables:', err);
  }
}

// Start database
setupDatabase();

module.exports = {
  query,
  initDB: setupDatabase
};

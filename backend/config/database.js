import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'darshansetu',
  port: Number(process.env.DB_PORT || 5432),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000
});

const normalizeSql = (sql, params = []) => {
  let statement = String(sql || '').trim();
  statement = statement.replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT INTO');
  statement = statement.replace(/\bDELETE\s+(\w+)\s+FROM\b/gi, 'DELETE FROM');

  if (Array.isArray(params) && params.length > 0) {
    let paramIndex = 0;
    statement = statement.replace(/\?/g, () => {
      paramIndex += 1;
      return `$${paramIndex}`;
    });
  }

  if (/^INSERT\s+INTO\s+/i.test(statement) && !/RETURNING\b/i.test(statement)) {
    statement = `${statement} RETURNING *`;
  }

  return { sql: statement, params };
};

const normalizeResult = (result) => {
  if (!result || typeof result !== 'object') {
    return [[], []];
  }

  const selectLike = ['SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
  if (selectLike.includes(result.command?.toUpperCase?.() || '')) {
    return [result.rows || [], result.fields || []];
  }

  const affectedRows = Number(result.rowCount ?? 0);
  const insertId = result.rows && result.rows.length > 0 ? result.rows[0].id ?? null : null;

  return [{
    affectedRows,
    insertId,
    rowCount: affectedRows,
    changedRows: affectedRows,
    warningStatus: 0
  }, result.fields || []];
};

const originalPoolQuery = pool.query.bind(pool);
pool.query = async (sql, params = []) => {
  const { sql: normalizedSql, params: normalizedParams } = normalizeSql(sql, params);
  const result = await originalPoolQuery(normalizedSql, normalizedParams);
  return normalizeResult(result);
};

const originalPoolConnect = pool.connect.bind(pool);
pool.connect = async () => {
  const client = await originalPoolConnect();
  const originalClientQuery = client.query.bind(client);
  client.query = async (sql, params = []) => {
    const { sql: normalizedSql, params: normalizedParams } = normalizeSql(sql, params);
    const result = await originalClientQuery(normalizedSql, normalizedParams);
    return normalizeResult(result);
  };
  return client;
};

pool.getConnection = async () => pool.connect();

export const testConnection = async () => {
  try {
    const dbHost = process.env.DB_HOST?.trim();
    const dbUser = process.env.DB_USER?.trim();
    const dbName = process.env.DB_NAME?.trim();

    if (!dbHost || dbHost.includes('your-render-mysql-host') || (dbHost === 'localhost' && !process.env.DB_PASSWORD)) {
      throw new Error('DB_HOST is not configured for PostgreSQL. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your Render environment variables.');
    }

    if (!dbUser || !dbName || process.env.DB_PASSWORD === undefined) {
      throw new Error('PostgreSQL environment is incomplete. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME before deploying.');
    }

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export const ensureStaffSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS staff_profiles (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      temple_id INTEGER NOT NULL,
      staff_id VARCHAR(20) NOT NULL UNIQUE,
      staff_role VARCHAR(30) NOT NULL DEFAULT 'Support' CHECK (staff_role IN ('Security', 'Medical', 'Administration', 'Crowd Control', 'Parking', 'Queue Management', 'Support')),
      assigned_zone VARCHAR(100) DEFAULT 'Main Entrance',
      shift_start TIME NOT NULL,
      shift_end TIME NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'Available' CHECK (status IN ('Active', 'Available', 'On Break', 'Emergency Deployment', 'Off Duty')),
      assignment VARCHAR(100) DEFAULT 'Regular Duty',
      priority VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      deployment_notes TEXT,
      current_location VARCHAR(100),
      emergency_contact VARCHAR(20),
      joining_date DATE,
      last_deployment TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS staff_deployments (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      deployment_id VARCHAR(30) NOT NULL UNIQUE,
      staff_profile_id INTEGER NOT NULL,
      incident_id VARCHAR(50),
      zone VARCHAR(100) NOT NULL,
      assignment VARCHAR(100) NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      notes TEXT,
      deployed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deployed_by INTEGER,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
      FOREIGN KEY (staff_profile_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (deployed_by) REFERENCES users(id) ON DELETE SET NULL
    )`);

    await client.query(`INSERT INTO users (name, email, phone, role)
      VALUES
        ('Amit Kumar', 'amit.staff@darshansetu.com', '9876500001', 'staff'),
        ('Pooja Rao', 'pooja.staff@darshansetu.com', '9876500002', 'staff'),
        ('Ravi Das', 'ravi.staff@darshansetu.com', '9876500003', 'staff'),
        ('Neha Sharma', 'neha.staff@darshansetu.com', '9876500004', 'staff'),
        ('Vikram Singh', 'vikram.staff@darshansetu.com', '9876500005', 'staff'),
        ('Meera Joshi', 'meera.staff@darshansetu.com', '9876500006', 'staff')
      ON CONFLICT (email) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-001', 'Security', 'Gate 3', '08:00:00', '16:00:00', 'Active', 'Gate Security', 'HIGH', 'Gate 3', '9876511001', '2023-04-12'
      FROM users u WHERE u.phone = '9876500001'
      ON CONFLICT (user_id) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-014', 'Medical', 'Main Entrance', '12:00:00', '20:00:00', 'On Break', 'Medical Support', 'MEDIUM', 'Staff Room', '9876511002', '2023-07-19'
      FROM users u WHERE u.phone = '9876500002'
      ON CONFLICT (user_id) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-022', 'Security', 'Queue Zone B', '16:00:00', '00:00:00', 'Emergency Deployment', 'Emergency Response', 'CRITICAL', 'Queue Zone B', '9876511003', '2024-01-08'
      FROM users u WHERE u.phone = '9876500003'
      ON CONFLICT (user_id) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-031', 'Crowd Control', 'Gate 2', '06:00:00', '14:00:00', 'Available', 'Crowd Control', 'MEDIUM', 'Operations Desk', '9876511004', '2024-02-14'
      FROM users u WHERE u.phone = '9876500004'
      ON CONFLICT (user_id) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-044', 'Parking', 'Parking A', '08:00:00', '16:00:00', 'Active', 'Parking Management', 'LOW', 'Parking A', '9876511005', '2024-03-21'
      FROM users u WHERE u.phone = '9876500005'
      ON CONFLICT (user_id) DO NOTHING`);

    await client.query(`INSERT INTO staff_profiles (user_id, temple_id, staff_id, staff_role, assigned_zone, shift_start, shift_end, status, assignment, priority, current_location, emergency_contact, joining_date)
      SELECT u.id, 1, 'ST-052', 'Support', 'Temple Courtyard', '10:00:00', '18:00:00', 'Off Duty', 'Regular Duty', 'LOW', 'Off Duty', '9876511006', '2024-05-03'
      FROM users u WHERE u.phone = '9876500006'
      ON CONFLICT (user_id) DO NOTHING`);
  } finally {
    client.release();
  }
};

export default pool;

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import schema from './schema.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL
  || process.env.DATABASE_POSTGRES_URL
  || process.env.DATABASE_POSTGRES_URL_NON_POOLING;
const migrationConnectionString = process.env.DATABASE_URL_UNPOOLED
  || process.env.DATABASE_POSTGRES_URL_NON_POOLING
  || connectionString;

const pool = new Pool({
  ...(connectionString ? { connectionString } : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'darshansetu',
    port: Number(process.env.DB_PORT || 5432)
  }),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  statement_timeout: 15000,
  lock_timeout: 5000
});

const normalizeSql = (sql, params = []) => {
  let statement = String(sql || '').trim();
  const ignoredInsert = /^INSERT\s+IGNORE\s+INTO\b/i.test(statement);
  statement = statement.replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT INTO');
  statement = statement.replace(/\bDELETE\s+(\w+)\s+FROM\b/gi, 'DELETE FROM');
  statement = statement.replace(/DATE_FORMAT\(([^,]+),\s*'[^']+'\)/gi, "TO_CHAR($1, 'YYYY-MM-DD')");
  statement = statement.replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE');
  statement = statement.replace(/\bHOUR\(NOW\(\)\)/gi, 'EXTRACT(HOUR FROM CURRENT_TIMESTAMP)::int');
  statement = statement.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP');

  if (Array.isArray(params) && params.length > 0) {
    let paramIndex = 0;
    statement = statement.replace(/\?/g, () => {
      paramIndex += 1;
      return `$${paramIndex}`;
    });
  }

  if (ignoredInsert && !/ON\s+CONFLICT\b/i.test(statement)) {
    statement = `${statement} ON CONFLICT DO NOTHING`;
  }

  if (/^INSERT\s+INTO\s+/i.test(statement) && !/RETURNING\b/i.test(statement) && !/ON\s+CONFLICT\s+DO\s+NOTHING$/i.test(statement)) {
    statement = `${statement} RETURNING *`;
  }

  return { sql: statement, params };
};

const normalizeResult = (result, sql = '') => {
  if (!result || typeof result !== 'object') {
    return [[], []];
  }

  const command = result.command?.toUpperCase?.() || '';
  const isReadQuery = /^(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN)\b/i.test(String(sql).trim());
  const selectLike = ['SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
  if (isReadQuery || selectLike.includes(command) || (Array.isArray(result.rows) && !['INSERT', 'UPDATE', 'DELETE'].includes(command))) {
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

const resultRows = (result) => Array.isArray(result) ? result[0] || [] : result?.rows || [];

const originalPoolQuery = pool.query.bind(pool);
pool.query = async (sql, params = []) => {
  const { sql: normalizedSql, params: normalizedParams } = normalizeSql(sql, params);
  const result = await originalPoolQuery(normalizedSql, normalizedParams);
  return normalizeResult(result, normalizedSql);
};

const originalPoolConnect = pool.connect.bind(pool);
pool.connect = async () => {
  const client = await originalPoolConnect();
  const originalClientQuery = client.query.bind(client);
  client.query = async (sql, params = []) => {
    const { sql: normalizedSql, params: normalizedParams } = normalizeSql(sql, params);
    const result = await originalClientQuery(normalizedSql, normalizedParams);
    return normalizeResult(result, normalizedSql);
  };

  client.beginTransaction = async () => client.query('BEGIN');
  client.commit = async () => client.query('COMMIT');
  client.rollback = async () => client.query('ROLLBACK');

  return client;
};

pool.getConnection = async () => pool.connect();

export const testConnection = async () => {
  try {
    const hasConnectionString = Boolean(
      process.env.DATABASE_POSTGRES_URL
      || process.env.DATABASE_URL
      || process.env.DATABASE_POSTGRES_URL_NON_POOLING
    );
    const dbHost = process.env.DB_HOST?.trim();
    const dbUser = process.env.DB_USER?.trim();
    const dbName = process.env.DB_NAME?.trim();

    if (!hasConnectionString && (!dbHost || dbHost.includes('your-render-mysql-host') || (dbHost === 'localhost' && !process.env.DB_PASSWORD))) {
      throw new Error('DB_HOST is not configured for PostgreSQL. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your Render environment variables.');
    }

    if (!hasConnectionString && (!dbUser || !dbName || process.env.DB_PASSWORD === undefined)) {
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

let initializationPromise;

export const initializeDatabase = () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const client = migrationConnectionString
        ? new pg.Client({
            connectionString: migrationConnectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 20000,
            statement_timeout: 15000,
            lock_timeout: 5000
          })
        : await originalPoolConnect();
      if (migrationConnectionString) await client.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(117979989)');

        const schemaState = await client.query("SELECT to_regclass('public.users') AS users");
        if (!resultRows(schemaState)[0]?.users) {
          await client.query(schema);
        }

        const tablesState = await client.query("SELECT to_regclass('public.temples') AS temples, to_regclass('public.darshan_types') AS darshan_types");
        const tableRows = resultRows(tablesState);
        if (!tableRows[0]?.temples || !tableRows[0]?.darshan_types) {
          await client.query(schema);
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        if (migrationConnectionString) {
          await client.end();
        } else {
          client.release();
        }
      }

      await ensureStaffSchema();
      await ensureDefaultAdmin();
      await ensureCoreTempleSeed();
    })().catch(error => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
};

export const ensureCoreTempleSeed = async () => {
  const client = await originalPoolConnect();
  try {
    const templeCount = await client.query('SELECT COUNT(*)::int AS count FROM temples');
    const templeRows = resultRows(templeCount);

    if ((templeRows[0]?.count ?? 0) > 0) {
      return;
    }

    await client.query(`INSERT INTO temples (name, location, capacity, description)
      VALUES
        ('Banke Bihari Temple', 'Vrindavan', 10000, 'Ancient temple dedicated to Lord Krishna'),
        ('Dauji Temple', 'Baldeo', 8000, 'Shiva temple with historical significance'),
        ('Dwarkadhish Temple', 'Mathura', 12000, 'Grand temple of Lord Krishna'),
        ('Giriraj Ji Temple', 'Govardhan', 6000, 'Sacred mountain temple'),
        ('Prem Mandir', 'Vrindavan', 9000, 'Modern architectural marvel'),
        ('Radha Rani Temple', 'Barsana', 7000, 'Devotion to Radha Ji'),
        ('Shri Krishna Janmabhoomi', 'Mathura', 15000, 'Birthplace of Lord Krishna')
      ON CONFLICT (name) DO NOTHING`);

    await client.query(`INSERT INTO darshan_types (temple_id, name, description, price, duration_minutes)
      SELECT t.id, values.name, values.description, values.price, values.duration_minutes
      FROM temples t
      CROSS JOIN (VALUES
        ('Regular Darshan', 'Standard darshan experience', 0, 30),
        ('VIP Darshan', 'Priority access with less waiting', 500, 30),
        ('Special Pooja Darshan', 'Includes special prayers', 1000, 45)
      ) AS values(name, description, price, duration_minutes)
      WHERE NOT EXISTS (SELECT 1 FROM darshan_types d WHERE d.temple_id = t.id AND d.name = values.name)`);

    await client.query(`INSERT INTO gates (temple_id, name, capacity, current_crowd, risk_level)
      SELECT t.id, values.name, values.capacity, values.current_crowd, values.risk_level
      FROM temples t
      CROSS JOIN (VALUES
        ('Gate A', 2000, 0, 'safe'),
        ('Gate B', 1800, 0, 'safe'),
        ('Gate C', 2000, 0, 'safe'),
        ('Gate D', 2200, 0, 'safe')
      ) AS values(name, capacity, current_crowd, risk_level)
      WHERE NOT EXISTS (SELECT 1 FROM gates g WHERE g.temple_id = t.id AND g.name = values.name)`);

    await client.query(`INSERT INTO parking (temple_id, name, capacity, occupied, available, occupancy_percentage)
      SELECT t.id, 'Parking A', 500, 0, 500, 0
      FROM temples t
      WHERE NOT EXISTS (SELECT 1 FROM parking p WHERE p.temple_id = t.id AND p.name = 'Parking A')`);
  } finally {
    client.release();
  }
};

export const ensureStaffSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`INSERT INTO temples (name, location, capacity, description)
      VALUES
        ('Banke Bihari Temple', 'Vrindavan', 10000, 'Ancient temple dedicated to Lord Krishna'),
        ('Dauji Temple', 'Baldeo', 8000, 'Shiva temple with historical significance'),
        ('Dwarkadhish Temple', 'Mathura', 12000, 'Grand temple of Lord Krishna'),
        ('Giriraj Ji Temple', 'Govardhan', 6000, 'Sacred mountain temple'),
        ('Prem Mandir', 'Vrindavan', 9000, 'Modern architectural marvel'),
        ('Radha Rani Temple', 'Barsana', 7000, 'Devotion to Radha Ji'),
        ('Shri Krishna Janmabhoomi', 'Mathura', 15000, 'Birthplace of Lord Krishna')
      ON CONFLICT (name) DO NOTHING`);

    await client.query(`INSERT INTO darshan_types (temple_id, name, description, price, duration_minutes)
      SELECT t.id, values.name, values.description, values.price, values.duration_minutes
      FROM temples t
      CROSS JOIN (VALUES
        ('Regular Darshan', 'Standard darshan experience', 0, 30),
        ('VIP Darshan', 'Priority access with less waiting', 500, 30),
        ('Special Pooja Darshan', 'Includes special prayers', 1000, 45)
      ) AS values(name, description, price, duration_minutes)
      WHERE NOT EXISTS (SELECT 1 FROM darshan_types d WHERE d.temple_id = t.id)`);

    await client.query(`INSERT INTO gates (temple_id, name, capacity, current_crowd, risk_level)
      SELECT t.id, values.name, values.capacity, values.current_crowd, values.risk_level
      FROM temples t
      CROSS JOIN (VALUES
        ('Gate A', 2000, 0, 'safe'),
        ('Gate B', 1800, 0, 'safe'),
        ('Gate C', 2000, 0, 'safe'),
        ('Gate D', 2200, 0, 'safe')
      ) AS values(name, capacity, current_crowd, risk_level)
      WHERE NOT EXISTS (SELECT 1 FROM gates g WHERE g.temple_id = t.id)`);

    await client.query(`INSERT INTO parking (temple_id, name, capacity, occupied, available, occupancy_percentage)
      SELECT t.id, 'Parking A', 500, 0, 500, 0
      FROM temples t
      WHERE NOT EXISTS (SELECT 1 FROM parking p WHERE p.temple_id = t.id)`);

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

export const ensureDefaultAdmin = async () => {
  const client = await pool.connect();
  try {
    await client.query(`INSERT INTO users (name, email, password, phone, role)
      VALUES ('Admin User', 'admin@darshansetu.com', '$2a$10$.3W4Xu6IVf4Q5v8OvvKQn.aOHRuc1apnMqi2XFk7CjoJlqJvqpLAC', '9876543210', 'admin')
      ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role`);
  } finally {
    client.release();
  }
};

export default pool;

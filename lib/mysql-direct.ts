/**
 * Direct MySQL Connection (ไม่ผ่าน Prisma)
 * ใช้สำหรับ query ที่ซับซ้อนหรือต้องการ performance สูง
 */

import mysql from 'mysql2/promise';

// Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'KKiabkob',
  database: process.env.DB_NAME || 'thai_mooc',
  waitForConnections: true,
  connectionLimit: 20, // เพิ่มจาก 10 เป็น 20
  maxIdle: 10, // จำนวน idle connections สูงสุด
  idleTimeout: 60000, // 60 วินาที - ปิด connection ที่ idle
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000, // 10 วินาที
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Execute raw SQL query
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('MySQL Query Error:', error);
    throw error;
  }
}

/**
 * Execute query and return first row
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  try {
    const [rows] = await pool.execute(sql, params);
    const result = rows as T[];
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('MySQL Query Error:', error);
    throw error;
  }
}

/**
 * Execute insert/update/delete query
 */
export async function execute(
  sql: string,
  params?: any[]
): Promise<mysql.ResultSetHeader> {
  try {
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error) {
    console.error('MySQL Execute Error:', error);
    throw error;
  }
}

/**
 * Transaction helper
 */
export async function transaction<T>(
  callback: (execute: (sql: string, params?: any[]) => Promise<mysql.ResultSetHeader>) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Create execute function for this transaction
    const executeInTransaction = async (sql: string, params?: any[]): Promise<mysql.ResultSetHeader> => {
      const [result] = await connection.execute(sql, params);
      return result as mysql.ResultSetHeader;
    };

    const result = await callback(executeInTransaction);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get connection from pool (for complex operations)
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection();
}

/**
 * Close pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

// Export pool for advanced usage
export { pool };

export default {
  query,
  queryOne,
  execute,
  transaction,
  getConnection,
  closePool,
  pool,
};

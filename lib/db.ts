import mysql from "mysql2/promise";

// Configuration for single connections
const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "8081"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "rootpassword",
  database: process.env.DATABASE_NAME || "contract",
  // Remove these - they're not valid for single connections
  // acquireTimeout: 60000,
  // timeout: 60000,
};

// Configuration for connection pool (if you want to use pool)
const poolConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "8081"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "rootpassword",
  database: process.env.DATABASE_NAME || "contract",
  //   waitForConnections: true,
  //   connectionLimit: 10,
  //   queueLimit: 0,
  //   acquireTimeout: 60000,  // These are valid for pools
  //   timeout: 60000,
  //   idleTimeout: 600000,
  //   enableKeepAlive: true,
  //   keepAliveInitialDelay: 0,
};

// Single connection function
export async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

// Connection pool (recommended for production)
export const pool = mysql.createPool(poolConfig);

// Helper function to execute queries with pool
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Query execution failed:", error);
    throw error;
  }
}

// Helper function to get a connection from pool
export async function getPoolConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Failed to get pool connection:", error);
    throw error;
  }
}

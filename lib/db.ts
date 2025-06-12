import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "8081"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "rootpassword",
  database: process.env.DATABASE_NAME || "contract",
};

const poolConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "8081"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "rootpassword",
  database: process.env.DATABASE_NAME || "contract",
};

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

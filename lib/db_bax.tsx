import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export const createConnection = async (): Promise<mysql.Connection> => {
    if (!connection) {
        try {
            connection = await mysql.createConnection({
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '8082'),
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
            });
        } catch (error) {
            console.error('Failed to create database connection:', error);
            throw error;
        }
    }
    
    return connection;
};
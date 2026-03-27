import mysql from "mysql2/promise";
import { AUTH_MYSQL_HOST, AUTH_MYSQL_PORT, AUTH_MYSQL_USER, AUTH_MYSQL_PASSWORD, AUTH_MYSQL_DATABASE } from "../config";
import type { User } from "./types";

let pool: mysql.Pool | null = null;

export function initMySQLClient(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: AUTH_MYSQL_HOST,
      port: AUTH_MYSQL_PORT,
      user: AUTH_MYSQL_USER,
      password: AUTH_MYSQL_PASSWORD,
      database: AUTH_MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    throw new Error("MySQL client not initialized. Call initMySQLClient first.");
  }
  return pool;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  role: "admin" | "user"
): Promise<User> {
  const pool = getMySQLPool();
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 15);
  const [result] = await pool.execute(
    "INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
    [id, username, passwordHash, role]
  );
  const user = await getUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateLastLogin(userId: string): Promise<void> {
  const pool = getMySQLPool();
  await pool.execute(
    "UPDATE users SET last_login_at = NOW() WHERE id = ?",
    [userId]
  );
}

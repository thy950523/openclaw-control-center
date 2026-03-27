import { existsSync } from "node:fs";
import { join } from "node:path";

const DOTENV_PATH = join(process.cwd(), ".env");

if (existsSync(DOTENV_PATH)) {
  process.loadEnvFile?.(DOTENV_PATH);
}

export const GATEWAY_URL = readStringEnv(process.env.GATEWAY_URL, "ws://127.0.0.1:18789");

// Auth configuration
export const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
export const AUTH_PROVIDER = process.env.AUTH_PROVIDER || "supabase"; // "supabase" or "mysql"
export const AUTH_SUPABASE_URL = process.env.AUTH_SUPABASE_URL || "";
export const AUTH_SUPABASE_KEY = process.env.AUTH_SUPABASE_KEY || "";
export const AUTH_REDIS_HOST = readStringEnv(process.env.AUTH_REDIS_HOST, "127.0.0.1");
export const AUTH_REDIS_PORT = parsePositiveInt(process.env.AUTH_REDIS_PORT, 6379);
export const AUTH_REDIS_PASSWORD = process.env.AUTH_REDIS_PASSWORD || "";

// MySQL configuration
export const AUTH_MYSQL_HOST = readStringEnv(process.env.AUTH_MYSQL_HOST, "127.0.0.1");
export const AUTH_MYSQL_PORT = parsePositiveInt(process.env.AUTH_MYSQL_PORT, 3306);
export const AUTH_MYSQL_USER = process.env.AUTH_MYSQL_USER || "root";
export const AUTH_MYSQL_PASSWORD = process.env.AUTH_MYSQL_PASSWORD || "";
export const AUTH_MYSQL_DATABASE = process.env.AUTH_MYSQL_DATABASE || "openclaw_auth";

export const AUTH_SESSION_TTL_SECONDS = parsePositiveInt(process.env.AUTH_SESSION_TTL_SECONDS, 7200); // 2 hours
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "openclaw_session";

export const READONLY_MODE = process.env.READONLY_MODE !== "false";
export const APPROVAL_ACTIONS_ENABLED = process.env.APPROVAL_ACTIONS_ENABLED === "true";
export const APPROVAL_ACTIONS_DRY_RUN = process.env.APPROVAL_ACTIONS_DRY_RUN !== "false";
export const IMPORT_MUTATION_ENABLED = process.env.IMPORT_MUTATION_ENABLED === "true";
export const IMPORT_MUTATION_DRY_RUN = process.env.IMPORT_MUTATION_DRY_RUN === "true";
export const LOCAL_TOKEN_AUTH_REQUIRED = process.env.LOCAL_TOKEN_AUTH_REQUIRED !== "false";
export const LOCAL_API_TOKEN = (process.env.LOCAL_API_TOKEN ?? "").trim();
export const LOCAL_TOKEN_HEADER = "x-local-token" as const;
export const TASK_HEARTBEAT_ENABLED = process.env.TASK_HEARTBEAT_ENABLED !== "false";
export const TASK_HEARTBEAT_DRY_RUN = process.env.TASK_HEARTBEAT_DRY_RUN !== "false";
export const TASK_HEARTBEAT_MAX_TASKS_PER_RUN = parsePositiveInt(
  process.env.TASK_HEARTBEAT_MAX_TASKS_PER_RUN,
  3,
);

export const POLLING_INTERVALS_MS = {
  sessionsList: 10000,
  sessionStatus: 2000,
  cron: 10000,
  approvals: 2000,
  canvas: 5000,
} as const;

export type PollingTarget = keyof typeof POLLING_INTERVALS_MS;

function parsePositiveInt(input: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(input ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function readStringEnv(input: string | undefined, fallback: string): string {
  const value = (input ?? "").trim();
  return value === "" ? fallback : value;
}

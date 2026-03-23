import { existsSync } from "node:fs";
import { join } from "node:path";

const DOTENV_PATH = join(process.cwd(), ".env");

if (existsSync(DOTENV_PATH)) {
  process.loadEnvFile?.(DOTENV_PATH);
}

import { createUserAccount, getUserByUsername, initSupabaseClient, initRedisClient } from "../src/auth";
import {
  AUTH_ENABLED,
  AUTH_REDIS_HOST,
  AUTH_REDIS_PASSWORD,
  AUTH_REDIS_PORT,
  AUTH_SESSION_TTL_SECONDS,
  AUTH_SUPABASE_URL,
  AUTH_SUPABASE_KEY,
} from "../src/config";

interface CLIArgs {
  username?: string;
  password?: string;
  role?: "admin" | "user";
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--username" && i + 1 < argv.length) {
      args.username = argv[++i];
    } else if (arg === "--password" && i + 1 < argv.length) {
      args.password = argv[++i];
    } else if (arg === "--role" && i + 1 < argv.length) {
      args.role = argv[++i] as "admin" | "user";
    }
  }

  return args;
}

async function main() {
  if (!AUTH_ENABLED) {
    console.error("Error: AUTH_ENABLED is not set to 'true' in environment");
    console.error("Please set AUTH_ENABLED=true in your .env file");
    process.exit(1);
  }

  if (!AUTH_SUPABASE_URL || !AUTH_SUPABASE_KEY) {
    console.error("Error: AUTH_SUPABASE_URL and AUTH_SUPABASE_KEY must be configured");
    process.exit(1);
  }

  // Initialize clients
  initSupabaseClient({
    supabaseUrl: AUTH_SUPABASE_URL,
    supabaseKey: AUTH_SUPABASE_KEY,
    redisHost: AUTH_REDIS_HOST,
    redisPort: AUTH_REDIS_PORT,
    redisPassword: AUTH_REDIS_PASSWORD,
    sessionTtlSeconds: AUTH_SESSION_TTL_SECONDS,
    cookieName: "openclaw_session",
  });

  initRedisClient({
    supabaseUrl: AUTH_SUPABASE_URL,
    supabaseKey: AUTH_SUPABASE_KEY,
    redisHost: AUTH_REDIS_HOST,
    redisPort: AUTH_REDIS_PORT,
    redisPassword: AUTH_REDIS_PASSWORD,
    sessionTtlSeconds: AUTH_SESSION_TTL_SECONDS,
    cookieName: "openclaw_session",
  });

  const args = parseArgs();
  const username = args.username || "admin";
  const password = args.password || "admin123";
  const role = args.role || "admin";

  // Check if user already exists
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    console.log(`User '${username}' already exists with role '${existingUser.role}'`);
    console.log("Use a different username or update directly in database");
    process.exit(0);
  }

  // Create the user
  console.log(`Creating user '${username}' with role '${role}'...`);
  const user = await createUserAccount(username, password, role);
  console.log(`User created successfully!`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Role: ${user.role}`);
}

main().catch((error) => {
  console.error("Failed to initialize admin user:", error);
  process.exit(1);
});

import { AUTH_REDIS_HOST, AUTH_REDIS_PORT, AUTH_REDIS_PASSWORD } from "../config";
import Redis from "ioredis";
import { randomUUID } from "node:crypto";
import type { AuthConfig, Session, UserPublic } from "./types";

let redisClient: Redis | null = null;

// Simple session verification cache (5 second TTL)
const sessionCache = new Map<string, { valid: boolean; user?: UserPublic; expiresAt: number }>();
const CACHE_TTL_MS = 5000;

export function initRedisClient(config: AuthConfig): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword || undefined,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });
  }
  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call initRedisClient first.");
  }
  return redisClient;
}

export async function createSession(
  userId: string,
  ttlSeconds: number
): Promise<Session> {
  const redis = getRedisClient();
  const sessionToken = randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const session: Session = {
    id: randomUUID(),
    user_id: userId,
    session_token: sessionToken,
    expires_at: expiresAt,
    created_at: now,
    last_activity_at: now,
  };

  const key = `session:${sessionToken}`;
  await redis.setex(key, ttlSeconds, JSON.stringify(session));

  return session;
}

export async function getSession(sessionToken: string): Promise<Session | null> {
  // Check cache first
  const now = Date.now();
  const cached = sessionCache.get(sessionToken);
  if (cached && cached.expiresAt > now) {
    return cached.valid ? { session_token: sessionToken, user_id: cached.user!.id } as Session : null;
  }

  const redis = getRedisClient();
  const key = `session:${sessionToken}`;
  const data = await redis.get(key);

  if (!data) {
    sessionCache.set(sessionToken, { valid: false, expiresAt: now + CACHE_TTL_MS });
    return null;
  }

  const session = JSON.parse(data) as Session;
  sessionCache.set(sessionToken, {
    valid: true,
    user: { id: session.user_id, username: "", role: "user", last_login_at: null },
    expiresAt: now + CACHE_TTL_MS,
  });
  return session;
}

export async function refreshSession(sessionToken: string, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  const key = `session:${sessionToken}`;
  const data = await redis.get(key);

  if (!data) {
    return;
  }

  const session = JSON.parse(data) as Session;
  session.last_activity_at = new Date().toISOString();

  await redis.setex(key, ttlSeconds, JSON.stringify(session));
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const redis = getRedisClient();
  const key = `session:${sessionToken}`;
  await redis.del(key);
}

export function serializeUserPublic(user: {
  id: string;
  username: string;
  role: "admin" | "user";
  last_login_at: string | null;
}): UserPublic {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    last_login_at: user.last_login_at,
  };
}

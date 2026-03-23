import { getUserByUsername, getUserById, createUser, updateLastLogin } from "./supabase-client";
import { verifyPassword } from "./crypto";
import { createSession, getSession, deleteSession, serializeUserPublic } from "./session-service";
import type { User, UserPublic, LoginRequest, LoginResponse } from "./types";

export async function login(
  request: LoginRequest,
  sessionTtlSeconds: number
): Promise<LoginResponse> {
  const { username, password } = request;

  const user = await getUserByUsername(username);
  if (!user) {
    return { success: false, error: "用户名或密码错误" };
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return { success: false, error: "用户名或密码错误" };
  }

  await createSession(user.id, sessionTtlSeconds);
  await updateLastLogin(user.id);

  const userPublic = serializeUserPublic(user);
  return { success: true, user: userPublic };
}

export async function logout(sessionToken: string): Promise<void> {
  await deleteSession(sessionToken);
}

export async function verifySession(sessionToken: string): Promise<{ valid: boolean; user?: UserPublic }> {
  const session = await getSession(sessionToken);
  if (!session) {
    return { valid: false };
  }

  const user = await getUserById(session.user_id);
  if (!user) {
    return { valid: false };
  }

  return { valid: true, user: serializeUserPublic(user) };
}

export async function getCurrentUser(sessionToken: string): Promise<UserPublic | null> {
  const session = await getSession(sessionToken);
  if (!session) {
    return null;
  }

  const user = await getUserById(session.user_id);
  if (!user) {
    return null;
  }

  return serializeUserPublic(user);
}

export async function createUserAccount(
  username: string,
  password: string,
  role: "admin" | "user"
): Promise<UserPublic> {
  const { hashPassword } = await import("./crypto");
  const passwordHash = await hashPassword(password);
  const user = await createUser(username, passwordHash, role);
  return serializeUserPublic(user);
}

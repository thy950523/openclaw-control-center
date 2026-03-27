import { hashPassword } from "./crypto";
import { createSession, getSession, deleteSession, serializeUserPublic } from "./session-service";
import { AUTH_PROVIDER } from "../config";
import type { UserPublic, LoginRequest, LoginResponse } from "./types";

let userService: any;

async function getUserService() {
  if (!userService) {
    if (AUTH_PROVIDER === "mysql") {
      const mysql = await import("./mysql-client");
      userService = {
        getUserByUsername: mysql.getUserByUsername,
        getUserById: mysql.getUserById,
        createUser: mysql.createUser,
        updateLastLogin: mysql.updateLastLogin,
      };
    } else {
      const supabase = await import("./supabase-client");
      userService = {
        getUserByUsername: supabase.getUserByUsername,
        getUserById: supabase.getUserById,
        createUser: supabase.createUser,
        updateLastLogin: supabase.updateLastLogin,
      };
    }
  }
  return userService;
}

export async function login(
  request: LoginRequest,
  sessionTtlSeconds: number
): Promise<LoginResponse> {
  const { username, password } = request;
  const service = await getUserService();

  const user = await service.getUserByUsername(username);
  if (!user) {
    return { success: false, error: "用户名或密码错误" };
  }

  const { verifyPassword } = await import("./crypto");
  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    return { success: false, error: "用户名或密码错误" };
  }

  await createSession(user.id, sessionTtlSeconds);
  await service.updateLastLogin(user.id);

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

  const service = await getUserService();
  const user = await service.getUserById(session.user_id);
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

  const service = await getUserService();
  const user = await service.getUserById(session.user_id);
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
  const service = await getUserService();
  const passwordHash = await hashPassword(password);
  const user = await service.createUser(username, passwordHash, role);
  return serializeUserPublic(user);
}

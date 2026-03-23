export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  role: UserRole;
  last_login_at: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: UserPublic;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface VerifyResponse {
  valid: boolean;
  user?: UserPublic;
}

export interface AuthConfig {
  supabaseUrl: string;
  supabaseKey: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  sessionTtlSeconds: number;
  cookieName: string;
}

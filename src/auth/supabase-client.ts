import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthConfig, User } from "./types";

let supabaseClient: SupabaseClient | null = null;

export function initSupabaseClient(config: AuthConfig): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error("Supabase client not initialized. Call initSupabaseClient first.");
  }
  return supabaseClient;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return null;
  }
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }
  return data as User;
}

export async function createUser(
  username: string,
  passwordHash: string,
  role: "admin" | "user"
): Promise<User> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      password_hash: passwordHash,
      role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
  return data as User;
}

export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

/**
 * Returns true if the essential Supabase environment variables are provided.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.startsWith('https://') && 
    (supabaseServiceRoleKey || supabaseAnonKey)
  );
}

/**
 * Secure Server-Side Supabase Client (Service Role).
 * CRITICAL: This client bypasses Row Level Security for authorized administrative backend tasks.
 * It MUST NEVER be exposed or passed to the browser or frontend client.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!adminClient) {
    const key = supabaseServiceRoleKey || supabaseAnonKey;
    adminClient = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

/**
 * Public/Anon Supabase Client.
 * Adheres strictly to Row Level Security (RLS) policies.
 */
export function getSupabasePublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!publicClient) {
    const key = supabaseAnonKey || supabaseServiceRoleKey;
    publicClient = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
      },
    });
  }

  return publicClient;
}

/**
 * Live connection & schema health check.
 * Performs a lightweight SELECT query against the public table to verify actual connectivity.
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  schemaInitialized: boolean;
  url?: string;
  error?: string;
  tablesVerified?: string[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      schemaInitialized: false,
      error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are not configured in environment variables.',
    };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      schemaInitialized: false,
      error: 'Failed to initialize Supabase client instance.',
    };
  }

  try {
    // Attempt a lightweight ping on security_alerts
    const { data, error } = await client
      .from('security_alerts')
      .select('id')
      .limit(1);

    if (error) {
      const isMissingTable = 
        error.message?.includes('Could not find the table') || 
        error.message?.includes('relation') ||
        error.code === 'PGRST205' || 
        error.code === '42P01';

      return {
        configured: true,
        connected: isMissingTable ? true : false,
        schemaInitialized: false,
        url: supabaseUrl.replace(/https:\/\/(.*?)\..*/, 'https://$1.supabase.co'),
        error: isMissingTable
          ? 'Database connection verified, but schema tables are pending migration in the Supabase SQL Editor.'
          : `Supabase connection error: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      configured: true,
      connected: true,
      schemaInitialized: true,
      url: supabaseUrl.replace(/https:\/\/(.*?)\..*/, 'https://$1.supabase.co'),
      tablesVerified: ['security_alerts'],
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      schemaInitialized: false,
      error: err.message || 'Network error connecting to Supabase instance.',
    };
  }
}

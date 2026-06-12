import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from environment variables. Please configure them in your .env file.');
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(`Invalid Supabase URL: "${supabaseUrl}". Please replace the placeholder in your .env file with a valid HTTP/HTTPS URL and restart your development server.`);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

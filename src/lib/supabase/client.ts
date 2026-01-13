import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  // Validate that we have real credentials (not placeholders)
  const isPlaceholder = 
    supabaseUrl.includes('placeholder') || 
    supabaseKey.includes('placeholder') ||
    supabaseUrl === 'your-supabase-url' ||
    supabaseKey === 'your-supabase-anon-key';

  if (isPlaceholder) {
    // Use a valid dummy URL format that Supabase will accept during build
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUwNDQ4MDAsImV4cCI6MTk2MDYyMDgwMH0.placeholder'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}

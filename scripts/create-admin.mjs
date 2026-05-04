/**
 * One-off script to create the admin user in Supabase.
 * Run with: node scripts/create-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '1234567890';
const ADMIN_FULL_NAME = 'System Administrator';

async function createAdmin() {
  console.log(`\n🔑 Creating admin user: ${ADMIN_EMAIL}`);

  // 1. Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Skip email confirmation
    user_metadata: { full_name: ADMIN_FULL_NAME, role: 'admin' },
  });

  if (authError) {
    if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
      console.log('ℹ️  Auth user already exists. Checking profile...');

      // Fetch existing user
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = listData.users.find((u) => u.email === ADMIN_EMAIL);
      if (!existing) throw new Error('Could not find existing admin user.');

      await upsertProfile(existing.id);
      return;
    }
    throw authError;
  }

  console.log(`✅ Auth user created: ${authData.user.id}`);
  await upsertProfile(authData.user.id);
}

async function upsertProfile(userId) {
  // 2. Upsert profile row with admin role
  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_FULL_NAME,
      role: 'admin',
      district: 'HQ',
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error('❌ Profile upsert failed:', profileError.message);
    process.exit(1);
  }

  console.log('✅ Profile row upserted with role: admin');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin credentials ready to use:');
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('  Login at: /login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

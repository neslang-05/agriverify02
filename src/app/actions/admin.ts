'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Admin access required');
  return { supabase, user, profile };
}

export async function getSystemUsers(role?: string) {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data || [];
}

export async function createOfficer(formData: FormData) {
  // requireAdmin validates the session and ensures the caller is an admin
  await requireAdmin();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const district = formData.get('district') as string;

  if (!email || !password || !fullName || !district) {
    throw new Error('All fields are required');
  }

  // Use the service-role admin client so that:
  //   1. No confirmation email is sent (avoids the email rate-limit)
  //   2. The account is immediately active (email_confirm: true)
  //   3. RLS is bypassed for the profile upsert
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // skips email confirmation entirely
    user_metadata: {
      full_name: fullName,
      role: 'officer',
    },
  });

  if (error) throw new Error(error.message || 'Failed to create officer');

  if (data.user) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'officer',
        district,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    await logAuditEvent('create_officer', 'user', data.user.id, {
      email,
      full_name: fullName,
      district,
    });
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function updateUserRole(userId: string, role: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error('Error updating role:', error);
    return { success: false, error: 'Failed to update role' };
  }

  await logAuditEvent('update_role', 'user', userId, { new_role: role });
  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }

  await logAuditEvent('delete_user', 'user', userId, {});
  revalidatePath('/admin/users');
  return { success: true };
}

export async function getAuditLogs(limit = 50) {
  const { supabase } = await requireAdmin();

  // Step 1: fetch audit logs without a join (audit_logs.actor_id → auth.users,
  // not public.profiles, so PostgREST cannot resolve the embedded relation)
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, actor_id, actor_role, action, target_type, target_id, details')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  if (!logs || logs.length === 0) return [];

  // Step 2: batch-fetch actor names from profiles using the actor_ids present
  const actorIds = [...new Set(logs.map((l) => l.actor_id).filter(Boolean))];
  let actorMap: Record<string, { full_name?: string; email?: string }> = {};

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', actorIds);

    if (profiles) {
      actorMap = Object.fromEntries(profiles.map((p) => [p.id, { full_name: p.full_name, email: p.email }]));
    }
  }

  // Merge actor info back — preserves the shape the page already expects
  return logs.map((log) => ({
    ...log,
    actor: log.actor_id ? actorMap[log.actor_id] ?? null : null,
  }));
}

export async function logAuditEvent(
  action: string,
  targetType: string,
  targetId: string,
  details?: object
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('logAuditEvent: no authenticated user, skipping audit log for action:', action);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: profile?.role ?? 'unknown',
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ?? {},
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

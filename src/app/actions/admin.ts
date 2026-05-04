'use server';

import { createClient } from '@/lib/supabase/server';
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
  const { supabase, user: adminUser } = await requireAdmin();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const district = formData.get('district') as string;

  if (!email || !password || !fullName || !district) {
    throw new Error('All fields are required');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'officer',
      },
    },
  });

  if (error) throw new Error(error.message || 'Failed to create officer');

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'officer',
        district,
      });

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

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, actor:profiles!actor_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
  return data || [];
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

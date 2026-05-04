'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Invalid email or password');
  }

  // Get user profile to determine role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    revalidatePath('/', 'layout');
    
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard');
    } else if (profile?.role === 'officer') {
      redirect('/officer/dashboard');
    } else {
      redirect('/farmer/dashboard');
    }
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || 'farmer';
  const fullName = formData.get('fullName') as string;

  if (!email || !password || !role || !fullName) {
    throw new Error('All fields are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const supabase = await createClient();

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Registration failed');
  }

  if (data.user) {
    // Use the service-role admin client to insert the profile.
    // The anon client cannot do this immediately after signUp() because
    // the new user's JWT is not yet active (email confirmation pending),
    // causing auth.uid() to be null and the RLS INSERT policy to reject it.
    const adminSupabase = createAdminClient();
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
        district: 'Not specified',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Non-fatal: the DB trigger will create the profile as a fallback.
    }

    revalidatePath('/', 'layout');

    if (role === 'admin') {
      redirect('/admin/dashboard');
    } else if (role === 'officer') {
      redirect('/officer/dashboard');
    } else {
      redirect('/farmer/dashboard');
    }
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function updateProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const fullName = formData.get('fullName') as string;
    const district = formData.get('district') as string;

    if (!fullName) {
      return { success: false, error: 'Full name is required' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, district })
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/farmer/profile');
    return { success: true };
  } catch (err) {
    console.error('Error in updateProfile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

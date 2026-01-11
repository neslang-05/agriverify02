'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';

// Demo mode authentication (no actual Supabase calls)
interface DemoUser {
  id: string;
  email: string;
  role: UserRole;
  district: string;
  full_name: string;
}

const DEMO_USERS: Record<string, DemoUser> = {
  'farmer@demo.com': {
    id: '1',
    email: 'farmer@demo.com',
    role: 'farmer',
    district: 'Hyderabad',
    full_name: 'Demo Farmer',
  },
  'officer@demo.com': {
    id: '2',
    email: 'officer@demo.com',
    role: 'officer',
    district: 'Hyderabad',
    full_name: 'Demo Officer',
  },
};

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Demo mode - accept any password for demo users
  const demoUser = DEMO_USERS[email.toLowerCase()];
  
  if (demoUser) {
    const cookieStore = await cookies();
    cookieStore.set('demo_user', JSON.stringify(demoUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    if (demoUser.role === 'farmer') {
      redirect('/farmer/dashboard');
    } else {
      redirect('/officer/dashboard');
    }
  }

  // For non-demo users, create a temporary user
  const role: UserRole = email.includes('officer') ? 'officer' : 'farmer';
  const tempUser: DemoUser = {
    id: crypto.randomUUID(),
    email,
    role,
    district: 'Hyderabad',
    full_name: email.split('@')[0],
  };

  const cookieStore = await cookies();
  cookieStore.set('demo_user', JSON.stringify(tempUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });

  if (role === 'farmer') {
    redirect('/farmer/dashboard');
  } else {
    redirect('/officer/dashboard');
  }
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;
  const district = formData.get('district') as string;
  const fullName = formData.get('fullName') as string;

  const newUser: DemoUser = {
    id: crypto.randomUUID(),
    email,
    role,
    district,
    full_name: fullName,
  };

  const cookieStore = await cookies();
  cookieStore.set('demo_user', JSON.stringify(newUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });

  if (role === 'farmer') {
    redirect('/farmer/dashboard');
  } else {
    redirect('/officer/dashboard');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('demo_user');
  redirect('/login');
}

export async function getCurrentUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('demo_user');

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value) as DemoUser;
  } catch {
    return null;
  }
}

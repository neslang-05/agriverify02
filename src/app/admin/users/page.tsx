import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSystemUsers, deleteUser, updateUserRole } from '@/app/actions/admin';

const roleBadge: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-800',
  officer: 'bg-blue-100 text-blue-800',
  farmer: 'bg-emerald-100 text-emerald-800',
};

export default async function UsersPage() {
  const users = await getSystemUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500 mt-1">All registered accounts</p>
        </div>
        <Link href="/admin/users/create-officer">
          <Button className="rounded-none bg-indigo-800 hover:bg-indigo-700 text-white gap-2">
            <UserPlus className="h-4 w-4" />
            Create Officer
          </Button>
        </Link>
      </div>

      <Card className="rounded-none border border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">District</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((user: {
                  id: string;
                  full_name?: string;
                  email: string;
                  role: string;
                  district?: string;
                  created_at: string;
                }) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {user.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                          roleBadge[user.role] || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{user.district || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.role !== 'admin' && (
                          <form
                            action={async () => {
                              'use server';
                              const newRole = user.role === 'farmer' ? 'officer' : 'farmer';
                              await updateUserRole(user.id, newRole);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="rounded-none text-xs h-7"
                            >
                              Make {user.role === 'farmer' ? 'Officer' : 'Farmer'}
                            </Button>
                          </form>
                        )}
                        {user.role !== 'admin' && (
                          <form
                            action={async () => {
                              'use server';
                              await deleteUser(user.id);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="rounded-none text-xs h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuditLogs } from '@/app/actions/admin';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
        <p className="text-neutral-500 mt-1">Recent system activity trail</p>
      </div>

      <Card className="rounded-none border border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activity ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Actor</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                      No audit logs yet
                    </td>
                  </tr>
                )}
                {logs.map((log: {
                  id: string;
                  created_at: string;
                  actor?: { full_name?: string; email?: string } | null;
                  actor_role?: string;
                  action: string;
                  target_type?: string;
                  target_id?: string;
                  details?: Record<string, unknown>;
                }) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-neutral-800">
                      {log.actor?.full_name || log.actor?.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">
                        {log.actor_role || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{log.action}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {log.target_type ? `${log.target_type}:${log.target_id}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
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

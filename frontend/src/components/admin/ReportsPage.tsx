import React from 'react';
import { useGetReports } from '../../hooks/useReports';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: reports = [] } = useGetReports();

  const { data: isAdmin = false } = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Content Reports</h1>

      {reports.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Reports</h2>
          <p className="text-muted-foreground">There are no reports to review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-destructive">{report.reason}</div>
                    <div className="text-sm text-muted-foreground">
                      Reporter: {report.reporter.toString().slice(0, 10)}...
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(Number(report.timestamp) / 1000000).toLocaleString()}
                  </div>
                </div>
                {report.reportedUser && (
                  <div className="text-sm">
                    Reported User: {report.reportedUser.toString().slice(0, 10)}...
                  </div>
                )}
                {report.reportedPost && (
                  <div className="text-sm">Reported Post: {report.reportedPost}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

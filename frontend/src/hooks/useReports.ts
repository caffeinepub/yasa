import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Report, UserId, PostId } from '../backend';

export function useReportContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportedUser,
      reportedPost,
      reason,
    }: {
      reportedUser: UserId | null;
      reportedPost: PostId | null;
      reason: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportContent(reportedUser, reportedPost, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useGetReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

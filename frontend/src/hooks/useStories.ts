import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story, UserId } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetUserStories(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['userStories', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserStories(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStories'] });
    },
  });
}

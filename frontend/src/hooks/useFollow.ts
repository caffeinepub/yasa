import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserId } from '../backend';
import { Principal } from '@dfinity/principal';

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUser: UserId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(targetUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUser: UserId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(targetUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useGetFollowers(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserId[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowers(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetFollowing(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserId[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowing(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

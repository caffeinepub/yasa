import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PostId } from '../backend';

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicPosts'] });
    },
  });
}

export function useCommentOnPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: PostId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.commentOnPost(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicPosts'] });
    },
  });
}

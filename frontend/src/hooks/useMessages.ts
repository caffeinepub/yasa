import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Message, UserId, MessageId } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetMessages(otherUserId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherUserId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages(Principal.fromText(otherUserId));
    },
    enabled: !!actor && !actorFetching && !!otherUserId,
    refetchInterval: 5000, // Poll every 5 seconds for real-time-like updates
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: UserId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkMessageAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, sender }: { messageId: MessageId; sender: UserId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markMessageAsRead(messageId, sender);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

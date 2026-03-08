import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// This file manages all React Query calls to the backend
export function useQueries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return {
    actor,
    isFetching,
    queryClient,
  };
}

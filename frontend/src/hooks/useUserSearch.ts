import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';
import { useState, useEffect } from 'react';

export function useUserSearch(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery<UserProfile[]>({
    queryKey: ['searchUsers', debouncedTerm],
    queryFn: async () => {
      if (!actor || !debouncedTerm) return [];
      return actor.searchUsers(debouncedTerm);
    },
    enabled: !!actor && !actorFetching && debouncedTerm.length > 0,
  });
}

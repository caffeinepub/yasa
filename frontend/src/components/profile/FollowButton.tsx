import React from 'react';
import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser } from '../../hooks/useFollow';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { UserPlus, UserMinus } from 'lucide-react';

export default function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { identity } = useInternetIdentity();
  const { data: currentProfile } = useGetCallerUserProfile();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnProfile = identity?.getPrincipal().toString() === targetUserId;
  const isFollowing = currentProfile?.following.some(
    (id) => id.toString() === targetUserId
  );

  if (isOwnProfile) return null;

  const handleClick = async () => {
    const targetPrincipal = Principal.fromText(targetUserId);
    if (isFollowing) {
      await unfollowUser.mutateAsync(targetPrincipal);
    } else {
      await followUser.mutateAsync(targetPrincipal);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isFollowing ? 'outline' : 'default'}
      className={isFollowing ? '' : 'gradient-coral-purple hover:opacity-90'}
      disabled={followUser.isPending || unfollowUser.isPending}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetFollowing } from '../../hooks/useFollow';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FollowingModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: following = [] } = useGetFollowing(userId);
  const navigate = useNavigate();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Following</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {following.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              following.map((followingId) => (
                <FollowingItem
                  key={followingId.toString()}
                  userId={followingId.toString()}
                  onClick={() => {
                    navigate({ to: '/profile/$userId', params: { userId: followingId.toString() } });
                    onClose();
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FollowingItem({ userId, onClick }: { userId: string; onClick: () => void }) {
  const { data: profile } = useGetUserProfile(userId);

  if (!profile) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={profile.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
          alt={profile.username}
        />
        <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="text-left">
        <div className="font-medium">{profile.username}</div>
        {profile.bio && <div className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</div>}
      </div>
    </button>
  );
}

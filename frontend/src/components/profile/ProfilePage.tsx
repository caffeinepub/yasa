import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useGetFollowers, useGetFollowing } from '../../hooks/useFollow';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import FollowButton from './FollowButton';
import EditProfileModal from './EditProfileModal';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const { data: followers = [] } = useGetFollowers(userId);
  const { data: following = [] } = useGetFollowing(userId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const isOwnProfile = identity?.getPrincipal().toString() === userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-32 h-32">
            <AvatarImage
              src={profile.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
              alt={profile.username}
            />
            <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => setShowEditModal(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <FollowButton targetUserId={userId} />
              )}
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setShowFollowersModal(true)}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <div className="font-bold text-lg">{followers.length}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </button>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <div className="font-bold text-lg">{following.length}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </button>
            </div>

            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          </div>
        </div>
      </Card>

      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}
      {showFollowersModal && (
        <FollowersModal userId={userId} onClose={() => setShowFollowersModal(false)} />
      )}
      {showFollowingModal && (
        <FollowingModal userId={userId} onClose={() => setShowFollowingModal(false)} />
      )}
    </div>
  );
}

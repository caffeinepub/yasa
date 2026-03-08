import React, { useState } from 'react';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { useGetPublicPosts } from '../../hooks/usePosts';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import CreateStoryModal from './CreateStoryModal';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StoriesBar() {
  const { data: currentProfile } = useGetCallerUserProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="relative">
              <Avatar className="w-16 h-16 ring-2 ring-muted">
                <AvatarImage
                  src={currentProfile?.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
                  alt="Your story"
                />
                <AvatarFallback>{currentProfile?.username?.[0]?.toUpperCase() || 'Y'}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full gradient-coral-purple flex items-center justify-center ring-2 ring-background">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </button>
        </div>
      </ScrollArea>

      {showCreateModal && <CreateStoryModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}

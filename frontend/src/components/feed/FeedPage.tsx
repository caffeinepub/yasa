import React, { useState, useEffect, useRef } from 'react';
import { useGetPublicPosts } from '../../hooks/usePosts';
import PostCard from '../posts/PostCard';
import CreatePostModal from '../posts/CreatePostModal';
import StoriesBar from '../stories/StoriesBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FeedPage() {
  const { data: posts = [], isLoading } = useGetPublicPosts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedPosts < posts.length) {
          setDisplayedPosts((prev) => Math.min(prev + 10, posts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayedPosts, posts.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <StoriesBar />

      <div className="space-y-4">
        {posts.slice(0, displayedPosts).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {displayedPosts < posts.length && (
        <div ref={observerTarget} className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
        </div>
      )}

      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full gradient-coral-purple hover:opacity-90 shadow-lg"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

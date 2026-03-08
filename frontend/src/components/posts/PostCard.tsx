import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useLikePost } from '../../hooks/usePostInteractions';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import type { Post } from '../../backend';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';
import CommentsList from './CommentsList';
import ReportModal from '../reports/ReportModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function PostCard({ post }: { post: Post }) {
  const { data: authorProfile } = useGetUserProfile(post.author.toString());
  const { identity } = useInternetIdentity();
  const likePost = useLikePost();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isLiked = post.likes.some((id) => id.toString() === identity?.getPrincipal().toString());
  const isOwnPost = post.author.toString() === identity?.getPrincipal().toString();

  const handleLike = async () => {
    await likePost.mutateAsync(post.id);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate({ to: '/profile/$userId', params: { userId: post.author.toString() } })}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={authorProfile?.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
                alt={authorProfile?.username || 'User'}
              />
              <AvatarFallback>{authorProfile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">{authorProfile?.username || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</div>
            </div>
          </button>
          {!isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.content && <p className="mb-3 whitespace-pre-wrap">{post.content}</p>}

        {post.media.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((blob, index) => (
              <div key={index} className="rounded-lg overflow-hidden bg-muted aspect-square">
                <img src={blob.getDirectURL()} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? 'text-primary' : ''}
            disabled={likePost.isPending}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="w-5 h-5 mr-1" />
            {post.comments.length}
          </Button>
        </div>
      </div>

      {showComments && <CommentsList post={post} />}
      {showReportModal && (
        <ReportModal
          reportedPost={post.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </Card>
  );
}

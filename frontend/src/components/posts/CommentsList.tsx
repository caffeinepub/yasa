import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCommentOnPost } from '../../hooks/usePostInteractions';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useNavigate } from '@tanstack/react-router';
import type { Post, Comment } from '../../backend';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CommentsList({ post }: { post: Post }) {
  const [newComment, setNewComment] = useState('');
  const commentOnPost = useCommentOnPost();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await commentOnPost.mutateAsync({ postId: post.id, content: newComment.trim() });
    setNewComment('');
  };

  return (
    <div className="border-t bg-muted/30">
      <ScrollArea className="max-h-96 p-4">
        <div className="space-y-3">
          {post.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} navigate={navigate} />
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          className="gradient-coral-purple hover:opacity-90"
          disabled={commentOnPost.isPending || !newComment.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function CommentItem({ comment, navigate }: { comment: Comment; navigate: any }) {
  const { data: authorProfile } = useGetUserProfile(comment.author.toString());

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => navigate({ to: '/profile/$userId', params: { userId: comment.author.toString() } })}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={authorProfile?.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
            alt={authorProfile?.username || 'User'}
          />
          <AvatarFallback>{authorProfile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-2">
          <button
            onClick={() => navigate({ to: '/profile/$userId', params: { userId: comment.author.toString() } })}
            className="font-semibold text-sm hover:underline"
          >
            {authorProfile?.username || 'Unknown'}
          </button>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="text-xs text-muted-foreground mt-1 ml-2">{formatTimestamp(comment.timestamp)}</div>
      </div>
    </div>
  );
}

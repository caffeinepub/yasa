import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMessages, useSendMessage } from '../../hooks/useMessages';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConversationView() {
  const { userId } = useParams({ from: '/messages/$userId' });
  const { identity } = useInternetIdentity();
  const { data: messages = [] } = useGetMessages(userId);
  const { data: otherUserProfile } = useGetUserProfile(userId);
  const sendMessage = useSendMessage();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage.mutateAsync({
      recipient: Principal.fromText(userId),
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const currentUserId = identity?.getPrincipal().toString();

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <button
            onClick={() => navigate({ to: '/profile/$userId', params: { userId } })}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={otherUserProfile?.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
                alt={otherUserProfile?.username || 'User'}
              />
              <AvatarFallback>{otherUserProfile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-semibold">{otherUserProfile?.username || 'Unknown'}</div>
            </div>
          </button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((message) => {
              const isSent = message.sender.toString() === currentUserId;
              return (
                <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSent
                        ? 'gradient-coral-purple text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="gradient-coral-purple hover:opacity-90"
            disabled={sendMessage.isPending || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

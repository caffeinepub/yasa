import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <Card className="p-8 text-center">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
        <p className="text-muted-foreground">
          Send messages to other users from their profile page
        </p>
      </Card>
    </div>
  );
}

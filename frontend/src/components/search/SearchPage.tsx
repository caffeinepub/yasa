import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: results = [], isLoading } = useUserSearch(searchTerm);
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="space-y-2">
        {results.map((profile) => (
          <Card
            key={profile.username}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {
              // We need to find the user's principal ID - for now we'll use a workaround
              // In a real app, the search would return the principal ID
              navigate({ to: '/search' });
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={profile.profilePhoto?.getDirectURL() || '/assets/generated/avatar-placeholder.dim_128x128.png'}
                  alt={profile.username}
                />
                <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{profile.username}</div>
                {profile.bio && <div className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {searchTerm && !isLoading && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No users found</div>
      )}
    </div>
  );
}

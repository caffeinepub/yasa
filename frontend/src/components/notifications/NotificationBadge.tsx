import React from 'react';
import { useGetNotifications } from '../../hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

export default function NotificationBadge() {
  const { data: notifications = [] } = useGetNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  );
}

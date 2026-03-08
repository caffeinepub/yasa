import React from 'react';
import { useGetNotifications, useMarkNotificationAsRead } from '../../hooks/useNotifications';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { data: notifications = [] } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Notifications</h2>
          <p className="text-muted-foreground">You're all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                !notification.isRead ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <p className="text-sm">{notification.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(Number(notification.timestamp) / 1000000).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

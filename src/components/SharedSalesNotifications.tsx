import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getSharedSaleNotifications } from '../lib/supabase';
import SharedSaleNotification from './SharedSaleNotification';

interface SharedSalesNotificationsProps {
  onNotificationAction: () => void;
}

export default function SharedSalesNotifications({ onNotificationAction }: SharedSalesNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    try {
      const data = await getSharedSaleNotifications(session.user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleNotificationAction = () => {
    fetchNotifications();
    onNotificationAction();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <Bell className="h-6 w-6" />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pending Shared Sales
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <SharedSaleNotification
                  key={notification.id}
                  notification={notification}
                  onAction={handleNotificationAction}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
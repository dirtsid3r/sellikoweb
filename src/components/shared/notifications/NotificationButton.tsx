import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import sellikoClient from '@/selliko-client';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { getNotificationRedirectUrl } from '@/lib/getNotificationRedirectUrl';

interface NotificationButtonProps {
  hasNewNotifications: boolean;
}

interface Notification {
  id?: string | number;
  title?: string;
  message?: string;
  content?: string;
  type?: string;
  created_at?: string;
  read?: boolean;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ hasNewNotifications }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await sellikoClient.listenToNotifications();
        if (response.success && response.notifications) {
          setNotifications(response.notifications);
        } else {
          console.error('Failed to fetch notifications:', response.error);
          // Add mock data for testing if API fails
          setNotifications([
            {
              id: 1,
              title: "Welcome to Selliko",
              message: "Your account has been successfully created",
              type: "system",
              created_at: new Date().toISOString(),
              read: false
            },
            {
              id: 2,
              title: "New Order",
              message: "You have received a new order for iPhone 13",
              type: "order",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read: false
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Add mock data for testing on error
        setNotifications([
          {
            id: 1,
            title: "Welcome to Selliko",
            message: "Your account has been successfully created",
            type: "system",
            created_at: new Date().toISOString(),
            read: false
          },
          {
            id: 2,
            title: "New Order",
            message: "You have received a new order for iPhone 13",
            type: "order",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: false
          }
        ]);
      }
    };

    fetchNotifications();

    // Listen for real-time notification updates
    const handleNewNotification = (event: CustomEvent) => {
      console.log('New notification received:', event.detail);
      // Add the new notification to the existing list
      setNotifications(prev => [event.detail.new, ...prev]);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('newNotification', handleNewNotification as EventListener);
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newNotification', handleNewNotification as EventListener);
        // Clean up subscription if it exists
        if ((window as any).sellikoNotificationSubscription) {
          (window as any).sellikoNotificationSubscription.unsubscribe();
          delete (window as any).sellikoNotificationSubscription;
        }
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = async () => {
    // Mark all unread notifications as read
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    try {
      await sellikoClient.markAllNotificationsAsRead();
      console.log('Marked all notifications as read in DB');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const toggleMenu = () => {
    const wasOpen = isOpen;
    setIsOpen(!isOpen);
    
    // Mark all notifications as read when opening the dropdown
    if (!wasOpen) {
      const hasUnread = notifications.some(n => !n.read);
      if (hasUnread) {
        markAllAsRead();
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await sellikoClient.listenToNotifications();
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string | number) => {
    // Optimistically update the UI
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    try {
      await sellikoClient.markNotificationAsRead(notificationId);
      console.log('Marked notification as read in DB:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && notification.id) {
      markAsRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Redirect dynamically based on role and cta/metadata
    const redirectUrl = getNotificationRedirectUrl(notification, user?.role);
    console.log('🔔 [NAVIGATE] Routing notification click to:', redirectUrl);
    router.push(redirectUrl);
  };

  const getNotificationTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
        return <Icons.package className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <Icons.messageCircle className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <Icons.exclamationTriangle className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <Icons.settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Icons.bell className="w-4 h-4 text-primary" />;
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className={cn(
          "relative h-10 w-10 rounded-lg transition-all duration-200 ease-out active:scale-95",
          "hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2",
          hasNewNotifications ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Icons.bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className={cn(
          "fixed md:absolute right-4 md:right-0 md:left-auto top-16 md:top-12 z-50",
          "w-auto md:w-96",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "rounded-xl shadow-lg transition-all duration-200"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <Icons.refresh className={cn(
                "w-4 h-4",
                isRefreshing && "animate-spin"
              )} />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map((notification, index) => (
                  <div
                    key={notification.id || index}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                      !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm font-medium leading-tight break-words whitespace-pre-wrap",
                            !notification.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                          )}>
                            {notification.title || 'Notification'}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words whitespace-pre-wrap">
                          {notification.message || notification.content || 'No content available'}
                        </p>
                        
                        {notification.created_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Icons.bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      You're all caught up!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs font-medium"
                onClick={() => {
                  setIsOpen(false);
                  const role = (user?.role || '').toLowerCase();
                  if (role === 'vendor') {
                    router.push('/vendor');
                  } else if (role === 'admin') {
                    router.push('/admin');
                  } else if (role === 'agent') {
                    router.push('/agent');
                  } else {
                    router.push('/client');
                  }
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
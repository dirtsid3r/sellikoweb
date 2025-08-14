import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface NotificationButtonProps {
  hasNewNotifications: boolean;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ hasNewNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={toggleMenu}
        className={`relative ${hasNewNotifications ? 'text-red-500' : 'text-gray-500'}`}
      >
        <Icons.bell className="w-6 h-6" />
        {hasNewNotifications && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />}
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2">
            <p className="text-sm text-gray-700">Recent Notifications</p>
            {/* Placeholder for notifications */}
            <div className="mt-2">
              <p className="text-xs text-gray-500">No new notifications</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
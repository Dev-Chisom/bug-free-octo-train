import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Creator {
  name: string;
  avatar: string;
}

export interface Notification {
  id: string;
  creator: Creator;
  message: string;
  link?: string;
}

interface NotificationContextType {
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t } = useTranslation();

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const viewContent = useCallback((notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    dismissNotification(notification.id);
  }, [dismissNotification]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => dismissNotification(notification.id), 5000);
  }, [dismissNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 mb-4 animate-fade-in"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img src={notification.creator.avatar} className="h-10 w-10 rounded-full object-cover" alt={notification.creator.name} />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.creator.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                  <div className="mt-4 flex">
                    <button className="text-sm mr-2 text-primary-600" onClick={() => viewContent(notification)}>
                      {t('notifications.view')}
                    </button>
                    <button className="text-sm text-gray-600" onClick={() => dismissNotification(notification.id)}>
                      {t('notifications.dismiss')}
                    </button>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <span className="sr-only">Close</span> <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 
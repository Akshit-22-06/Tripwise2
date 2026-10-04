import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      return;
    }

    const newSocket = io({
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket client bound successfully. ID:', newSocket.id);

      newSocket.emit('join_user', user.id || user._id);
    });

    newSocket.on('notification', (data) => {
      console.log('Real-time notification received:', data);
      setNotifications((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          message: data.message,
          type: data.type || 'SYSTEM',
          createdAt: data.createdAt || new Date(),
          isRead: false,
        },
        ...prev,
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

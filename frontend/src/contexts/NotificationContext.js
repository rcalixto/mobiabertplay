import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [isSupported, setIsSupported] = useState('Notification' in window);
  const [settings, setSettings] = useState({
    newRadios: true,
    favoriteUpdates: true,
    systemAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true
  });

  // Define functions before useEffect
  const notifyNewRadio = (radioName) => {
    if (settings.newRadios) {
      addNotification({
        type: 'newRadios',
        title: 'Nova Rádio Adicionada!',
        message: `${radioName} foi adicionada à plataforma`,
        icon: '📻',
        category: 'info',
        action: () => window.location.href = '/'
      });
    }
  };

  const notifyFavoriteUpdate = (radioName, action) => {
    if (settings.favoriteUpdates) {
      addNotification({
        type: 'favoriteUpdates',
        title: 'Favorito Atualizado',
        message: `${radioName} foi ${action === 'added' ? 'adicionada aos' : 'removida dos'} favoritos`,
        icon: action === 'added' ? '❤️' : '💔',
        category: 'info',
        action: () => window.location.href = '/favoritos'
      });
    }
  };

  const notifySystemAlert = (message, type = 'info') => {
    if (settings.systemAlerts) {
      addNotification({
        type: 'systemAlerts',
        title: 'Alerta do Sistema',
        message: message,
        icon: type === 'error' ? '⚠️' : 'ℹ️',
        category: type,
        action: () => window.location.href = '/admin'
      });
    }
  };

  const notifyCustomization = (message) => {
    if (settings.systemAlerts) {
      addNotification({
        type: 'systemAlerts',
        title: 'Personalização Atualizada',
        message: message,
        icon: '🎨',
        category: 'success',
        action: () => window.location.href = '/customization'
      });
    }
  };

  useEffect(() => {
    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Check for permission changes
    if (isSupported) {
      setPermission(Notification.permission);
    }

    // Expose to window for other contexts
    window.notificationsContext = {
      notifyNewRadio,
      notifyFavoriteUpdate,
      notifySystemAlert,
      notifyCustomization
    };
  }, [isSupported]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notificações ativadas com sucesso!');
        return true;
      } else {
        toast.error('Permissão de notificação negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao ativar notificações');
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    const defaultOptions = {
      body: options.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'mobinabert-play',
      renotify: options.renotify || false,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      data: options.data || {},
      vibrate: settings.vibrationEnabled ? [200, 100, 200] : undefined,
      silent: !settings.soundEnabled
    };

    try {
      const notification = new Notification(title, {
        ...defaultOptions,
        ...options
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (options.onClick) {
          options.onClick(event);
        }
        
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return false;
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    const updatedNotifications = [newNotification, ...notifications.slice(0, 49)]; // Keep only last 50
    saveNotifications(updatedNotifications);

    // Show browser notification if enabled
    if (settings[notification.type] && permission === 'granted') {
      showNotification(notification.title, {
        body: notification.message,
        tag: notification.type,
        data: notification,
        onClick: () => {
          markAsRead(newNotification.id);
          if (notification.action) {
            notification.action();
          }
        }
      });
    }

    return newNotification;
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Predefined notification types
  const notifyNewRadio = (radioName) => {
    if (settings.newRadios) {
      addNotification({
        type: 'newRadios',
        title: 'Nova Rádio Adicionada!',
        message: `${radioName} foi adicionada à plataforma`,
        icon: '📻',
        category: 'info',
        action: () => window.location.href = '/'
      });
    }
  };

  const notifyFavoriteUpdate = (radioName, action) => {
    if (settings.favoriteUpdates) {
      addNotification({
        type: 'favoriteUpdates',
        title: 'Favorito Atualizado',
        message: `${radioName} foi ${action === 'added' ? 'adicionada aos' : 'removida dos'} favoritos`,
        icon: action === 'added' ? '❤️' : '💔',
        category: 'info',
        action: () => window.location.href = '/favoritos'
      });
    }
  };

  const notifySystemAlert = (message, type = 'info') => {
    if (settings.systemAlerts) {
      addNotification({
        type: 'systemAlerts',
        title: 'Alerta do Sistema',
        message: message,
        icon: type === 'error' ? '⚠️' : 'ℹ️',
        category: type,
        action: () => window.location.href = '/admin'
      });
    }
  };

  const notifyCustomization = (message) => {
    if (settings.systemAlerts) {
      addNotification({
        type: 'systemAlerts',
        title: 'Personalização Atualizada',
        message: message,
        icon: '🎨',
        category: 'success',
        action: () => window.location.href = '/customization'
      });
    }
  };

  const value = {
    notifications,
    permission,
    isSupported,
    settings,
    unreadCount: getUnreadCount(),
    requestPermission,
    showNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    // Predefined notifications
    notifyNewRadio,
    notifyFavoriteUpdate,
    notifySystemAlert,
    notifyCustomization
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
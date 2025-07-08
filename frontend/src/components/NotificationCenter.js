import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationCenter = () => {
  const { 
    notifications, 
    permission, 
    isSupported, 
    settings, 
    unreadCount,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action) {
      notification.action();
    }
    
    setIsOpen(false);
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    saveSettings(newSettings);
  };

  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  const getNotificationIcon = (notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.category) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (notification) => {
    switch (notification.category) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Central de Notificações
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4 mt-3">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notificações ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Configurações
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'notifications' ? (
              <div>
                {/* Actions */}
                {notifications.length > 0 && (
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        Marcar todas como lidas
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Limpar todas
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-500 text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 text-xl">
                            {getNotificationIcon(notification)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(notification.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Permission Status */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Status das Notificações
                      </p>
                      <p className="text-xs text-gray-500">
                        {!isSupported ? 'Não suportado' : 
                         permission === 'granted' ? 'Ativado' : 
                         permission === 'denied' ? 'Negado' : 'Pendente'}
                      </p>
                    </div>
                    {isSupported && permission !== 'granted' && (
                      <button
                        onClick={requestPermission}
                        className="px-3 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition-colors"
                      >
                        Ativar
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification Types */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Tipos de Notificação
                  </h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Novas Rádios</span>
                      <input
                        type="checkbox"
                        checked={settings.newRadios}
                        onChange={(e) => handleSettingChange('newRadios', e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Atualizações de Favoritos</span>
                      <input
                        type="checkbox"
                        checked={settings.favoriteUpdates}
                        onChange={(e) => handleSettingChange('favoriteUpdates', e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Alertas do Sistema</span>
                      <input
                        type="checkbox"
                        checked={settings.systemAlerts}
                        onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Sound & Vibration */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Som e Vibração
                  </h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Som</span>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Vibração</span>
                      <input
                        type="checkbox"
                        checked={settings.vibrationEnabled}
                        onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
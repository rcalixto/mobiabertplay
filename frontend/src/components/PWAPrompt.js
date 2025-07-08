import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

const PWAPrompt = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable, 
    installApp, 
    updateApp, 
    shareApp 
  } = usePWA();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Show install prompt after 5 seconds if installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    updateApp();
    setShowUpdatePrompt(false);
  };

  const handleShare = async () => {
    await shareApp();
  };

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Instalar mobinabert PLAY
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Instale o app para acesso rápido e experiência completa
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded hover:from-cyan-600 hover:to-blue-700 transition-colors"
                >
                  Instalar
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                >
                  Agora não
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                Atualização Disponível
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                Nova versão do app disponível
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-white text-blue-600 text-sm rounded hover:bg-gray-100 transition-colors"
                >
                  Atualizar
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="px-3 py-1 text-blue-100 text-sm hover:text-white transition-colors"
                >
                  Depois
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Message */}
      {showOfflineMessage && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-orange-500 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium">Modo Offline</p>
              <p className="text-sm text-orange-100">
                Você está offline. Algumas funcionalidades podem não funcionar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PWA Controls (floating) */}
      {isInstalled && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center space-x-2">
            {navigator.share && (
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Compartilhar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            )}
            
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} title={isOnline ? 'Online' : 'Offline'} />
          </div>
        </div>
      )}
    </>
  );
};

export default PWAPrompt;
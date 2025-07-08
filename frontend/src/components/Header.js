import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCustomization } from '../contexts/CustomizationContext';

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const { customization } = useCustomization();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const logoUrl = customization.logo_url 
    ? `${process.env.REACT_APP_BACKEND_URL}${customization.logo_url}`
    : null;

  return (
    <header 
      className="text-white shadow-lg"
      style={{ 
        background: `linear-gradient(135deg, ${customization.colors.primary}, ${customization.colors.secondary})` 
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11c0-4.97-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider logo-glow">
                {customization.texts.platform_name}
              </h1>
              <p className="text-sm text-cyan-200 font-medium tracking-wide">PLAY</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 7 5 4 5-4" />
                </svg>
                <span>Início</span>
              </span>
            </Link>

            <Link
              to="/favoritos"
              className={`px-4 py-2 rounded-lg transition-colors relative ${
                isActive('/favoritos') 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Favoritos</span>
              </span>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin') 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin</span>
              </span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/customization"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/customization') 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    <span>Customizar</span>
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-cyan-100 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  <span className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sair</span>
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';

const FavoriteButton = ({ radio, variant = 'default', size = 'md' }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isRadioFavorite = isFavorite(radio.id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    toggleFavorite(radio);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return `absolute top-3 left-3 ${getSizeClasses()} rounded-full flex items-center justify-center transition-all duration-300 ${
          isRadioFavorite 
            ? 'bg-red-500 text-white shadow-lg' 
            : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
        }`;
      case 'detail':
        return `${getSizeClasses()} rounded-full flex items-center justify-center transition-all duration-300 ${
          isRadioFavorite 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`;
      default:
        return `${getSizeClasses()} rounded-full flex items-center justify-center transition-all duration-300 ${
          isRadioFavorite 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-400'
        }`;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`${getVariantClasses()} ${isAnimating ? 'animate-pulse scale-110' : 'hover:scale-110'}`}
      title={isRadioFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-label={isRadioFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isRadioFavorite ? (
        // Filled heart
        <svg className={`${getIconSize()} ${isAnimating ? 'animate-bounce' : ''}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        // Outline heart
        <svg className={`${getIconSize()} ${isAnimating ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
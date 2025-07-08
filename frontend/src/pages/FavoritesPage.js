import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import RadioCard from '../components/RadioCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage = () => {
  const { 
    favorites, 
    loading, 
    getFavoritesByGenre, 
    getFavoritesByRegion,
    getRecentFavorites,
    clearAllFavorites,
    favoritesCount 
  } = useFavorites();
  
  const [viewMode, setViewMode] = useState('all'); // 'all', 'genre', 'region', 'recent'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'genre'

  if (loading) {
    return <LoadingSpinner />;
  }

  const getSortedFavorites = () => {
    let sortedFavorites = [...favorites];
    
    switch (sortBy) {
      case 'name':
        sortedFavorites.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'genre':
        sortedFavorites.sort((a, b) => a.genero.localeCompare(b.genero));
        break;
      default: // recent
        sortedFavorites.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
    }
    
    return sortedFavorites;
  };

  const renderFavoritesByCategory = () => {
    if (viewMode === 'genre') {
      const favoritesByGenre = getFavoritesByGenre();
      return Object.entries(favoritesByGenre).map(([genre, radios]) => (
        <div key={genre} className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 mr-3">
              {genre}
            </span>
            <span className="text-gray-500">({radios.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {radios.map((radio) => (
              <RadioCard key={radio.id} radio={radio} />
            ))}
          </div>
        </div>
      ));
    }

    if (viewMode === 'region') {
      const favoritesByRegion = getFavoritesByRegion();
      return Object.entries(favoritesByRegion).map(([region, radios]) => (
        <div key={region} className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-3">
              {region}
            </span>
            <span className="text-gray-500">({radios.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {radios.map((radio) => (
              <RadioCard key={radio.id} radio={radio} />
            ))}
          </div>
        </div>
      ));
    }

    if (viewMode === 'recent') {
      const recentFavorites = getRecentFavorites(10);
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentFavorites.map((radio) => (
            <RadioCard key={radio.id} radio={radio} />
          ))}
        </div>
      );
    }

    // Default view - all favorites
    const sortedFavorites = getSortedFavorites();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedFavorites.map((radio) => (
          <RadioCard key={radio.id} radio={radio} />
        ))}
      </div>
    );
  };

  if (favoritesCount === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Nenhuma rádio favorita ainda
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Comece a adicionar suas rádios favoritas clicando no ícone ❤️ nos cards das rádios que você mais gosta!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Descobrir Rádios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              ❤️ Minhas Rádios Favoritas
            </h1>
            <p className="text-cyan-100">
              {favoritesCount} rádio{favoritesCount > 1 ? 's' : ''} salva{favoritesCount > 1 ? 's' : ''} nos seus favoritos
            </p>
          </div>
          
          {favoritesCount > 0 && (
            <button
              onClick={clearAllFavorites}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpar Todos
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Visualização:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Todas', icon: '📋' },
                { key: 'recent', label: 'Recentes', icon: '🕒' },
                { key: 'genre', label: 'Por Gênero', icon: '🎵' },
                { key: 'region', label: 'Por Região', icon: '🗺️' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === key
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          {viewMode === 'all' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="recent">Mais Recentes</option>
                <option value="name">Nome (A-Z)</option>
                <option value="genre">Gênero</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Favorites Content */}
      <div>
        {renderFavoritesByCategory()}
      </div>

      {/* Quick Stats */}
      {favoritesCount > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas dos Favoritos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-600">{favoritesCount}</div>
              <div className="text-sm text-cyan-800">Total de Favoritos</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(getFavoritesByGenre()).length}
              </div>
              <div className="text-sm text-blue-800">Gêneros Diferentes</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(getFavoritesByRegion()).length}
              </div>
              <div className="text-sm text-purple-800">Regiões Cobertas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
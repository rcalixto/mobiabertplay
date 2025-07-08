import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!loading) {
      saveFavorites();
    }
  }, [favorites, loading]);

  const loadFavorites = () => {
    try {
      const storedFavorites = localStorage.getItem('mobinabert_favorites');
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = () => {
    try {
      localStorage.setItem('mobinabert_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const addToFavorites = (radio) => {
    if (!isFavorite(radio.id)) {
      setFavorites(prev => [...prev, {
        id: radio.id,
        nome: radio.nome,
        genero: radio.genero,
        cidade: radio.cidade,
        estado: radio.estado,
        regiao: radio.regiao,
        logo_url: radio.logo_url,
        stream_url: radio.stream_url,
        descricao: radio.descricao,
        dateAdded: new Date().toISOString()
      }]);
      toast.success(`${radio.nome} adicionada aos favoritos! ❤️`);
      return true;
    }
    return false;
  };

  const removeFromFavorites = (radioId) => {
    const radio = favorites.find(fav => fav.id === radioId);
    setFavorites(prev => prev.filter(fav => fav.id !== radioId));
    if (radio) {
      toast.info(`${radio.nome} removida dos favoritos`);
    }
    return true;
  };

  const toggleFavorite = (radio) => {
    if (isFavorite(radio.id)) {
      removeFromFavorites(radio.id);
      return false;
    } else {
      addToFavorites(radio);
      return true;
    }
  };

  const isFavorite = (radioId) => {
    return favorites.some(fav => fav.id === radioId);
  };

  const getFavoritesByGenre = () => {
    const genres = {};
    favorites.forEach(radio => {
      if (!genres[radio.genero]) {
        genres[radio.genero] = [];
      }
      genres[radio.genero].push(radio);
    });
    return genres;
  };

  const getFavoritesByRegion = () => {
    const regions = {};
    favorites.forEach(radio => {
      if (!regions[radio.regiao]) {
        regions[radio.regiao] = [];
      }
      regions[radio.regiao].push(radio);
    });
    return regions;
  };

  const getRecentFavorites = (limit = 5) => {
    return [...favorites]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit);
  };

  const clearAllFavorites = () => {
    if (window.confirm('Tem certeza que deseja remover todos os favoritos?')) {
      setFavorites([]);
      toast.success('Todos os favoritos foram removidos');
      return true;
    }
    return false;
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesByGenre,
    getFavoritesByRegion,
    getRecentFavorites,
    clearAllFavorites,
    favoritesCount: favorites.length
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
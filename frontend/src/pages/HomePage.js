import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { radioAPI } from '../services/api';
import RadioCard from '../components/RadioCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../contexts/FavoritesContext';

const HomePage = () => {
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    busca: '',
    genero: '',
    regiao: '',
    cidade: '',
    estado: '',
    ativo: true,
    limite: 24,
    pagina: 1
  });
  const [generos, setGeneros] = useState([]);
  const [regioes, setRegioes] = useState([]);
  const [stats, setStats] = useState(null);
  
  const { getRecentFavorites, favoritesCount } = useFavorites();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadRadios();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [generosData, regioesData, statsData] = await Promise.all([
        radioAPI.getGeneros(),
        radioAPI.getRegioes(),
        radioAPI.getStats()
      ]);
      
      setGeneros(generosData);
      setRegioes(regioesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    }
  };

  const loadRadios = async () => {
    try {
      setLoading(true);
      const data = await radioAPI.getRadios(filters);
      setRadios(data);
    } catch (error) {
      console.error('Erro ao carregar rádios:', error);
      toast.error('Erro ao carregar rádios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      pagina: 1 // Reset page when filters change
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      pagina: prev.pagina + 1
    }));
  };

  const recentFavorites = getRecentFavorites(3);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 logo-glow">
            🎧 <span className="text-cyan-100">mobina</span><span className="text-white">bert</span> <span className="text-cyan-200">PLAY</span>
          </h1>
          <p className="text-xl text-cyan-100 mb-6">
            Descubra e ouça as melhores rádios do Brasil em um só lugar
          </p>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.total_radios}</div>
                <div className="text-sm text-cyan-100">Rádios Cadastradas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.por_genero.length}</div>
                <div className="text-sm text-cyan-100">Gêneros Diferentes</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">{favoritesCount}</div>
                <div className="text-sm text-cyan-100">Seus Favoritos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Favorites Section */}
      {recentFavorites.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              ❤️ Seus Favoritos Recentes
            </h2>
            <Link
              to="/favoritos"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center"
            >
              Ver todos ({favoritesCount})
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentFavorites.map((radio) => (
              <RadioCard key={radio.id} radio={radio} />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <SearchFilters
        filters={filters}
        generos={generos}
        regioes={regioes}
        onFilterChange={handleFilterChange}
      />

      {/* Results */}
      <div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {radios.length > 0 ? (
                  `${radios.length} rádio${radios.length > 1 ? 's' : ''} encontrada${radios.length > 1 ? 's' : ''}`
                ) : (
                  'Nenhuma rádio encontrada'
                )}
              </h2>
              
              {radios.length > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
                >
                  Carregar Mais
                </button>
              )}
            </div>

            {/* Radio cards grid */}
            {radios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {radios.map((radio) => (
                  <RadioCard key={radio.id} radio={radio} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma rádio encontrada
                </h3>
                <p className="text-gray-500 mb-4">
                  Tente ajustar seus filtros de busca ou remover alguns critérios.
                </p>
                <button
                  onClick={() => handleFilterChange({
                    busca: '',
                    genero: '',
                    regiao: '',
                    cidade: '',
                    estado: ''
                  })}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
import React, { useState } from 'react';

const SearchFilters = ({ filters, generos, regioes, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      busca: '',
      genero: '',
      regiao: '',
      cidade: '',
      estado: ''
    });
  };

  const hasActiveFilters = filters.busca || filters.genero || filters.regiao || filters.cidade || filters.estado;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, cidade ou estado..."
          value={filters.busca}
          onChange={(e) => handleInputChange('busca', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Filter toggles */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          <svg className={`w-5 h-5 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Filtros Avançados</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Genre filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gênero
            </label>
            <select
              value={filters.genero}
              onChange={(e) => handleInputChange('genero', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Todos os gêneros</option>
              {generos.map((genero) => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
                </option>
              ))}
            </select>
          </div>

          {/* Region filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Região
            </label>
            <select
              value={filters.regiao}
              onChange={(e) => handleInputChange('regiao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Todas as regiões</option>
              {regioes.map((regiao) => (
                <option key={regiao.value} value={regiao.value}>
                  {regiao.label}
                </option>
              ))}
            </select>
          </div>

          {/* City filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              placeholder="Ex: São Paulo"
              value={filters.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* State filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <input
              type="text"
              placeholder="Ex: SP"
              value={filters.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.busca && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 text-cyan-800">
              Busca: "{filters.busca}"
              <button
                onClick={() => handleInputChange('busca', '')}
                className="ml-2 hover:text-cyan-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.genero && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Gênero: {filters.genero}
              <button
                onClick={() => handleInputChange('genero', '')}
                className="ml-2 hover:text-green-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.regiao && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Região: {filters.regiao}
              <button
                onClick={() => handleInputChange('regiao', '')}
                className="ml-2 hover:text-purple-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.cidade && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              Cidade: {filters.cidade}
              <button
                onClick={() => handleInputChange('cidade', '')}
                className="ml-2 hover:text-orange-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.estado && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
              Estado: {filters.estado}
              <button
                onClick={() => handleInputChange('estado', '')}
                className="ml-2 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
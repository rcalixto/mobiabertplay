import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const RadioCard = ({ radio }) => {
  const defaultLogo = "https://via.placeholder.com/150x150/06B6D4/FFFFFF?text=📻";
  
  const logoUrl = radio.logo_url 
    ? `${process.env.REACT_APP_BACKEND_URL}${radio.logo_url}`
    : defaultLogo;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 card-hover relative">
      {/* Favorite Button */}
      <FavoriteButton radio={radio} variant="card" size="md" />
      
      {/* Logo */}
      <div className="relative h-48 bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <img
          src={logoUrl}
          alt={`Logo ${radio.nome}`}
          className="w-24 h-24 object-contain rounded-lg shadow-md"
          onError={(e) => {
            e.target.src = defaultLogo;
          }}
        />
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            radio.ativo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {radio.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Radio name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {radio.nome}
        </h3>

        {/* Genre */}
        <div className="flex items-center mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
            {radio.genero}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{radio.cidade}, {radio.estado}</span>
        </div>

        {/* Region */}
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{radio.regiao}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {radio.descricao}
        </p>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/radio/${radio.id}`}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors text-center text-sm font-medium play-button"
          >
            <span className="flex items-center justify-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
              </svg>
              <span>Ouvir</span>
            </span>
          </Link>

          <Link
            to={`/radio/${radio.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RadioCard;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { radioAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RadioDetailPage = () => {
  const { id } = useParams();
  const [radio, setRadio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    loadRadio();
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      const handleError = (e) => {
        console.error('Audio error:', e);
        toast.error('Erro ao reproduzir a rádio. Verifique se o link está funcionando.');
        setIsPlaying(false);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [volume]);

  const loadRadio = async () => {
    try {
      setLoading(true);
      const data = await radioAPI.getRadio(id);
      setRadio(data);
    } catch (error) {
      console.error('Erro ao carregar rádio:', error);
      toast.error('Erro ao carregar dados da rádio');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((error) => {
          console.error('Erro ao reproduzir:', error);
          toast.error('Erro ao reproduzir a rádio');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!radio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rádio não encontrada</h2>
        <Link to="/" className="text-cyan-600 hover:text-cyan-700">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  const defaultLogo = "https://via.placeholder.com/300x300/06B6D4/FFFFFF?text=📻";
  const logoUrl = radio.logo_url 
    ? `${process.env.REACT_APP_BACKEND_URL}${radio.logo_url}`
    : defaultLogo;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8">
          <div className="flex items-center space-x-6">
            <img
              src={logoUrl}
              alt={`Logo ${radio.nome}`}
              className="w-24 h-24 rounded-lg shadow-lg object-contain bg-white bg-opacity-20"
              onError={(e) => {
                e.target.src = defaultLogo;
              }}
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">{radio.nome}</h1>
              <div className="flex items-center space-x-4 text-cyan-100">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {radio.genero}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {radio.cidade}, {radio.estado}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Player de Áudio</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              radio.ativo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {radio.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <audio
              ref={audioRef}
              src={radio.stream_url}
              preload="none"
            />
            
            {/* Play/Pause button */}
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center justify-center space-x-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 17a1 1 0 01-1-1v-4a1 1 0 011-1h2l4-4v12l-4-4H9z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #06B6D4 0%, #06B6D4 ${volume * 100}%, #E5E7EB ${volume * 100}%, #E5E7EB 100%)`
                }}
              />
              <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
            </div>

            {/* Status */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {isPlaying ? '🔴 Ao vivo' : '⏸️ Pausado'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre a Rádio</h3>
            <p className="text-gray-600 leading-relaxed">{radio.descricao}</p>
          </div>

          {/* Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{radio.cidade}, {radio.estado}</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-cyan-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{radio.regiao}</span>
                </div>

                {radio.endereco && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">{radio.endereco}</span>
                  </div>
                )}

                {radio.telefone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-cyan-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{radio.telefone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h4>
              {radio.redes_sociais ? (
                <div className="space-y-3">
                  {radio.redes_sociais.facebook && (
                    <a
                      href={radio.redes_sociais.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  
                  {radio.redes_sociais.instagram && (
                    <a
                      href={radio.redes_sociais.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.648.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.132-1.174C4.633 15.13 4.143 13.979 4.143 12.682c0-1.297.49-2.448 1.174-3.132.684-.684 1.835-1.174 3.132-1.174 1.297 0 2.448.49 3.132 1.174.684.684 1.174 1.835 1.174 3.132 0 1.297-.49 2.448-1.174 3.132-.684.684-1.835 1.174-3.132 1.174z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  
                  {radio.redes_sociais.website && (
                    <a
                      href={radio.redes_sociais.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                      Website
                    </a>
                  )}

                  {radio.redes_sociais.youtube && (
                    <a
                      href={radio.redes_sociais.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma rede social cadastrada</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioDetailPage;
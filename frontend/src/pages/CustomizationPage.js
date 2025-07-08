import React, { useState, useRef } from 'react';
import { useCustomization } from '../contexts/CustomizationContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const CustomizationPage = () => {
  const { customization, loading, presets, updateCustomization, uploadLogo, resetCustomization, applyPreset } = useCustomization();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('colors');
  const [tempColors, setTempColors] = useState(customization.colors);
  const [tempTexts, setTempTexts] = useState(customization.texts);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    setTempColors(customization.colors);
    setTempTexts(customization.texts);
  }, [customization]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 mb-6">
          Você precisa estar logado como administrador para acessar o painel de customização.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleColorChange = (colorKey, value) => {
    const newColors = { ...tempColors, [colorKey]: value };
    setTempColors(newColors);
    updateCustomization({ colors: newColors });
  };

  const handleTextChange = (textKey, value) => {
    const newTexts = { ...tempTexts, [textKey]: value };
    setTempTexts(newTexts);
    updateCustomization({ texts: newTexts });
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      await uploadLogo(file);
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações? Esta ação não pode ser desfeita.')) {
      await resetCustomization();
    }
  };

  const tabs = [
    { id: 'colors', label: 'Cores', icon: '🎨' },
    { id: 'texts', label: 'Textos', icon: '📝' },
    { id: 'logo', label: 'Logo', icon: '🖼️' },
    { id: 'presets', label: 'Temas', icon: '🎭' }
  ];

  const colorFields = [
    { key: 'primary', label: 'Cor Primária', description: 'Cor principal da interface' },
    { key: 'secondary', label: 'Cor Secundária', description: 'Cor de apoio e hover' },
    { key: 'accent', label: 'Cor de Destaque', description: 'Cor para elementos especiais' },
    { key: 'background', label: 'Fundo', description: 'Cor de fundo da página' },
    { key: 'text', label: 'Texto', description: 'Cor do texto principal' }
  ];

  const textFields = [
    { key: 'platform_name', label: 'Nome da Plataforma', description: 'Nome exibido no header' },
    { key: 'platform_slogan', label: 'Slogan', description: 'Slogan da plataforma' },
    { key: 'hero_title', label: 'Título Hero', description: 'Título principal da página inicial' },
    { key: 'hero_subtitle', label: 'Subtítulo Hero', description: 'Subtítulo da página inicial' },
    { key: 'footer_text', label: 'Texto do Rodapé', description: 'Texto do rodapé (opcional)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🎨 Painel de Customização
            </h1>
            <p className="text-cyan-100">
              Personalize a aparência da sua plataforma
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Resetar Tudo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuração de Cores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {colorFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <p className="text-xs text-gray-500">{field.description}</p>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={tempColors[field.key]}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={tempColors[field.key]}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Preview das Cores</h4>
                <div className="flex flex-wrap gap-3">
                  <div 
                    className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: tempColors.primary }}
                  >
                    Primary
                  </div>
                  <div 
                    className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: tempColors.secondary }}
                  >
                    Secondary
                  </div>
                  <div 
                    className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: tempColors.accent }}
                  >
                    Accent
                  </div>
                  <div 
                    className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-xs font-bold border"
                    style={{ backgroundColor: tempColors.background, color: tempColors.text }}
                  >
                    Background
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Texts Tab */}
          {activeTab === 'texts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuração de Textos
                </h3>
                <div className="space-y-4">
                  {textFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <p className="text-xs text-gray-500">{field.description}</p>
                      <input
                        type="text"
                        value={tempTexts[field.key]}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Preview dos Textos</h4>
                <div className="space-y-2">
                  <div className="text-xl font-bold" style={{ color: tempColors.primary }}>
                    {tempTexts.hero_title}
                  </div>
                  <div className="text-gray-600">
                    {tempTexts.hero_subtitle}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tempTexts.footer_text}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuração de Logo
                </h3>
                
                <div className="space-y-4">
                  {/* Current Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Atual
                    </label>
                    <div className="flex items-center space-x-4">
                      {customization.logo_url ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${customization.logo_url}`}
                          alt="Logo atual"
                          className="w-24 h-24 object-contain bg-gray-100 rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Sem logo</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">
                          {customization.logo_url ? 'Logo personalizado carregado' : 'Usando logo padrão'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload New Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Novo Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                      >
                        {uploading ? 'Enviando...' : 'Escolher Arquivo'}
                      </button>
                      <p className="text-sm text-gray-500">
                        Formatos aceitos: JPG, PNG, SVG (máx. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Temas Pré-definidos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <div key={preset.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{preset.name}</h4>
                        <button
                          onClick={() => applyPreset(preset)}
                          className="px-3 py-1 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded hover:from-cyan-600 hover:to-blue-700 transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: preset.colors.primary }}
                          title="Primary"
                        />
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: preset.colors.secondary }}
                          title="Secondary"
                        />
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: preset.colors.accent }}
                          title="Accent"
                        />
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: preset.colors.background }}
                          title="Background"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPage;
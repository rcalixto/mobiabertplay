import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CustomizationContext = createContext();

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const CustomizationProvider = ({ children }) => {
  const [customization, setCustomization] = useState({
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      accent: '#2563EB',
      background: '#F8FAFC',
      text: '#1F2937'
    },
    texts: {
      platform_name: 'mobinabert PLAY',
      platform_slogan: 'Descubra e ouça as melhores rádios do Brasil em um só lugar',
      hero_title: '🎧 mobinabert PLAY',
      hero_subtitle: 'Descubra e ouça as melhores rádios do Brasil em um só lugar',
      footer_text: '© 2025 mobinabert PLAY - Todos os direitos reservados'
    },
    logo_url: null,
    favicon_url: null,
    theme_name: 'default'
  });

  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState([
    {
      name: 'Padrão Cyan',
      colors: {
        primary: '#06B6D4',
        secondary: '#0891B2',
        accent: '#2563EB',
        background: '#F8FAFC',
        text: '#1F2937'
      }
    },
    {
      name: 'Tema Escuro',
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#6366F1',
        background: '#1F2937',
        text: '#F9FAFB'
      }
    },
    {
      name: 'Sunset',
      colors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#EF4444',
        background: '#FFF7ED',
        text: '#92400E'
      }
    },
    {
      name: 'Purple Rain',
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#EC4899',
        background: '#FAF5FF',
        text: '#581C87'
      }
    },
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        accent: '#06B6D4',
        background: '#EFF6FF',
        text: '#1E40AF'
      }
    }
  ]);

  useEffect(() => {
    loadCustomization();
  }, []);

  useEffect(() => {
    applyCustomization();
  }, [customization]);

  const loadCustomization = async () => {
    try {
      const response = await fetch(`${API_BASE}/customization`);
      if (response.ok) {
        const data = await response.json();
        setCustomization(data);
      }
    } catch (error) {
      console.error('Erro ao carregar customização:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyCustomization = () => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS
    root.style.setProperty('--color-primary', customization.colors.primary);
    root.style.setProperty('--color-secondary', customization.colors.secondary);
    root.style.setProperty('--color-accent', customization.colors.accent);
    root.style.setProperty('--color-background', customization.colors.background);
    root.style.setProperty('--color-text', customization.colors.text);
    
    // Atualizar título da página
    document.title = `${customization.texts.platform_name} - Rádios Online do Brasil`;
    
    // Atualizar favicon se disponível
    if (customization.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = `${BACKEND_URL}${customization.favicon_url}`;
      document.head.appendChild(favicon);
    }
  };

  const updateCustomization = async (updates) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Token de administrador necessário');
        return false;
      }

      const response = await fetch(`${API_BASE}/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setCustomization(data);
        toast.success('Customização atualizada com sucesso!');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao atualizar customização');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar customização:', error);
      toast.error('Erro ao atualizar customização');
      return false;
    }
  };

  const uploadLogo = async (file) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Token de administrador necessário');
        return false;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/customization/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        await loadCustomization(); // Recarregar customização
        toast.success('Logo atualizado com sucesso!');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao fazer upload do logo');
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      toast.error('Erro ao fazer upload do logo');
      return false;
    }
  };

  const resetCustomization = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Token de administrador necessário');
        return false;
      }

      const response = await fetch(`${API_BASE}/customization/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadCustomization(); // Recarregar customização
        toast.success('Configurações resetadas para padrão!');
        return true;
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao resetar configurações');
        return false;
      }
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      toast.error('Erro ao resetar configurações');
      return false;
    }
  };

  const applyPreset = (preset) => {
    const updatedCustomization = {
      ...customization,
      colors: preset.colors,
      theme_name: preset.name
    };
    setCustomization(updatedCustomization);
    updateCustomization({ colors: preset.colors, theme_name: preset.name });
  };

  const value = {
    customization,
    loading,
    presets,
    updateCustomization,
    uploadLogo,
    resetCustomization,
    applyPreset,
    loadCustomization
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};
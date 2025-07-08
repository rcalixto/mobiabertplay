import React from 'react';
import { useCustomization } from '../contexts/CustomizationContext';

const LoadingSpinner = ({ size = 'default', text = 'Carregando...', fullScreen = false }) => {
  const { customization } = useCustomization();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 'h-6 w-6';
      case 'large':
        return 'h-16 w-16';
      default:
        return 'h-12 w-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const spinner = (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full ${getSize()} border-b-2 mx-auto mb-4`}
          style={{ borderColor: customization.colors.primary }}
        ></div>
        <span className={`text-gray-600 ${getTextSize()}`}>{text}</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
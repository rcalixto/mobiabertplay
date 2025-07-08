// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading for images
export const lazyLoadImage = (src, placeholder = '/favicon.ico') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(placeholder);
    img.src = src;
  });
};

// Cache management
export const cacheManager = {
  set: (key, data, expirationMinutes = 30) => {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    const cacheItem = {
      data,
      expiration: expirationTime
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  },

  get: (key) => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    try {
      const cacheItem = JSON.parse(cached);
      if (Date.now() > cacheItem.expiration) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      return cacheItem.data;
    } catch (error) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
  },

  clear: (key) => {
    if (key) {
      localStorage.removeItem(`cache_${key}`);
    } else {
      // Clear all cache items
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('cache_')) {
          localStorage.removeItem(storageKey);
        }
      });
    }
  }
};

// API request with caching
export const cachedApiRequest = async (url, options = {}, cacheMinutes = 10) => {
  const cacheKey = `api_${url}_${JSON.stringify(options)}`;
  
  // Try to get from cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Make API request
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // Cache the response
    cacheManager.set(cacheKey, data, cacheMinutes);
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (label) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}_start`);
    }
  },

  end: (label) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${label}_end`);
      performance.measure(label, `${label}_start`, `${label}_end`);
      
      const measure = performance.getEntriesByName(label)[0];
      console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },

  clear: () => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
};

// Memory usage optimization
export const memoryOptimization = {
  cleanupUnusedData: () => {
    // Clear expired cache
    cacheManager.clear();
    
    // Clear old notifications (keep only last 50)
    const notifications = localStorage.getItem('notifications');
    if (notifications) {
      try {
        const parsed = JSON.parse(notifications);
        if (parsed.length > 50) {
          const recent = parsed.slice(0, 50);
          localStorage.setItem('notifications', JSON.stringify(recent));
        }
      } catch (error) {
        console.error('Error cleaning notifications:', error);
      }
    }
  },

  getMemoryUsage: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// Run cleanup periodically
setInterval(() => {
  memoryOptimization.cleanupUnusedData();
}, 5 * 60 * 1000); // Every 5 minutes
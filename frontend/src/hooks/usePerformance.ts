import { useEffect, useState, useCallback } from 'react';

/**
 * Hook para monitoramento e otimização de performance
 */
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isOptimized: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Medir tempo de carregamento
  useEffect(() => {
    const startTime = performance.now();
    
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // Aguardar o DOM estar completamente carregado
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  // Monitorar uso de memória
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  // Otimizar performance automaticamente
  const optimizePerformance = useCallback(() => {
    setIsLoading(true);
    
    // Simular otimizações
    setTimeout(() => {
      // Limpar cache desnecessário
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name);
            }
          });
        });
      }

      // Otimizar imagens lazy loading
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        if (img.getBoundingClientRect().top < window.innerHeight) {
          img.setAttribute('src', img.getAttribute('data-src') || '');
          img.removeAttribute('data-src');
        }
      });

      setMetrics(prev => ({ ...prev, isOptimized: true }));
      setIsLoading(false);
    }, 1000);
  }, []);

  // Preload de recursos críticos - desabilitado para evitar erros de autenticação
  const preloadCriticalResources = useCallback(() => {
    // Removido preload automático de APIs que requerem autenticação
    // para evitar erros 401 desnecessários no console
    console.log('Preload de recursos críticos desabilitado');
  }, []);

  return {
    metrics,
    isLoading,
    optimizePerformance,
    preloadCriticalResources
  };
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyLoading = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  const observeElement = useCallback((elementId: string, element: HTMLElement) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => {
              const newSet = new Set(prev);
              newSet.add(elementId);
              return newSet;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, []);

  const isVisible = useCallback((elementId: string) => {
    return visibleElements.has(elementId);
  }, [visibleElements]);

  return { observeElement, isVisible };
};

/**
 * Hook para debounce de ações
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    setDebounceTimer(prevTimer => {
      if (prevTimer) {
        clearTimeout(prevTimer);
      }
      return setTimeout(() => {
        callback(...args);
      }, delay);
    });
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
};

/**
 * Hook para cache inteligente
 */
export const useSmartCache = <T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback(() => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    return null;
  }, [key, ttl]);

  const setCachedData = useCallback((data: T) => {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, [key]);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher, getCachedData, setCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
};
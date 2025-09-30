// frontend/src/components/VirtualScrollList.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcula quais itens devem ser renderizados
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Itens visíveis
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i]
      });
    }
    return result;
  }, [items, visibleRange]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset do primeiro item visível
  const offsetY = visibleRange.start * itemHeight;

  // Handler de scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll para um índice específico
  const scrollToIndex = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  // Scroll suave para um índice
  const scrollToIndexSmooth = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  // Expõe métodos via ref
  const scrollRef = React.useRef<{
    scrollToIndex: (index: number) => void;
    scrollToIndexSmooth: (index: number) => void;
    getScrollTop: () => number;
  }>(null);

  React.useImperativeHandle(scrollRef, () => ({
    scrollToIndex,
    scrollToIndexSmooth,
    getScrollTop: () => scrollTop
  }));

  // Loading state
  if (loading && loadingComponent) {
    return (
      <div className={`virtual-scroll-container ${className}`} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return (
      <div className={`virtual-scroll-container ${className}`} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Container total com altura calculada */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container dos itens visíveis */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualScrollList;

// Hook para usar com virtual scrolling
export function useVirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  initialScrollIndex = 0
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  initialScrollIndex?: number;
}) {
  const [scrollTop, setScrollTop] = useState(initialScrollIndex * itemHeight);
  const scrollRef = useRef<any>(null);

  const scrollToIndex = useCallback((index: number, smooth = false) => {
    if (scrollRef.current) {
      if (smooth) {
        scrollRef.current.scrollToIndexSmooth(index);
      } else {
        scrollRef.current.scrollToIndex(index);
      }
    }
  }, []);

  const scrollToTop = useCallback(() => {
    scrollToIndex(0, true);
  }, [scrollToIndex]);

  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1, true);
  }, [scrollToIndex, items.length]);

  const currentIndex = Math.floor(scrollTop / itemHeight);
  const progress = items.length > 0 ? currentIndex / (items.length - 1) : 0;

  return {
    scrollRef,
    scrollTop,
    setScrollTop,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    currentIndex,
    progress
  };
}

// Componente de scroll indicator
export function VirtualScrollIndicator({
  progress,
  className = '',
  showPercentage = true
}: {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}) {
  const percentage = Math.round(progress * 100);

  return (
    <div className={`virtual-scroll-indicator ${className}`}>
      <div className="scroll-track">
        <div 
          className="scroll-thumb" 
          style={{ transform: `translateY(${progress * 100}%)` }}
        />
      </div>
      {showPercentage && (
        <span className="scroll-percentage">{percentage}%</span>
      )}
    </div>
  );
}

// Estilos CSS (adicionar ao arquivo CSS principal)
export const virtualScrollStyles = `
.virtual-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.virtual-scroll-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.scroll-track {
  width: 100px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.scroll-thumb {
  width: 20px;
  height: 100%;
  background: #007bff;
  border-radius: 2px;
  transition: transform 0.1s ease;
}

.scroll-percentage {
  font-size: 12px;
  color: #666;
  min-width: 30px;
  text-align: right;
}
`;
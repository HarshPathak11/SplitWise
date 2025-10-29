import React, { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * A high-performance generic list component with virtualization and memoization
 * Optimized for rendering large lists efficiently
 */
const VirtualizedList = memo(({
  items = [],
  renderItem,
  keyExtractor,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5,
  loading = false,
  loadingComponent = null,
  emptyComponent = null,
  emptyMessage = "No items found",
  className = "",
  itemClassName = "",
  searchQuery = "",
  searchFields = [],
  sortBy = null,
  sortOrder = 'asc',
  onItemClick = null,
  enableVirtualization = true,
  spacing = 8
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightState, setContainerHeightState] = useState(containerHeight);

  // Update container height based on actual DOM element
  useEffect(() => {
    if (containerRef.current && containerHeight === 'auto') {
      const updateHeight = () => {
        setContainerHeightState(containerRef.current.clientHeight);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [containerHeight]);

  // Memoized filtered and sorted items
  const processedItems = useMemo(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toString().toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = sortBy.split('.').reduce((obj, key) => obj?.[key], a);
        const bValue = sortBy.split('.').reduce((obj, key) => obj?.[key], b);
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [items, searchQuery, searchFields, sortBy, sortOrder]);

  // Virtualization calculations
  const virtualizedData = useMemo(() => {
    if (!enableVirtualization) {
      return {
        visibleItems: processedItems,
        totalHeight: processedItems.length * (itemHeight + spacing),
        startIndex: 0,
        endIndex: processedItems.length - 1
      };
    }

    const totalHeight = processedItems.length * (itemHeight + spacing);
    const visibleCount = Math.ceil(containerHeightState / (itemHeight + spacing));
    const startIndex = Math.max(0, Math.floor(scrollTop / (itemHeight + spacing)) - overscan);
    const endIndex = Math.min(
      processedItems.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    const visibleItems = processedItems.slice(startIndex, endIndex + 1);

    return {
      visibleItems,
      totalHeight,
      startIndex,
      endIndex
    };
  }, [processedItems, scrollTop, containerHeightState, itemHeight, spacing, overscan, enableVirtualization]);

  // Scroll handler
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Memoized render function for individual items
  const renderMemoizedItem = useCallback((item, index) => {
    const actualIndex = enableVirtualization ? virtualizedData.startIndex + index : index;
    const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;
    
    return (
      <div
        key={key}
        className={`list-item ${itemClassName}`}
        style={{
          height: itemHeight,
          marginBottom: spacing,
          ...(enableVirtualization && {
            transform: `translateY(${(virtualizedData.startIndex + index) * (itemHeight + spacing)}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          })
        }}
        onClick={onItemClick ? () => onItemClick(item, actualIndex) : undefined}
      >
        {renderItem(item, actualIndex)}
      </div>
    );
  }, [renderItem, keyExtractor, itemHeight, spacing, onItemClick, enableVirtualization, virtualizedData.startIndex]);

  // Loading state
  if (loading) {
    return (
      <div className={`virtualized-list-container ${className}`} style={{ height: containerHeightState }}>
        {loadingComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-400 text-center">Loading...</div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (processedItems.length === 0) {
    return (
      <div className={`virtualized-list-container ${className}`} style={{ height: containerHeightState }}>
        {emptyComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center font-semibold">{emptyMessage}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-list-container ${className}`}
      style={{
        height: containerHeightState,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={enableVirtualization ? handleScroll : undefined}
    >
      <div
        className="virtualized-list-content"
        style={{
          height: enableVirtualization ? virtualizedData.totalHeight : 'auto',
          position: 'relative'
        }}
      >
        {virtualizedData.visibleItems.map((item, index) => 
          renderMemoizedItem(item, index)
        )}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  overscan: PropTypes.number,
  loading: PropTypes.bool,
  loadingComponent: PropTypes.node,
  emptyComponent: PropTypes.node,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  searchQuery: PropTypes.string,
  searchFields: PropTypes.arrayOf(PropTypes.string),
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  onItemClick: PropTypes.func,
  enableVirtualization: PropTypes.bool,
  spacing: PropTypes.number
};

export default VirtualizedList;

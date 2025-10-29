// OptimizedList.jsx
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedList
 * - Preferred key order: keyExtractor -> item.id -> item._id -> item.uuid -> index
 * - In dev mode, warns if duplicate/invalid keys are detected
 */
const OptimizedList = memo(({
  items = [],
  renderItem,
  keyExtractor,
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No items found",
  className = "",
  itemClassName = "",
  searchQuery = "",
  searchFields = [],
  sortBy = null,
  sortOrder = 'asc',
  onItemClick = null,
  spacing = "space-y-2"
}) => {
  // Helper: stable default key extractor
  const defaultKey = (item, index) => {
    // prefer common unique fields, fall back to index
    const candidate = item?.id ?? item?._id ?? item?.uuid ?? index;
    // coerce to string to avoid weird types
    return String(candidate);
  };

  // Memoized filtered and sorted items
  const processedItems = useMemo(() => {
    let filtered = Array.isArray(items) ? [...items] : [];

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

        let comparison;
        // string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = aValue < bValue ? -1 : 1;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [items, searchQuery, searchFields, sortBy, sortOrder]);

  // Loading state
  if (loading) {
    return (
      <div className={`optimized-list-container ${className}`}>
        <div className="text-blue-400 text-center">{loadingMessage}</div>
      </div>
    );
  }

  // Empty state
  if (!processedItems.length) {
    return (
      <div className={`optimized-list-container ${className}`}>
        <div className="text-red-500 text-center font-semibold">{emptyMessage}</div>
      </div>
    );
  }

  // Build keys and detect duplicates in dev
  const keys = processedItems.map((item, index) => {
    const rawKey = keyExtractor ? keyExtractor(item, index) : defaultKey(item, index);
    // If keyExtractor returned null/undefined/'' -> fallback to defaultKey
    const finalKey = rawKey ?? defaultKey(item, index);
    return String(finalKey); // always string
  });

  if (process.env.NODE_ENV !== 'production') {
    const dupes = keys.reduce((acc, k, i) => {
      if (!acc.map[k]) acc.map[k] = [];
      acc.map[k].push(i);
      return acc;
    }, { map: {} });

    const duplicates = Object.entries(dupes.map).filter(([, idxs]) => idxs.length > 1);
    if (duplicates.length > 0) {
      console.warn('OptimizedList detected duplicate keys for items at indices:', duplicates);
      // helpful debug log of keys
      console.warn('Computed keys:', keys);
    }

    // warn if any key is 'undefined' or 'null' or empty string
    keys.forEach((k, i) => {
      if (k === 'undefined' || k === 'null' || k === '') {
        console.warn(`OptimizedList: item at index ${i} produced an invalid key:`, k, processedItems[i]);
      }
    });
  }

  return (
    <div className={`optimized-list-container ${spacing} ${className}`}>
      {processedItems.map((item, index) => {
        const key = keys[index]; // already computed and coerced to string
        return (
          <div
            key={key}
            className={itemClassName}
            onClick={onItemClick ? () => onItemClick(item, index) : undefined}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';

OptimizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  keyExtractor: PropTypes.func,
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  searchQuery: PropTypes.string,
  searchFields: PropTypes.arrayOf(PropTypes.string),
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  onItemClick: PropTypes.func,
  spacing: PropTypes.string
};

export default OptimizedList;

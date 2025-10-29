import { useMemo, useCallback, useState } from 'react';

/**
 * Custom hook for optimizing list performance
 * Provides search, sort, and pagination functionality
 */
export const useListOptimization = ({
  items = [],
  searchFields = [],
  defaultSortBy = null,
  defaultSortOrder = 'asc',
  pageSize = 50
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);

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
        
        let comparison;
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

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedItems.slice(startIndex, endIndex);
  }, [processedItems, currentPage, pageSize]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = processedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      totalItems,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      startIndex: (currentPage - 1) * pageSize + 1,
      endIndex: Math.min(currentPage * pageSize, totalItems)
    };
  }, [processedItems.length, currentPage, pageSize]);

  // Handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSort = useCallback((field, order = null) => {
    if (field === sortBy && !order) {
      // Toggle sort order if same field
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(order || 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortBy]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)));
  }, [paginationInfo.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPrevPage]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    setCurrentPage(1);
  }, [defaultSortBy, defaultSortOrder]);

  return {
    // Data
    items: paginatedItems,
    allItems: processedItems,
    originalItems: items,
    
    // Search
    searchQuery,
    setSearchQuery: handleSearch,
    
    // Sort
    sortBy,
    sortOrder,
    handleSort,
    
    // Pagination
    currentPage,
    paginationInfo,
    handlePageChange,
    nextPage,
    prevPage,
    
    // Utils
    resetFilters,
    
    // State setters (for advanced use)
    setSortBy,
    setSortOrder,
    setCurrentPage
  };
};

export default useListOptimization;

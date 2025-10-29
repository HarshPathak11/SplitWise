import React, { useState, useMemo, useCallback } from 'react';
import OptimizedList from './OptimizedList';
import VirtualizedList from './VirtualizedList';

// Generate mock data for performance testing
const generateMockData = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index + 1}`,
    description: `Description for item ${index + 1}`,
    value: Math.floor(Math.random() * 1000),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    category: ['Category A', 'Category B', 'Category C'][index % 3]
  }));
};

const PerformanceDemo = () => {
  const [itemCount, setItemCount] = useState(100);
  const [listType, setListType] = useState('optimized');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate mock data
  const mockData = useMemo(() => generateMockData(itemCount), [itemCount]);

  // Standard list render (for comparison)
  const StandardList = ({ items, searchQuery }) => {
    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-2">
        {filteredItems.map(item => (
          <div key={item.id} className="p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
            <div className="flex justify-between mt-2">
              <span className="text-blue-400">{item.category}</span>
              <span className="font-bold">₹{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Memoized render function for optimized lists
  const renderItem = useCallback((item) => (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-300">{item.description}</p>
      <div className="flex justify-between mt-2">
        <span className="text-blue-400">{item.category}</span>
        <span className="font-bold">₹{item.value}</span>
      </div>
    </div>
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          List Performance Comparison
        </h1>

        {/* Controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Items: {itemCount}
              </label>
              <input
                type="range"
                min="10"
                max="10000"
                step="10"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                List Type
              </label>
              <select
                value={listType}
                onChange={(e) => setListType(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
              >
                <option value="standard">Standard List</option>
                <option value="optimized">Optimized List</option>
                <option value="virtualized">Virtualized List</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
          </div>
        </div>

        {/* Performance Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Standard List:</strong>
              <ul className="mt-1 text-gray-300">
                <li>• Re-renders on every state change</li>
                <li>• No memoization</li>
                <li>• DOM nodes: {itemCount}</li>
              </ul>
            </div>
            <div>
              <strong>Optimized List:</strong>
              <ul className="mt-1 text-gray-300">
                <li>• Memoized components</li>
                <li>• Efficient filtering/sorting</li>
                <li>• DOM nodes: {itemCount}</li>
              </ul>
            </div>
            <div>
              <strong>Virtualized List:</strong>
              <ul className="mt-1 text-gray-300">
                <li>• Only renders visible items</li>
                <li>• Constant memory usage</li>
                <li>• DOM nodes: ~{Math.min(20, itemCount)}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* List Container */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {listType.charAt(0).toUpperCase() + listType.slice(1)} List
            ({mockData.length} items)
          </h2>

          <div className="h-96 overflow-auto">
            {listType === 'standard' && (
              <StandardList items={mockData} searchQuery={searchQuery} />
            )}

            {listType === 'optimized' && (
              <OptimizedList
                items={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                searchQuery={searchQuery}
                searchFields={['name', 'description']}
                sortBy="createdAt"
                sortOrder="desc"
                spacing="space-y-2"
              />
            )}

            {listType === 'virtualized' && (
              <VirtualizedList
                items={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                itemHeight={120}
                containerHeight={384}
                searchQuery={searchQuery}
                searchFields={['name', 'description']}
                sortBy="createdAt"
                sortOrder="desc"
                enableVirtualization={true}
                spacing={8}
              />
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">How to Test Performance</h2>
          <ol className="list-decimal list-inside space-y-1 text-gray-300">
            <li>Increase item count to 1000+ items</li>
            <li>Try typing in the search box with different list types</li>
            <li>Notice the difference in responsiveness</li>
            <li>Open browser dev tools to monitor performance</li>
            <li>Use React DevTools Profiler for detailed analysis</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDemo;

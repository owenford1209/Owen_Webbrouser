import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  MapPinIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
};

const HouseCard = ({ house }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HomeIcon className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {formatPrice(house.saleprice)}
          </h3>
        </div>
        <div className="flex items-center space-x-1 bg-indigo-100 px-2 py-1 rounded-full">
          <MapPinIcon className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">{house.neighborhood}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Bedrooms:</span>
          <span>{house.bedroomabvgr}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Bathrooms:</span>
          <span>{house.fullbath}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Lot Shape:</span>
          <span>{house.lotshape}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Area:</span>
          <span>{house.neighborhood}</span>
        </div>
      </div>
    </div>
  );
};

const SearchFilters = ({ filters, setFilters, onSearch, onReset, stats, neighborhoods }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <HomeIcon className="w-6 h-6 mr-2 text-indigo-600" />
          House Search
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>
      </div>

      {/* Quick Price Range Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            placeholder={stats?.min_price ? `$${stats.min_price.toLocaleString()}` : "Enter min"}
            value={filters.min_price || ''}
            onChange={(e) => handleInputChange('min_price', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            placeholder={stats?.max_price ? `$${stats.max_price.toLocaleString()}` : "Enter max"}
            value={filters.max_price || ''}
            onChange={(e) => handleInputChange('max_price', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onSearch}
          className="md:mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Search Houses
        </button>
        <button
          onClick={onReset}
          className="md:mt-6 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Bathrooms
              </label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neighborhood
              </label>
              <select
                value={filters.neighborhood || ''}
                onChange={(e) => handleInputChange('neighborhood', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any Neighborhood</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Shape
              </label>
              <select
                value={filters.lot_shape || ''}
                onChange={(e) => handleInputChange('lot_shape', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Any Shape</option>
                <option value="Reg">Regular</option>
                <option value="IR1">Irregular 1</option>
                <option value="IR2">Irregular 2</option>
                <option value="IR3">Irregular 3</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Price Stats */}
      {stats && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Houses:</span>
              <span className="ml-2 font-semibold">{stats.total_houses}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Price:</span>
              <span className="ml-2 font-semibold">{formatPrice(stats.avg_price)}</span>
            </div>
            <div>
              <span className="text-gray-600">Min Price:</span>
              <span className="ml-2 font-semibold">{formatPrice(stats.min_price)}</span>
            </div>
            <div>
              <span className="text-gray-600">Max Price:</span>
              <span className="ml-2 font-semibold">{formatPrice(stats.max_price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HouseSearch = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filters, setFilters] = useState({
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    neighborhood: undefined,
    lot_shape: undefined
  });

  useEffect(() => {
    fetchStats();
    fetchNeighborhoods();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/houses/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchNeighborhoods = async () => {
    try {
      const response = await axios.get(`${API}/houses/neighborhoods`);
      setNeighborhoods(response.data);
    } catch (error) {
      console.error('Failed to fetch neighborhoods:', error);
    }
  };

  const searchHouses = async () => {
    if (!filters.min_price && !filters.max_price && !filters.bedrooms && 
        !filters.bathrooms && !filters.neighborhood && !filters.lot_shape) {
      setError('Please enter at least one search criteria');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API}/houses/search`, filters);
      setHouses(response.data);
      
      if (response.data.length === 0) {
        setError('No houses found matching your criteria. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Failed to search houses:', error);
      setError('Failed to search houses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setFilters({
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      neighborhood: undefined,
      lot_shape: undefined
    });
    setHouses([]);
    setError('');
  };

  return (
    <div className="space-y-6">
      <SearchFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={searchHouses}
        onReset={resetSearch}
        stats={stats}
        neighborhoods={neighborhoods}
      />

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Search Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {houses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results ({houses.length} houses found)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house, index) => (
              <HouseCard key={index} house={house} />
            ))}
          </div>
        </div>
      )}

      {!loading && houses.length === 0 && !error && (
        <div className="text-center py-12">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Find Your Dream Home</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter your search criteria above to find houses in Iowa
          </p>
        </div>
      )}
    </div>
  );
};

export default HouseSearch;
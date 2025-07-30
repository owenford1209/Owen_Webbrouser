import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Comment out useAuth for homepage-only flow
// import { useAuth } from './AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color mapping based on price ranges
const getColorByRange = (priceRange) => {
  switch (priceRange) {
    case '$100,000 or less':
      return '#3b82f6'; // Blue
    case '$100,001 to 125,000':
      return '#06b6d4'; // Teal
    case '$125,001 to 150,000':
      return '#10b981'; // Green
    case '$150,001 to 175,000':
      return '#059669'; // Dark Green
    case '$175,001 or more':
      return '#f97316'; // Orange
    default:
      return '#6b7280'; // Gray
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
};

const MapController = ({ housePrices }) => {
  const map = useMap();
  
  useEffect(() => {
    if (housePrices.length > 0) {
      const bounds = housePrices.map(house => [house.latitude, house.longitude]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [housePrices, map]);
  
  return null;
};

const InteractiveMap = () => {
  const [housePrices, setHousePrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('all');

  useEffect(() => {
    fetchHousePrices();
  }, []);

  const fetchHousePrices = async () => {
    try {
      const response = await axios.get(`${API}/house-prices`);
      setHousePrices(response.data);
    } catch (error) {
      console.error('Failed to fetch house prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/house-prices/seed`);
      fetchHousePrices();
    } catch (error) {
      console.error('Failed to seed data:', error);
    }
  };

  const filteredHousePrices = housePrices.filter(house => 
    selectedRange === 'all' || house.price_range === selectedRange
  );

  const priceRanges = [
    'all',
    '$100,000 or less',
    '$100,001 to 125,000',
    '$125,001 to 150,000',
    '$150,001 to 175,000',
    '$175,001 or more'
  ];

  // Add fixed set of markers from train.csv
  const fixedMarkers = [
    { price: 180000, lat: 41.374540118847364, lon: -93.47524356836776 },
    { price: 129500, lat: 41.374540118847364, lon: -93.47524356836776 },
    { price: 168500, lat: 41.374540118847364, lon: -93.47524356836776 },
    { price: 189000, lat: 41.374540118847364, lon: -93.47524356836776 },
    { price: 147000, lat: 41.374540118847364, lon: -93.47524356836776 },
    { price: 85000, lat: 41.950714306409914, lon: -93.56805498135789 },
    { price: 162000, lat: 41.950714306409914, lon: -93.56805498135789 },
    { price: 118000, lat: 41.7319939418114, lon: -93.70877085980196 },
    { price: 154000, lat: 41.7319939418114, lon: -93.70877085980196 },
    { price: 124000, lat: 41.7319939418114, lon: -93.70877085980196 },
  ];

  // Helper to color code by price
  const getColorByPrice = (price) => {
    if (price <= 100000) return '#3b82f6'; // Blue
    if (price <= 125000) return '#06b6d4'; // Teal
    if (price <= 150000) return '#10b981'; // Green
    if (price <= 175000) return '#059669'; // Dark Green
    return '#f97316'; // Orange
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (housePrices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Iowa House Prices Map</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No house price data available</p>
          <button
            onClick={seedData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Load Sample Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Iowa House Prices Map</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {priceRanges.map(range => (
              <option key={range} value={range}>
                {range === 'all' ? 'All Ranges' : range}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={[41.8780, -93.0977]} // Center of Iowa
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController housePrices={filteredHousePrices} />
          
          {/* Existing house price markers */}
          {filteredHousePrices.map((house) => (
            <CircleMarker
              key={house.id}
              center={[house.latitude, house.longitude]}
              radius={8}
              fillColor={getColorByRange(house.price_range)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg">{house.city}</h3>
                  <p className="text-gray-600">{house.county} County</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(house.avg_price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Range: {house.price_range}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {/* Fixed markers from train.csv */}
          {fixedMarkers.map((marker, idx) => (
            <CircleMarker
              key={`fixed-${idx}`}
              center={[marker.lat, marker.lon]}
              radius={8}
              fillColor={getColorByPrice(marker.price)}
              color="#222"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg">Train.csv Marker</h3>
                  <p className="text-gray-600">Lat: {marker.lat.toFixed(5)}, Lon: {marker.lon.toFixed(5)}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(marker.price)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Price Range Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {priceRanges.slice(1).map(range => (
            <div key={range} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: getColorByRange(range) }}
              ></div>
              <span>{range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
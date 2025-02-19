import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';

const SearchForm = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    district: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Districts in J&K
  const districts = [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Budgam',
    'Ganderbal', 'Kupwara', 'Pulwama', 'Shopian', 'Kulgam',
    'Udhampur', 'Kathua', 'Rajouri', 'Poonch', 'Doda',
    'Kishtwar', 'Ramban', 'Reasi', 'Samba', 'Bandipora'
  ];

  // Property types
  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
    { value: 'plot', label: 'Plot' }
  ];

  // Fetch location suggestions
  const fetchLocationSuggestions = debounce(async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/locations/search?city=${query}`);
      const suggestions = response.data.map(location => ({
        id: location.id,
        name: location.name,
        district: location.address.city || location.address.district,
        latitude: location.latitude,
        longitude: location.longitude
      }));
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle location input change
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSearchParams(prev => ({ ...prev, location: value }));
    fetchLocationSuggestions(value);
  };

  // Handle location suggestion selection
  const handleLocationSelect = (suggestion) => {
    setSearchParams(prev => ({
      ...prev,
      location: suggestion.name,
      district: suggestion.district || prev.district,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    }));
    setLocationSuggestions([]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    navigate(`/properties?${queryParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Search with Autocomplete */}
        <div className="relative">
          <input
            type="text"
            name="location"
            value={searchParams.location}
            onChange={handleLocationChange}
            placeholder="Enter Area or City (e.g., Srinagar)"
            className="w-full p-3 border rounded text-gray-700"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {locationSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{suggestion.name}</div>
                  {suggestion.district && (
                    <div className="text-sm text-gray-600">{suggestion.district}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Selection */}
        <select
          name="district"
          value={searchParams.district}
          onChange={(e) => setSearchParams(prev => ({ ...prev, district: e.target.value }))}
          className="w-full p-3 border rounded text-gray-700"
        >
          <option value="">Select District</option>
          {districts.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>

        {/* Property Type */}
        <select
          name="propertyType"
          value={searchParams.propertyType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, propertyType: e.target.value }))}
          className="w-full p-3 border rounded text-gray-700"
        >
          <option value="">Property Type</option>
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        {/* Price Range */}
        <input
          type="number"
          name="minPrice"
          value={searchParams.minPrice}
          onChange={(e) => setSearchParams(prev => ({ ...prev, minPrice: e.target.value }))}
          placeholder="Min Price (INR)"
          className="w-full p-3 border rounded text-gray-700"
        />
        <input
          type="number"
          name="maxPrice"
          value={searchParams.maxPrice}
          onChange={(e) => setSearchParams(prev => ({ ...prev, maxPrice: e.target.value }))}
          placeholder="Max Price (INR)"
          className="w-full p-3 border rounded text-gray-700"
        />

        {/* Bedrooms */}
        <select
          name="bedrooms"
          value={searchParams.bedrooms}
          onChange={(e) => setSearchParams(prev => ({ ...prev, bedrooms: e.target.value }))}
          className="w-full p-3 border rounded text-gray-700"
        >
          <option value="">Bedrooms</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="w-full p-3 bg-primary text-white rounded hover:bg-primary-dark transition duration-300"
        >
          Search Properties
        </button>
      </div>
    </form>
  );
};

export default SearchForm; 
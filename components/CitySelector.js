// components/CitySelector.js
"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Check, Loader2 } from 'lucide-react';
import { geocodeCity, FRENCH_CITIES } from '../lib/geoUtils';

const CitySelector = ({ currentCity, onCityUpdate, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity || '');

  // Villes populaires pour les entrepreneurs
  const popularCities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 
    'Bordeaux', 'Lille', 'Strasbourg', 'Montpellier', 'Rennes', 'Grenoble'
  ];

  // Filtrer les villes selon la recherche
  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = async (city) => {
    setLoading(true);
    try {
      let coordinates = null;
      
      // Vérifier si on a les coordonnées pré-définies
      if (FRENCH_CITIES[city]) {
        coordinates = {
          latitude: FRENCH_CITIES[city].lat,
          longitude: FRENCH_CITIES[city].lng
        };
      } else {
        // Sinon utiliser l'API de géocodage
        const result = await geocodeCity(city);
        if (result) {
          coordinates = {
            latitude: result.latitude,
            longitude: result.longitude
          };
        }
      }

      if (coordinates) {
        setSelectedCity(city);
        onCityUpdate({
          city,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        });
        setIsOpen(false);
      } else {
        alert('Impossible de localiser cette ville. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur sélection ville:', error);
      alert('Erreur lors de la sélection de la ville');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomCity = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const result = await geocodeCity(searchTerm);
      if (result) {
        setSelectedCity(searchTerm);
        onCityUpdate({
          city: searchTerm,
          latitude: result.latitude,
          longitude: result.longitude
        });
        setIsOpen(false);
      } else {
        alert('Ville non trouvée. Vérifiez l\'orthographe.');
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error);
      alert('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="relative">
        <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 opacity-60 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{selectedCity || 'Ville non définie'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bouton sélecteur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
      >
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{selectedCity || 'Sélectionner votre ville'}</span>
        </div>
        <Search className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-xl border border-white/20 z-50 max-h-80 overflow-hidden">
          {/* Recherche */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            {searchTerm && !popularCities.includes(searchTerm) && (
              <button
                onClick={handleCustomCity}
                disabled={loading}
                className="w-full mt-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Rechercher "${searchTerm}"`}
              </button>
            )}
          </div>

          {/* Liste des villes */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCities.map(city => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                disabled={loading}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{city}</span>
                  <span className="text-gray-400 text-xs ml-2">France</span>
                </div>
                {selectedCity === city && (
                  <Check className="h-4 w-4 text-green-400" />
                )}
              </button>
            ))}
            
            {filteredCities.length === 0 && !searchTerm && (
              <div className="p-4 text-gray-400 text-center text-sm">
                Tapez pour rechercher une ville
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
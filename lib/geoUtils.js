// lib/geoUtils.js

// Calculer la distance entre deux points (formule haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c); // Distance en km (arrondie)
  };
  
  const toRad = (value) => {
    return value * Math.PI / 180;
  };
  
  // Obtenir les coordonnées d'une ville (API gratuite)
  export const geocodeCity = async (city) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}, France&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  };
  
  // Villes françaises principales avec coordonnées pré-définies (fallback)
  export const FRENCH_CITIES = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Marseille': { lat: 43.2965, lng: 5.3698 },
    'Lyon': { lat: 45.7640, lng: 4.8357 },
    'Toulouse': { lat: 43.6043, lng: 1.4437 },
    'Nice': { lat: 43.7102, lng: 7.2620 },
    'Nantes': { lat: 47.2184, lng: -1.5536 },
    'Strasbourg': { lat: 48.5734, lng: 7.7521 },
    'Montpellier': { lat: 43.6110, lng: 3.8767 },
    'Bordeaux': { lat: 44.8378, lng: -0.5792 },
    'Lille': { lat: 50.6292, lng: 3.0573 },
    'Rennes': { lat: 48.1173, lng: -1.6778 },
    'Reims': { lat: 49.2583, lng: 4.0317 },
    'Le Havre': { lat: 49.4944, lng: 0.1079 },
    'Saint-Étienne': { lat: 45.4397, lng: 4.3872 },
    'Toulon': { lat: 43.1242, lng: 5.9280 },
    'Angers': { lat: 47.4784, lng: -0.5632 },
    'Grenoble': { lat: 45.1885, lng: 5.7245 },
    'Dijon': { lat: 47.3220, lng: 5.0415 },
    'Nîmes': { lat: 43.8367, lng: 4.3601 },
    'Aix-en-Provence': { lat: 43.5263, lng: 5.4454 }
  };
  
  export const formatDistance = (distance) => {
    if (distance < 1) {
      return "< 1 km";
    } else if (distance < 50) {
      return `${distance} km`;
    } else if (distance < 100) {
      return `~${Math.round(distance / 10) * 10} km`;
    } else {
      return `${Math.round(distance / 50) * 50}+ km`;
    }
  };
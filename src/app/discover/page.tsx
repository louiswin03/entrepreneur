"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  Users, 
  MessageCircle, 
  UserPlus,
  Heart,
  Star,
  Briefcase,
  Target,
  Loader2,
  Check,
  X as XIcon,
  Clock
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';
import { calculateDistance, formatDistance } from '../../../lib/geoUtils';

const DiscoverPageContent = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionRequests, setConnectionRequests] = useState(new Map());
  const [sendingRequest, setSendingRequest] = useState(null);

  // Récupérer les entrepreneurs depuis la base de données
  const fetchEntrepreneurs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          company,
          position,
          bio,
          location,
          city,
          latitude,
          longitude,
          sector,
          experience,
          avatar_url,
          is_verified,
          created_at
        `)
        .neq('id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des entrepreneurs:', error);
        throw error;
      }

      // Récupérer les statuts des connexions pour chaque entrepreneur
      const entrepreneursWithConnections = await Promise.all(
        (data || []).map(async (entrepreneur) => {
          // Vérifier le statut de connexion (envoyée, reçue, acceptée)
          const { data: sentConnection } = await supabase
            .from('connections')
            .select('status')
            .eq('user_id', user?.id)
            .eq('connected_user_id', entrepreneur.id)
            .maybeSingle();

          const { data: receivedConnection } = await supabase
            .from('connections')
            .select('status')
            .eq('user_id', entrepreneur.id)
            .eq('connected_user_id', user?.id)
            .maybeSingle();

          let connectionStatus = 'none';
          if (sentConnection) {
            connectionStatus = `sent_${sentConnection.status}`;
          } else if (receivedConnection) {
            connectionStatus = `received_${receivedConnection.status}`;
          }

          // Calculer la distance si les coordonnées sont disponibles
          let distance = null;
          let distanceText = '';
          
          if (profile?.latitude && profile?.longitude && 
              entrepreneur.latitude && entrepreneur.longitude) {
            distance = calculateDistance(
              profile.latitude, 
              profile.longitude,
              entrepreneur.latitude, 
              entrepreneur.longitude
            );
            distanceText = formatDistance(distance);
          }

          return {
            id: entrepreneur.id,
            name: `${entrepreneur.first_name || ''} ${entrepreneur.last_name || ''}`.trim(),
            title: entrepreneur.position || 'Entrepreneur',
            company: entrepreneur.company || 'Startup',
            sector: entrepreneur.sector || 'Tech',
            location: entrepreneur.city || entrepreneur.location || 'France',
            experience: entrepreneur.experience || 'Entrepreneur',
            connections: Math.floor(Math.random() * 300) + 50,
            avatar: entrepreneur.avatar_url || (entrepreneur.first_name || 'U').charAt(0).toUpperCase(),
            description: entrepreneur.bio || 'Entrepreneur passionné par l\'innovation.',
            skills: entrepreneur.sector ? [entrepreneur.sector, 'Innovation', 'Leadership'] : ['Innovation'],
            lookingFor: ['Partenaires', 'Investisseurs'],
            online: Math.random() > 0.5,
            verified: entrepreneur.is_verified || false,
            connectionStatus: connectionStatus,
            distance: distance, // Distance en km
            distanceText: distanceText, // Distance formatée
            latitude: entrepreneur.latitude,
            longitude: entrepreneur.longitude
          };
        })
      );

      // Trier par distance si disponible
      entrepreneursWithConnections.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance; // Plus proches en premier
        } else if (a.distance !== null) {
          return -1; // Les profils avec distance en premier
        } else if (b.distance !== null) {
          return 1;
        }
        return 0; // Garder l'ordre original
      });

      setEntrepreneurs(entrepreneursWithConnections);
      
      if (entrepreneursWithConnections.length === 0) {
        setError('Aucun entrepreneur trouvé. Soyez le premier à rejoindre la communauté !');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des entrepreneurs');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les secteurs et locations uniques
  const [sectors, setSectors] = useState([]);
  const [locations, setLocations] = useState([]);

  const fetchFiltersData = async () => {
    try {
      const { data: sectorsData } = await supabase
        .from('profiles')
        .select('sector')
        .not('sector', 'is', null);

      const uniqueSectors = [...new Set(sectorsData?.map(item => item.sector).filter(Boolean))];
      setSectors(uniqueSectors);

      const { data: locationsData } = await supabase
        .from('profiles')
        .select('city, location')
        .not('city', 'is', null);

      const uniqueLocations = [...new Set(locationsData?.map(item => item.city || item.location).filter(Boolean))];
      setLocations(uniqueLocations);
      
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
    }
  };

  // Envoyer une demande de connexion
  const sendConnectionRequest = async (targetUserId) => {
    try {
      setSendingRequest(targetUserId);

      // Vérifier qu'il n'y a pas déjà une connexion
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(user_id.eq.${user?.id},connected_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},connected_user_id.eq.${user?.id})`)
        .maybeSingle();

      if (existingConnection) {
        alert('Une connexion existe déjà avec cette personne');
        return;
      }

      // Créer la demande de connexion
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user?.id,
          connected_user_id: targetUserId,
          status: 'pending'
        });

      if (error) {
        console.error('Erreur demande connexion:', error);
        throw error;
      }

      // Créer une notification pour le destinataire
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', targetUserId)
        .single();

      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'connection_request',
          title: 'Nouvelle demande de connexion',
          message: `${profile?.first_name || 'Un entrepreneur'} souhaite se connecter avec vous`,
          related_id: user?.id
        });

      // Mettre à jour l'état local
      setEntrepreneurs(prev => prev.map(entrepreneur => 
        entrepreneur.id === targetUserId 
          ? { ...entrepreneur, connectionStatus: 'sent_pending' }
          : entrepreneur
      ));

      alert('Demande de connexion envoyée !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setSendingRequest(null);
    }
  };

  // Démarrer une conversation
  const startConversation = async (targetUserId) => {
    try {
      // Créer un message initial pour démarrer la conversation
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: targetUserId,
          content: 'Salut ! Je suis ravi de faire ta connaissance 👋'
        });

      if (error) throw error;

      // Rediriger vers les messages
      window.location.href = '/messages';
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ouverture de la conversation');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEntrepreneurs();
      fetchFiltersData();
    }
  }, [user?.id]);

  // Fonction pour obtenir le bon bouton selon le statut de connexion
  const getConnectionButton = (entrepreneur) => {
    const { connectionStatus, id } = entrepreneur;

    switch (connectionStatus) {
      case 'sent_pending':
        return (
          <button
            disabled
            className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg border border-yellow-400/20 cursor-not-allowed"
            title="Demande envoyée"
          >
            <Clock className="h-4 w-4" />
          </button>
        );
      
      case 'received_pending':
        return (
          <button
            disabled
            className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-400/20"
            title="Demande reçue - Consultez vos notifications"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        );
      
      case 'sent_accepted':
      case 'received_accepted':
        return (
          <button
            onClick={() => startConversation(id)}
            className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"
            title="Connectés - Démarrer une conversation"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        );
      
      case 'sent_declined':
      case 'received_declined':
        return (
          <button
            disabled
            className="p-2 bg-red-600/20 text-red-400 rounded-lg border border-red-400/20 cursor-not-allowed"
            title="Connexion refusée"
          >
            <XIcon className="h-4 w-4" />
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => sendConnectionRequest(id)}
            disabled={sendingRequest === id}
            className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50"
            title="Envoyer une demande de connexion"
          >
            {sendingRequest === id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </button>
        );
    }
  };

  // Logique de filtrage
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = entrepreneur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrepreneur.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrepreneur.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = selectedSector === 'all' || entrepreneur.sector === selectedSector;
    const matchesLocation = selectedLocation === 'all' || entrepreneur.location.includes(selectedLocation);
    
    return matchesSearch && matchesSector && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement des entrepreneurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Découvrir des entrepreneurs</h1>
          <p className="text-gray-300 text-lg">
            Trouve ton prochain co-fondateur, mentor ou partenaire d'affaires
            {profile?.city && (
              <span className="text-purple-400 ml-2">• Triés par proximité depuis {profile.city}</span>
            )}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, entreprise ou compétences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-slate-800">Tous les secteurs</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector} className="bg-slate-800">{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Localisation</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-slate-800">Toutes les localisations</option>
                  {locations.map(location => (
                    <option key={location} value={location} className="bg-slate-800">{location}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Location Notice */}
        {!profile?.city && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-8 text-center">
            <MapPin className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 mb-2">Définissez votre ville pour voir les entrepreneurs proches de vous</p>
            <Link href="/profile" className="text-blue-300 hover:text-blue-200 underline font-semibold">
              Compléter mon profil →
            </Link>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-6 mb-8">
            <p className="text-orange-400 text-center">{error}</p>
          </div>
        )}

        {/* Results Count */}
        {!error && (
          <div className="mb-6">
            <p className="text-gray-300">
              <span className="text-white font-semibold">{filteredEntrepreneurs.length}</span> entrepreneurs trouvés
              {profile?.city && filteredEntrepreneurs.some(e => e.distance !== null) && (
                <span className="text-purple-400 ml-2">• Triés par proximité</span>
              )}
            </p>
          </div>
        )}

        {/* Entrepreneurs Grid */}
        {filteredEntrepreneurs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntrepreneurs.map((entrepreneur) => (
              <div key={entrepreneur.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {entrepreneur.avatar}
                      </div>
                      {entrepreneur.online && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-900"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-bold">{entrepreneur.name}</h3>
                        {entrepreneur.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{entrepreneur.title}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-all">
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>

                {/* Company & Location */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-semibold">{entrepreneur.company}</span>
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
                      {entrepreneur.sector}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{entrepreneur.location}</span>
                    </div>
                    {entrepreneur.distanceText && (
                      <span className="text-purple-400 font-semibold text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                        📍 {entrepreneur.distanceText}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-300 mt-1">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{entrepreneur.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {entrepreneur.description}
                </p>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {entrepreneur.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Looking For */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-400 text-sm font-semibold">Recherche :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entrepreneur.lookingFor.map((item, index) => (
                      <span key={index} className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-1 text-gray-300 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{entrepreneur.connections} connexions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConnectionButton(entrepreneur)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun entrepreneur trouvé</h3>
            <p className="text-gray-300 mb-4">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">EntrepreneurConnect</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/discover" className="hover:text-white transition-colors">Découvrir</Link>
              <Link href="/events" className="hover:text-white transition-colors">Événements</Link>
              <Link href="/messages" className="hover:text-white transition-colors">Messages</Link>
              <Link href="/profile" className="hover:text-white transition-colors">Profil</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 EntrepreneurConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DiscoverPage = () => {
  return (
    <ProtectedRoute>
      <DiscoverPageContent />
    </ProtectedRoute>
  );
};

export default DiscoverPage;
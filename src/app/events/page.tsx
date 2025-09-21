"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  Plus,
  Heart,
  Share2,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';

const EventsPageContent = () => {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(null);
  const [creating, setCreating] = useState(false);

  // État pour le formulaire de création d'événement
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    category: 'Networking',
    price: 0,
    max_participants: ''
  });

  // Récupérer tous les événements depuis la base de données
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          start_time,
          end_time,
          location,
          category,
          price,
          max_participants,
          cover_url,
          tags,
          created_at,
          organizer_id,
          organizer:profiles!events_organizer_id_fkey(
            first_name,
            last_name,
            company
          )
        `)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (eventsError) {
        console.error('Erreur lors de la récupération des événements:', eventsError);
        throw eventsError;
      }

      // Pour chaque événement, récupérer le nombre de participants
      const eventsWithParticipants = await Promise.all(
        (eventsData || []).map(async (event) => {
          // Compter les participants
          const { count: participantsCount } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .in('status', ['registered', 'confirmed', 'attended']);

          // Vérifier si l'utilisateur est inscrit
          const { data: userParticipation } = await supabase
            .from('event_participants')
            .select('status')
            .eq('event_id', event.id)
            .eq('user_id', user?.id)
            .maybeSingle(); // Utiliser maybeSingle() au lieu de single()

          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: event.start_date,
            endDate: event.end_date,
            time: event.start_time ? event.start_time.substring(0, 5) : '00:00',
            endTime: event.end_time ? event.end_time.substring(0, 5) : null,
            location: event.location || 'À définir',
            category: event.category || 'Général',
            price: event.price === 0 || event.price === null ? 'Gratuit' : `${event.price}€`,
            attendees: participantsCount || 0,
            maxAttendees: event.max_participants,
            image: getEventImage(event.category),
            organizer: event.organizer ? 
              `${event.organizer.first_name || ''} ${event.organizer.last_name || ''}`.trim() || 
              event.organizer.company || 'Organisateur' : 'Organisateur',
            featured: Math.random() > 0.7,
            tags: event.tags || [],
            registered: userParticipation?.status === 'registered' || userParticipation?.status === 'confirmed',
            coverUrl: event.cover_url,
            isOrganizer: event.organizer_id === user?.id
          };
        })
      );

      setEvents(eventsWithParticipants);

      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(eventsWithParticipants.map(event => event.category))];
      setCategories(uniqueCategories);

      if (eventsWithParticipants.length === 0) {
        setError('Aucun événement programmé pour le moment. Créez le premier événement !');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  // Helper function pour les icônes d'événements
  const getEventImage = (category) => {
    switch (category) {
      case 'Networking': return '🚀';
      case 'Conference': return '💰';
      case 'Workshop': return '🌱';
      case 'Formation': return '💼';
      default: return '📅';
    }
  };

  // Fonction pour s'inscrire à un événement
  // Version avec debug ultra-détaillé
  const registerForEvent = async (eventId) => {
    if (!user?.id) {
      alert('Vous devez être connecté pour vous inscrire');
      return;
    }

    console.log('🚀 Début inscription - Debug complet');
    console.log('User object:', user);
    console.log('User ID:', user.id);
    console.log('Event ID:', eventId);
    console.log('Event ID type:', typeof eventId);

    setRegistering(eventId);
    
    try {
      // 1. Vérifier la connexion Supabase
      console.log('🔗 Test connexion Supabase...');
      const { data: testConnection, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Problème connexion Supabase:', testError);
        throw new Error('Problème de connexion à la base de données');
      }
      console.log('✅ Connexion Supabase OK');

      // 2. Vérifier l'événement existe
      console.log('📅 Vérification événement...');
      const { data: eventExists, error: eventError } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();

      console.log('Event query result:', { eventExists, eventError });
      
      if (eventError) {
        console.error('❌ Événement non trouvé:', eventError);
        throw new Error(`Événement introuvable: ${eventError.message}`);
      }

      // 3. Vérifier le profil utilisateur
      console.log('👤 Vérification profil utilisateur...');
      const { data: profileExists, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single();

      console.log('Profile query result:', { profileExists, profileError });

      if (profileError) {
        console.error('❌ Profil non trouvé:', profileError);
        throw new Error(`Profil introuvable: ${profileError.message}`);
      }

      // 4. Vérifier inscription existante
      console.log('🔍 Vérification inscription existante...');
      const { data: existingParticipation, error: checkError } = await supabase
        .from('event_participants')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Existing participation check:', { existingParticipation, checkError });

      if (checkError) {
        console.error('❌ Erreur vérification:', checkError);
        throw new Error(`Erreur vérification: ${checkError.message}`);
      }

      if (existingParticipation) {
        console.log('⚠️ Déjà inscrit');
        alert('Vous êtes déjà inscrit à cet événement');
        setRegistering(null);
        return;
      }

      // 5. Tentative d'insertion
      console.log('📝 Tentative d\'inscription...');
      
      const insertData = {
        event_id: eventId,
        user_id: user.id,
        status: 'registered',
        registration_date: new Date().toISOString()
      };

      console.log('Données à insérer:', insertData);
      console.log('Types des données:', {
        event_id_type: typeof insertData.event_id,
        user_id_type: typeof insertData.user_id,
        status_type: typeof insertData.status,
        date_type: typeof insertData.registration_date
      });

      // Test d'insertion avec plus de détails
      const insertResult = await supabase
        .from('event_participants')
        .insert(insertData)
        .select();

      console.log('🎯 Résultat insertion complète:', insertResult);
      console.log('Data:', insertResult.data);
      console.log('Error:', insertResult.error);
      console.log('Error stringified:', JSON.stringify(insertResult.error));
      console.log('Error properties:', Object.keys(insertResult.error || {}));

      if (insertResult.error) {
        console.error('❌ Détails erreur insertion:');
        console.error('- Message:', insertResult.error.message);
        console.error('- Code:', insertResult.error.code);
        console.error('- Details:', insertResult.error.details);
        console.error('- Hint:', insertResult.error.hint);
        console.error('- Error object:', insertResult.error);
        console.error('- Constructor:', insertResult.error.constructor.name);

        // Essayer de créer un message d'erreur utile
        const errorMessage = insertResult.error.message || 
                            insertResult.error.details || 
                            `Code: ${insertResult.error.code}` ||
                            'Erreur inconnue lors de l\'insertion';
        
        throw new Error(errorMessage);
      }

      console.log('✅ Inscription réussie!');

      // Mettre à jour l'état local
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, registered: true, attendees: event.attendees + 1 }
          : event
      ));

      alert('✅ Inscription réussie!');
      
    } catch (error) {
      console.error('💥 Erreur globale dans catch:');
      console.error('- Error object:', error);
      console.error('- Error message:', error.message);
      console.error('- Error name:', error.name);
      console.error('- Error stack:', error.stack);
      console.error('- Error stringified:', JSON.stringify(error));
      console.error('- Error constructor:', error.constructor.name);
      
      alert(`❌ ${error.message || 'Erreur inconnue lors de l\'inscription'}`);
    } finally {
      setRegistering(null);
    }
  };

  // Fonction pour se désinscrire d'un événement
  const unregisterFromEvent = async (eventId) => {
    if (!user?.id) return;

    console.log('Tentative de désinscription de l\'événement:', eventId, 'par l\'utilisateur:', user.id);
    setRegistering(eventId);
    
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur désinscription:', error);
        throw error;
      }

      console.log('Désinscription réussie');

      // Mettre à jour l'état local
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, registered: false, attendees: Math.max(0, event.attendees - 1) }
          : event
      ));

      alert('Désinscription réussie.');
      
    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      alert(`Erreur lors de la désinscription: ${error.message}`);
    } finally {
      setRegistering(null);
    }
  };

  // Fonction pour créer un nouvel événement
  const createEvent = async () => {
    if (!user?.id) {
      alert('Vous devez être connecté pour créer un événement');
      return;
    }

    // Validation basique
    if (!newEvent.title || !newEvent.start_date || !newEvent.start_time) {
      alert('Veuillez remplir au minimum le titre, la date et l\'heure');
      return;
    }

    setCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          description: newEvent.description || null,
          start_date: newEvent.start_date,
          start_time: newEvent.start_time,
          end_date: newEvent.end_date || newEvent.start_date,
          end_time: newEvent.end_time || null,
          location: newEvent.location || null,
          category: newEvent.category,
          price: newEvent.price || 0,
          max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null,
          organizer_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création événement:', error);
        throw error;
      }

      // L'organisateur est automatiquement inscrit
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'confirmed',
          registration_date: new Date().toISOString()
        });

      alert('Événement créé avec succès !');
      setShowCreateModal(false);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        location: '',
        category: 'Networking',
        price: 0,
        max_participants: ''
      });
      
      // Recharger les événements
      fetchEvents();
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      alert(`Erreur lors de la création: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  // Filtrage des événements
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    let matchesDate = true;
    if (selectedDate !== 'all') {
      const eventDate = new Date(event.date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      switch (selectedDate) {
        case "Aujourd'hui":
          matchesDate = eventDate.toDateString() === today.toDateString();
          break;
        case "Cette semaine":
          matchesDate = eventDate >= today && eventDate <= nextWeek;
          break;
        case "Ce mois":
          matchesDate = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
          break;
        case "Mois prochain":
          matchesDate = eventDate >= today && eventDate <= nextMonth;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement des événements...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Événements</h1>
            <p className="text-gray-300 text-lg">Participez aux meilleurs événements entrepreneuriaux</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer un événement
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des événements..."
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-slate-800">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-800">{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-slate-800">Toutes les dates</option>
                  <option value="Aujourd'hui" className="bg-slate-800">Aujourd'hui</option>
                  <option value="Cette semaine" className="bg-slate-800">Cette semaine</option>
                  <option value="Ce mois" className="bg-slate-800">Ce mois</option>
                  <option value="Mois prochain" className="bg-slate-800">Mois prochain</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-6 mb-8 text-center">
            <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <p className="text-orange-400 text-lg">{error}</p>
          </div>
        )}

        {/* Results Count */}
        {!error && filteredEvents.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-300">
              <span className="text-white font-semibold">{filteredEvents.length}</span> événements trouvés
            </p>
          </div>
        )}

        {/* Featured Events */}
        {filteredEvents.filter(event => event.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Événements en vedette</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredEvents.filter(event => event.featured).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={registerForEvent}
                  onUnregister={unregisterFromEvent}
                  registering={registering}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        {filteredEvents.filter(event => !event.featured).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {filteredEvents.filter(event => event.featured).length > 0 ? 'Autres événements' : 'Événements'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.filter(event => !event.featured).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={registerForEvent}
                  onUnregister={unregisterFromEvent}
                  registering={registering}
                  featured={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Events Found */}
        {!loading && !error && filteredEvents.length === 0 && events.length > 0 && (
          <div className="text-center py-16">
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-300 mb-4">Essayez de modifier vos filtres de recherche</p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDate('all');
                setSearchTerm('');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal de création d'événement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Créer un nouvel événement</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titre de l'événement *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Meetup Startup Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Décrivez votre événement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de début *</label>
                  <input
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Heure de début *</label>
                  <input
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Heure de fin</label>
                  <input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lieu</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Station F, Paris"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Networking" className="bg-slate-800">Networking</option>
                    <option value="Conference" className="bg-slate-800">Conférence</option>
                    <option value="Workshop" className="bg-slate-800">Workshop</option>
                    <option value="Formation" className="bg-slate-800">Formation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prix (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max participants</label>
                  <input
                    type="number"
                    min="1"
                    value={newEvent.max_participants}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, max_participants: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Illimité"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={createEvent}
                disabled={creating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center"
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                {creating ? 'Création...' : 'Créer l\'événement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant EventCard séparé pour réduire la duplication
const EventCard = ({ event, onRegister, onUnregister, registering, featured }) => (
  <div className={`backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all group ${
    featured 
      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:scale-105' 
      : 'bg-white/10 hover:bg-white/20'
  }`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">{event.image}</div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-bold text-white ${featured ? 'text-xl' : 'text-lg'}`}>{event.title}</h3>
            {featured && <Star className="h-5 w-5 text-yellow-400" />}
            {event.isOrganizer && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Organisateur</span>}
          </div>
          <p className="text-gray-300 text-sm">{event.organizer}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-white/10 transition-all">
          <Heart className="h-5 w-5 text-gray-400 hover:text-red-400" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-all">
          <Share2 className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
    
    <p className="text-gray-300 text-sm mb-4">{event.description}</p>
    
    <div className={`grid ${featured ? 'md:grid-cols-2' : ''} gap-4 mb-4`}>
      <div className="flex items-center space-x-2 text-gray-300">
        <Calendar className="h-4 w-4 text-purple-400" />
        <span className="text-sm">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-300">
        <Clock className="h-4 w-4 text-purple-400" />
        <span className="text-sm">{event.time}</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-300">
        <MapPin className="h-4 w-4 text-purple-400" />
        <span className="text-sm">{event.location}</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-300">
        <Users className="h-4 w-4 text-purple-400" />
        <span className="text-sm">
          {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} participants
        </span>
      </div>
    </div>

    {event.tags && event.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs">
            {tag}
          </span>
        ))}
      </div>
    )}

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          event.price === 'Gratuit' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
        }`}>
          {event.price}
        </span>
        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold">
          {event.category}
        </span>
      </div>
      
      {!event.isOrganizer && (
        <button 
          onClick={() => event.registered ? onUnregister(event.id) : onRegister(event.id)}
          disabled={registering === event.id}
          className={`px-6 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 ${
            event.registered 
              ? featured
                ? 'bg-green-500/20 text-green-400 border border-green-400/20 hover:bg-red-500/20 hover:text-red-400'
                : 'bg-green-500/20 text-green-400 border border-green-400/20 hover:bg-red-500/20 hover:text-red-400'
              : featured
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
          }`}>
          {registering === event.id ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : event.registered ? (
            featured ? 'Se désinscrire' : 'Inscrit'
          ) : (
            's\'inscrire'
          )}
        </button>
      )}
    </div>
  </div>
);

const EventsPage = () => {
  return (
    <ProtectedRoute>
      <EventsPageContent />
    </ProtectedRoute>
  );
};

export default EventsPage;
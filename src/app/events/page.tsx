"use client";

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
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
  User as UserIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateEventModal from '../../components/CreateEventModal';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  location: string;
  category: string | null;
  price: number;
  max_participants: number;
  cover_url: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  organizer: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
    avatar_url: string | null;
  };
  participants: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  }>;
  is_registered?: boolean;
  is_organizer?: boolean;
  tags?: string[];
}

const EventsPageContent = () => {
  const { user, profile, registerForEvent } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Charger les événements depuis la base de données
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construire la requête
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(*),
          participants:event_participants(
            id,
            status,
            user:profiles(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .order('start_date', { ascending: true });
      
      // Appliquer les filtres
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedDate !== 'all') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;
        
        switch (selectedDate) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'tomorrow':
            startDate = addDays(new Date(now.setHours(0, 0, 0, 0)), 1);
            endDate = addDays(new Date(now.setHours(23, 59, 59, 999)), 1);
            break;
          case 'this_week':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = addDays(now, 7);
            break;
          case 'next_week':
            startDate = addDays(now, 7 - now.getDay()); // Dimanche prochain
            endDate = addDays(startDate, 7);
            break;
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
          default:
            startDate = now;
            endDate = new Date(now.getFullYear() + 1, 0, 1); // Un an plus tard
        }
        
        query = query
          .gte('start_date', startDate.toISOString())
          .lte('start_date', endDate.toISOString());
      }
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Traiter les données des événements
      const processedEvents = (data || []).map(event => ({
        ...event,
        // Vérifier si l'utilisateur est inscrit à l'événement
        is_registered: user ? event.participants.some((p: any) => p.user.id === user.id && p.status === 'confirmed') : false,
        // Vérifier si l'utilisateur est l'organisateur
        is_organizer: user ? event.organizer_id === user.id : false,
        // Ajouter des tags par défaut si non définis
        tags: event.tags || []
      }));
      
      setEvents(processedEvents);
      
      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(processedEvents.map(e => e.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [selectedCategory, selectedDate, searchTerm, user]);
  
  // Charger les événements au montage du composant
  useEffect(() => {
    loadEvents();
    
    // S'abonner aux changements en temps réel
    const subscription = supabase
      .channel('events')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'events' 
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [loadEvents]);
  
  // S'abonner aux nouveaux événements en temps réel
  useEffect(() => {
    const subscription = supabase
      .channel('events')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'events' 
        },
        () => {
          // Recharger les événements lorsqu'un événement est ajouté, mis à jour ou supprimé
          loadEvents();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fonction pour s'inscrire à un événement
  const handleRegister = async (eventId: string) => {
    if (!user) return;
    
    try {
      setRegisteringEvent(eventId);
      
      // Vérifier si l'utilisateur est déjà inscrit
      const event = events.find(e => e.id === eventId);
      if (event?.is_registered || event?.is_organizer) return;
      
      // Vérifier si l'événement est complet
      if (event?.max_participants && event.participants.length >= event.max_participants) {
        alert('Désolé, cet événement est complet.');
        return;
      }
      
      // S'inscrire à l'événement
      await registerForEvent(eventId);
      
      // Mettre à jour l'état local
      setEvents(prev => 
        prev.map(e => 
          e.id === eventId 
            ? { 
                ...e, 
                is_registered: true,
                participants: [
                  ...e.participants, 
                  { 
                    id: `temp-${Date.now()}`,
                    status: 'confirmed',
                    user: {
                      id: user.id,
                      first_name: profile?.first_name || '',
                      last_name: profile?.last_name || '',
                      avatar_url: profile?.avatar_url || ''
                    }
                  }
                ]
              } 
            : e
        )
      );
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription à l\'événement:', error);
      alert('Une erreur est survenue lors de votre inscription. Veuillez réessayer.');
    } finally {
      setRegisteringEvent(null);
    }
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'd MMM yyyy', { locale: fr });
  };
  
  // Fonction pour formater l'heure
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm');
  };
  
  // Fonction pour obtenir les initiales d'un nom
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };
  
  // Afficher un indicateur de chargement pendant le chargement initial
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }
  
  // Fonction pour recharger les événements après création
  const handleEventCreated = () => {
    loadEvents();
  };

  const dateFilters = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'tomorrow', label: 'Demain' },
    { id: 'this_week', label: 'Cette semaine' },
    { id: 'next_week', label: 'La semaine prochaine' },
    { id: 'this_month', label: 'Ce mois-ci' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Fonction pour formater la date
  const formatEventDate = (dateString: string) => {
    return format(parseISO(dateString), 'd MMM yyyy', { locale: fr });
  };
  
  // Fonction pour formater l'heure
  const formatEventTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm');
  };
  
  // La fonction handleRegister est déjà définie plus haut dans le fichier (ligne 226)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      {/* Bouton pour ouvrir le modal de création */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Événements</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Créer un événement
          </button>
        </div>
      </div>

      {/* Modal de création d'événement */}
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Search & Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder="Rechercher des événements..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </button>
        </div>

        {/* Filtres déroulants (optionnel) */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-medium mb-3">Filtrer par :</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ajoutez ici vos champs de filtre */}
            </div>
          </div>
        )}
      </div>

      {/* Liste des événements */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <span className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded">
                  {event.category || 'Général'}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{event.description}</p>
              
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.start_date)}</span>
                {event.end_date && (
                  <span className="mx-1">- {formatDate(event.end_date)}</span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex items-center space-x-1 text-gray-300 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.participants?.length || 0}/{event.max_participants}</span>
                </div>
                
                <button 
                  onClick={() => handleRegister(event.id)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    event.is_registered 
                      ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                      : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                  }`}
                >
                  {event.is_registered ? 'Inscrit' : 'S\'inscrire'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105">
          Voir plus d'événements
        </button>
      </div>
    </div>
  );
};

const EventsPage = () => {
  return (
    <ProtectedRoute>
      <EventsPageContent />
    </ProtectedRoute>
  );
};

export default EventsPage;
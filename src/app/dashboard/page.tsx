"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import Navigation from '../../../components/Navigation';
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  TrendingUp, 
  Search, 
  Plus,
  UserPlus,
  Target,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const DashboardContent = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState(0);
  const [connections, setConnections] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    events: 0,
    profileViews: 0,
    connectionsChange: 0,
    messagesChange: 0,
    eventsChange: 0,
    viewsChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour récupérer les statistiques RÉELLES
  const fetchStats = async () => {
    try {
      // Connexions acceptées
      const { count: connectionsCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      // Messages REÇUS par l'utilisateur
      const { count: messagesReceivedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id);

      // Messages ENVOYÉS par l'utilisateur  
      const { count: messagesSentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user?.id);

      const totalMessages = (messagesReceivedCount || 0) + (messagesSentCount || 0);

      // Événements où l'utilisateur est inscrit
      const { count: eventsCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .in('status', ['registered', 'confirmed', 'attended']);

      // Vues du profil
      const { count: profileViewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_user_id', user?.id);

      // Calcul des changements (comparaison avec la semaine dernière)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Nouvelles connexions cette semaine
      const { count: newConnectionsThisWeek } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'accepted')
        .gte('updated_at', oneWeekAgo.toISOString());

      // Nouveaux messages cette semaine
      const { count: newMessagesThisWeek } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`receiver_id.eq.${user?.id},sender_id.eq.${user?.id}`)
        .gte('created_at', oneWeekAgo.toISOString());

      // Nouveaux événements cette semaine
      const { count: newEventsThisWeek } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('registration_date', oneWeekAgo.toISOString());

      // Nouvelles vues cette semaine
      const { count: newViewsThisWeek } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_user_id', user?.id)
        .gte('viewed_at', oneWeekAgo.toISOString());

      setStats({
        connections: connectionsCount || 0,
        messages: totalMessages,
        events: eventsCount || 0,
        profileViews: profileViewsCount || 0,
        connectionsChange: newConnectionsThisWeek || 0,
        messagesChange: newMessagesThisWeek || 0,
        eventsChange: newEventsThisWeek || 0,
        viewsChange: newViewsThisWeek || 0
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setStats({
        connections: 0,
        messages: 0,
        events: 0,
        profileViews: 0,
        connectionsChange: 0,
        messagesChange: 0,
        eventsChange: 0,
        viewsChange: 0
      });
    }
  };

  // Fonction pour récupérer les connexions RÉELLES
  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          connected_user:profiles!connections_connected_user_id_fkey(
            id,
            first_name,
            last_name,
            company,
            position
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur connexions:', error);
        throw error;
      }

      const formattedConnections = data?.map(conn => ({
        id: conn.id,
        name: `${conn.connected_user.first_name || ''} ${conn.connected_user.last_name || ''}`.trim() || 'Utilisateur',
        company: conn.connected_user.company || 'Entrepreneur',
        sector: conn.connected_user.position || 'Entrepreneur',
        avatar: (conn.connected_user.first_name || 'U').charAt(0).toUpperCase(),
        status: Math.random() > 0.5 ? 'online' : 'offline' // TODO: Système de présence réel
      })) || [];

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      setConnections([]);
    }
  };

  // Fonction pour récupérer les messages récents RÉELS
  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('receiver_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur messages:', error);
        throw error;
      }

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        from: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() || 'Utilisateur',
        message: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
        time: formatTimeAgo(new Date(msg.created_at)),
        unread: !msg.is_read
      })) || [];

      setRecentMessages(formattedMessages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      setRecentMessages([]);
    }
  };

  // Fonction pour récupérer les événements à venir RÉELS
  const fetchUpcomingEvents = async () => {
    try {
      // D'abord, récupérer les événements où l'utilisateur est inscrit
      const { data: participations, error: participError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          status,
          events:event_id (
            id,
            title,
            start_date,
            start_time,
            location,
            max_participants
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['registered', 'confirmed']);

      if (participError) {
        console.error('Erreur participations:', participError);
        throw participError;
      }

      // Filtrer les événements futurs
      const today = new Date().toISOString().split('T')[0];
      const futureEvents = participations?.filter(p => 
        p.events && p.events.start_date >= today
      ) || [];

      // Pour chaque événement, compter le nombre de participants
      const eventsWithCounts = await Promise.all(
        futureEvents.map(async (participation) => {
          const { count } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', participation.event_id)
            .in('status', ['registered', 'confirmed', 'attended']);

          return {
            id: participation.events.id,
            title: participation.events.title,
            date: formatDate(new Date(participation.events.start_date)),
            time: participation.events.start_time || '00:00',
            location: participation.events.location || 'À définir',
            attendees: count || 0,
            maxAttendees: participation.events.max_participants,
            status: participation.status
          };
        })
      );

      // Trier par date
      eventsWithCounts.sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingEvents(eventsWithCounts.slice(0, 3));
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      setUpcomingEvents([]);
    }
  };

  // Fonction pour récupérer les notifications non lues RÉELLES
  const fetchNotifications = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(count || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setNotifications(0);
    }
  };

  // Fonctions utilitaires pour le formatage
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'hier';
    } else {
      return `il y a ${diffInDays} jours`;
    }
  };

  const formatDate = (date) => {
    const options = { 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Charger toutes les données au montage du composant
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          await Promise.all([
            fetchStats(),
            fetchConnections(),
            fetchRecentMessages(),
            fetchUpcomingEvents(),
            fetchNotifications()
          ]);
        } catch (error) {
          console.error('Erreur lors du chargement du dashboard:', error);
          setError('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Données formatées pour l'affichage des stats
  const statsDisplay = [
    { 
      label: "Connexions", 
      value: stats.connections.toString(), 
      change: stats.connectionsChange > 0 ? `+${stats.connectionsChange}` : stats.connectionsChange.toString(), 
      color: "text-purple-400" 
    },
    { 
      label: "Messages", 
      value: stats.messages.toString(), 
      change: stats.messagesChange > 0 ? `+${stats.messagesChange}` : stats.messagesChange.toString(), 
      color: "text-blue-400" 
    },
    { 
      label: "Événements", 
      value: stats.events.toString(), 
      change: stats.eventsChange > 0 ? `+${stats.eventsChange}` : stats.eventsChange.toString(), 
      color: "text-green-400" 
    },
    { 
      label: "Profil vu", 
      value: stats.profileViews.toString(), 
      change: stats.viewsChange > 0 ? `+${stats.viewsChange}` : stats.viewsChange.toString(), 
      color: "text-orange-400" 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement de votre dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bienvenue, {profile?.first_name || 'Entrepreneur'} ! 👋
          </h1>
          <p className="text-gray-300 text-lg">Voici un aperçu de ton activité entrepreneuriale</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/discover" className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group text-center">
            <Search className="h-8 w-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Découvrir</h3>
            <p className="text-gray-400 text-sm">Nouveaux entrepreneurs</p>
          </Link>
          <Link href="/messages" className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group text-center">
            <MessageCircle className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Messages</h3>
            <p className="text-gray-400 text-sm">
              {recentMessages.filter(msg => msg.unread).length} non lus
            </p>
          </Link>
          <Link href="/events" className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group text-center">
            <Calendar className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Événements</h3>
            <p className="text-gray-400 text-sm">{upcomingEvents.length} à venir</p>
          </Link>
          <Link href="/profile" className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group text-center">
            <Users className="h-8 w-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Profil</h3>
            <p className="text-gray-400 text-sm">Gérer</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-sm font-medium">{stat.label}</h3>
                <span className={`text-sm font-semibold ${
                  parseInt(stat.change) > 0 ? 'text-green-400' : 
                  parseInt(stat.change) < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Connexions récentes */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Users className="h-6 w-6 text-purple-400 mr-2" />
                Connexions récentes
              </h3>
              <Link href="/discover" className="text-purple-400 hover:text-purple-300 transition-colors">
                <UserPlus className="h-5 w-5" />
              </Link>
            </div>
            <div className="space-y-4">
              {connections.length > 0 ? connections.map((connection) => (
                <div key={connection.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {connection.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${connection.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{connection.name}</div>
                    <div className="text-gray-400 text-sm">{connection.company} • {connection.sector}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-4">
                  <p>Aucune connexion pour le moment</p>
                  <Link href="/discover" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                    Découvrir des entrepreneurs →
                  </Link>
                </div>
              )}
            </div>
            {connections.length > 0 && (
              <Link href="/discover" className="block text-center text-purple-400 hover:text-purple-300 transition-colors mt-4 font-semibold">
                Voir toutes les connexions
              </Link>
            )}
          </div>

          {/* Messages récents */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <MessageCircle className="h-6 w-6 text-blue-400 mr-2" />
                Messages récents
              </h3>
              <Link href="/messages" className="text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="h-5 w-5" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentMessages.length > 0 ? recentMessages.map((message) => (
                <div key={message.id} className={`p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer ${message.unread ? 'border-l-4 border-blue-400' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-white font-semibold text-sm">{message.from}</div>
                    <div className="text-gray-400 text-xs">{message.time}</div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">{message.message}</p>
                  {message.unread && (
                    <div className="flex items-center justify-end mt-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-gray-400 py-4">
                  <p>Aucun message pour le moment</p>
                  <Link href="/discover" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                    Commencer une conversation →
                  </Link>
                </div>
              )}
            </div>
            {recentMessages.length > 0 && (
              <Link href="/messages" className="block text-center text-blue-400 hover:text-blue-300 transition-colors mt-4 font-semibold">
                Voir tous les messages
              </Link>
            )}
          </div>

          {/* Événements à venir */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Calendar className="h-6 w-6 text-green-400 mr-2" />
                Événements à venir
              </h3>
              <Link href="/events" className="text-green-400 hover:text-green-300 transition-colors">
                <Plus className="h-5 w-5" />
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-white font-semibold text-sm">{event.title}</div>
                    <div className="text-green-400 text-xs font-semibold">{event.date}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-400 text-sm">{event.time}</div>
                    <div className="text-gray-400 text-xs">{event.attendees} participants</div>
                  </div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {event.status === 'confirmed' ? 'Confirmé' : 'Inscrit'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-4">
                  <p>Aucun événement à venir</p>
                  <Link href="/events" className="text-green-400 hover:text-green-300 transition-colors text-sm">
                    Découvrir des événements →
                  </Link>
                </div>
              )}
            </div>
            {upcomingEvents.length > 0 && (
              <Link href="/events" className="block text-center text-green-400 hover:text-green-300 transition-colors mt-4 font-semibold">
                Voir tous les événements
              </Link>
            )}
          </div>
        </div>

        {/* Recommandations */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-4">
              <Target className="h-6 w-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Recommandations pour toi</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">Entrepreneurs similaires</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">Découvrez des entrepreneurs dans votre secteur</p>
                <Link href="/discover" className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold">
                  Découvrir →
                </Link>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">Événements suggérés</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">Participez aux événements de votre communauté</p>
                <Link href="/events" className="text-green-400 hover:text-green-300 transition-colors text-sm font-semibold">
                  Explorer →
                </Link>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <TrendingUp className="h-5 w-5 text-orange-400 mr-2" />
                  <span className="text-white font-semibold">Profil optimisé</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">Complétez votre profil pour plus de visibilité</p>
                <Link href="/profile" className="text-orange-400 hover:text-orange-300 transition-colors text-sm font-semibold">
                  Compléter →
                </Link>
              </div>
            </div>
          </div>
        </div>
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
              <Link href="/messages" className="hover:text-white transition-colors">Messages</Link>
              <Link href="/events" className="hover:text-white transition-colors">Événements</Link>
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

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default Dashboard;
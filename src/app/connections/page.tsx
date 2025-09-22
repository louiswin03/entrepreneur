"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  MessageCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Mail,
  Building
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';
import Link from 'next/link';

const ConnectionsPageContent = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // received, sent, accepted
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);

  // Récupérer toutes les connexions
  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError('');

      // Récupérer les demandes reçues (status: pending)
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          user_id,
          requester:profiles!connections_user_id_fkey(
            id,
            first_name,
            last_name,
            company,
            position,
            bio,
            avatar_url,
            is_verified
          )
        `)
        .eq('connected_user_id', user?.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Récupérer les demandes envoyées
      const { data: sentRequests, error: sentError } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          connected_user_id,
          recipient:profiles!connections_connected_user_id_fkey(
            id,
            first_name,
            last_name,
            company,
            position,
            bio,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', user?.id);

      if (sentError) throw sentError;

      // Récupérer les connexions acceptées (dans les deux sens)
      const { data: acceptedConnections1, error: accepted1Error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          connected_user_id,
          connected:profiles!connections_connected_user_id_fkey(
            id,
            first_name,
            last_name,
            company,
            position,
            bio,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      const { data: acceptedConnections2, error: accepted2Error } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          user_id,
          connected:profiles!connections_user_id_fkey(
            id,
            first_name,
            last_name,
            company,
            position,
            bio,
            avatar_url,
            is_verified
          )
        `)
        .eq('connected_user_id', user?.id)
        .eq('status', 'accepted');

      if (accepted1Error) throw accepted1Error;
      if (accepted2Error) throw accepted2Error;

      // Formater les données
      const formatConnectionData = (connectionData, otherUserKey, type) => {
        return connectionData?.map(conn => ({
          id: conn.id,
          type: type,
          status: conn.status,
          createdAt: new Date(conn.created_at),
          updatedAt: conn.updated_at ? new Date(conn.updated_at) : null,
          user: conn[otherUserKey],
          otherUserId: type === 'received' ? conn.user_id : 
                      type === 'sent' ? conn.connected_user_id :
                      conn.connected_user_id || conn.user_id
        })) || [];
      };

      const formattedReceivedRequests = formatConnectionData(receivedRequests, 'requester', 'received');
      const formattedSentRequests = formatConnectionData(sentRequests, 'recipient', 'sent');
      const formattedAcceptedConnections = [
        ...formatConnectionData(acceptedConnections1, 'connected', 'accepted'),
        ...formatConnectionData(acceptedConnections2, 'connected', 'accepted')
      ];

      setConnections({
        received: formattedReceivedRequests,
        sent: formattedSentRequests,
        accepted: formattedAcceptedConnections
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      setError('Erreur lors du chargement des connexions');
    } finally {
      setLoading(false);
    }
  };

  // Accepter une demande de connexion
  const acceptRequest = async (connectionId, requesterId) => {
    try {
      setProcessingRequest(connectionId);

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;

      // Créer une notification pour l'expéditeur
      await supabase
        .from('notifications')
        .insert({
          user_id: requesterId,
          type: 'connection_accepted',
          title: 'Connexion acceptée',
          message: `${profile?.first_name || 'Un entrepreneur'} a accepté votre demande de connexion`,
          related_id: user?.id
        });

      // Recharger les connexions
      await fetchConnections();
      
      alert('Demande acceptée !');

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'acceptation');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Refuser une demande de connexion
  const declineRequest = async (connectionId, requesterId) => {
    try {
      setProcessingRequest(connectionId);

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('connections')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;

      // Recharger les connexions
      await fetchConnections();
      
      alert('Demande refusée');

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du refus');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Démarrer une conversation
  const startConversation = async (otherUserId) => {
    try {
      // Vérifier s'il y a déjà une conversation
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user?.id})`)
        .limit(1);

      if (!existingMessages || existingMessages.length === 0) {
        // Créer un message initial
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user?.id,
            receiver_id: otherUserId,
            content: 'Salut ! Je suis ravi de faire ta connaissance 👋'
          });

        if (error) throw error;
      }

      // Rediriger vers les messages
      window.location.href = '/messages';

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ouverture de la conversation');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConnections();
    }
  }, [user?.id]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // Filtrer selon la recherche
  const getFilteredConnections = () => {
    const currentConnections = connections[activeTab] || [];
    if (!searchTerm) return currentConnections;
    
    return currentConnections.filter(conn => {
      const userName = `${conn.user?.first_name || ''} ${conn.user?.last_name || ''}`.toLowerCase();
      const company = (conn.user?.company || '').toLowerCase();
      return userName.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
    });
  };

  const filteredConnections = getFilteredConnections();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement de vos connexions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Mes Connexions</h1>
            <p className="text-gray-300 text-lg">Gérez vos demandes de connexion et votre réseau professionnel</p>
          </div>
          <Link 
            href="/discover" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Découvrir
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'received' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Demandes reçues</span>
              {connections.received && connections.received.length > 0 && (
                <span className="bg-purple-500 text-white rounded-full px-2 py-1 text-xs">
                  {connections.received.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'accepted' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Mes connexions</span>
              {connections.accepted && connections.accepted.length > 0 && (
                <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                  {connections.accepted.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'sent' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Demandes envoyées</span>
              {connections.sent && connections.sent.length > 0 && (
                <span className="bg-yellow-500 text-white rounded-full px-2 py-1 text-xs">
                  {connections.sent.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos connexions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={fetchConnections} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Connections List */}
        <div className="space-y-4">
          {filteredConnections.length > 0 ? (
            filteredConnections.map((connection) => (
              <div key={connection.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {connection.user?.avatar_url || (connection.user?.first_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      {connection.user?.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {connection.user?.first_name} {connection.user?.last_name}
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-1">{connection.user?.position || 'Entrepreneur'}</p>
                      <div className="flex items-center space-x-1 text-gray-400 text-sm mb-2">
                        <Building className="h-4 w-4" />
                        <span>{connection.user?.company || 'Startup'}</span>
                      </div>
                      {connection.user?.bio && (
                        <p className="text-gray-400 text-sm line-clamp-2">{connection.user.bio}</p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {activeTab === 'received' && 'Demande reçue'}
                        {activeTab === 'sent' && 'Demande envoyée'}
                        {activeTab === 'accepted' && 'Connectés depuis'}
                      </p>
                      <p className="text-gray-300 text-sm font-medium">
                        {formatTimeAgo(connection.updatedAt || connection.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 ml-6">
                    {activeTab === 'received' && connection.status === 'pending' && (
                      <>
                        <button
                          onClick={() => acceptRequest(connection.id, connection.otherUserId)}
                          disabled={processingRequest === connection.id}
                          className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                          {processingRequest === connection.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => declineRequest(connection.id, connection.otherUserId)}
                          disabled={processingRequest === connection.id}
                          className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Refuser</span>
                        </button>
                      </>
                    )}

                    {activeTab === 'sent' && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {connection.status === 'pending' ? 'En attente' : 
                           connection.status === 'accepted' ? 'Acceptée' : 
                           connection.status === 'declined' ? 'Refusée' : connection.status}
                        </span>
                      </div>
                    )}

                    {activeTab === 'accepted' && (
                      <button
                        onClick={() => startConversation(connection.otherUserId)}
                        className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-all flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'received' && <UserPlus className="h-12 w-12 text-white" />}
                {activeTab === 'sent' && <Clock className="h-12 w-12 text-white" />}
                {activeTab === 'accepted' && <Users className="h-12 w-12 text-white" />}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'received' && 'Aucune demande reçue'}
                {activeTab === 'sent' && 'Aucune demande envoyée'}
                {activeTab === 'accepted' && 'Aucune connexion'}
              </h3>
              <p className="text-gray-300 mb-4">
                {activeTab === 'received' && 'Les demandes de connexion que vous recevrez apparaîtront ici'}
                {activeTab === 'sent' && 'Les demandes que vous envoyez apparaîtront ici'}
                {activeTab === 'accepted' && 'Vos connexions acceptées apparaîtront ici'}
              </p>
              {(activeTab === 'received' || activeTab === 'accepted') && (
                <Link 
                  href="/discover" 
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Découvrir des entrepreneurs</span>
                </Link>
              )}
            </div>
          )}
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

const ConnectionsPage = () => {
  return (
    <ProtectedRoute>
      <ConnectionsPageContent />
    </ProtectedRoute>
  );
};

export default ConnectionsPage;
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Circle
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';
import Link from 'next/link';

const MessagesPageContent = () => {
  const { user, profile } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les conversations
  const fetchConversations = async () => {
    try {
      // Récupérer les messages où l'utilisateur est sender ou receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          receiver_id,
          sender:profiles!messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            company
          ),
          receiver:profiles!messages_receiver_id_fkey(
            id,
            first_name,
            last_name,
            company
          )
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur messages:', error);
        throw error;
      }

      // Grouper les messages par conversation
      const conversationsMap = new Map();

      messagesData?.forEach(message => {
        const isOwn = message.sender_id === user?.id;
        const otherUser = isOwn ? message.receiver : message.sender;
        const conversationKey = isOwn ? message.receiver_id : message.sender_id;

        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            id: conversationKey,
            name: `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim(),
            company: otherUser?.company || 'Entrepreneur',
            avatar: (otherUser?.first_name || 'U').charAt(0).toUpperCase(),
            lastMessage: message.content,
            timestamp: formatTimeAgo(new Date(message.created_at)),
            unread: !isOwn && !message.is_read ? 1 : 0,
            online: Math.random() > 0.5, // Simulation
            messages: []
          });
        }
      });

      // Récupérer les messages de chaque conversation
      for (let [conversationKey, conversation] of conversationsMap) {
        const { data: conversationMessages } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            sender:profiles!messages_sender_id_fkey(first_name, last_name)
          `)
          .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${conversationKey}),and(sender_id.eq.${conversationKey},receiver_id.eq.${user?.id})`)
          .order('created_at', { ascending: true });

        conversation.messages = conversationMessages?.map(msg => ({
          id: msg.id,
          sender: msg.sender_id === user?.id ? "You" : `${msg.sender?.first_name} ${msg.sender?.last_name}`,
          content: msg.content,
          timestamp: formatTime(new Date(msg.created_at)),
          isOwn: msg.sender_id === user?.id
        })) || [];
      }

      setConversations(Array.from(conversationsMap.values()));
      
      // Sélectionner la première conversation par défaut
      if (conversationsMap.size > 0 && !selectedConversationId) {
        setSelectedConversationId(Array.from(conversationsMap.keys())[0]);
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      // Fallback avec des données fictives si pas de messages
      setConversations([
        {
          id: 'demo1',
          name: "Marie Dubois",
          company: "FinanceAI",
          avatar: "M",
          lastMessage: "Salut ! J'ai vu ton profil, très intéressant ton parcours.",
          timestamp: "il y a 5 min",
          unread: 2,
          online: true,
          messages: [
            { id: 1, sender: "Marie", content: "Salut ! J'ai vu ton profil, très intéressant ton parcours.", timestamp: "14:30", isOwn: false },
            { id: 2, sender: "You", content: "Merci Marie ! J'ai regardé FinanceAI, c'est exactement le type d'innovation qui m'intéresse.", timestamp: "14:35", isOwn: true },
          ]
        }
      ]);
      if (!selectedConversationId) {
        setSelectedConversationId('demo1');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const currentConversation = conversations.find(c => c.id === selectedConversationId);
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentConversation && selectedConversationId !== 'demo1') {
      try {
        // Insérer le message dans Supabase
        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender_id: user?.id,
            receiver_id: selectedConversationId,
            content: newMessage.trim()
          })
          .select()
          .single();

        if (error) throw error;

        // Ajouter le message à la conversation locale
        const newMessageObj = {
          id: data.id,
          sender: "You",
          content: newMessage,
          timestamp: formatTime(new Date()),
          isOwn: true
        };
        
        const updatedConversations = conversations.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessageObj],
              lastMessage: newMessage,
              timestamp: "à l'instant"
            };
          }
          return conv;
        });
        
        setConversations(updatedConversations);
        setNewMessage('');
        
      } catch (error) {
        console.error('Erreur envoi message:', error);
      }
    } else if (currentConversation) {
      // Mode démo
      const newMessageObj = {
        id: currentConversation.messages.length + 1,
        sender: "You",
        content: newMessage,
        timestamp: formatTime(new Date()),
        isOwn: true
      };
      
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessageObj],
            lastMessage: newMessage,
            timestamp: "à l'instant"
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Messages Layout */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-160px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/10 ${
                    selectedConversationId === conversation.id ? 'bg-white/20 border-l-4 border-l-purple-400' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {conversation.avatar}
                      </div>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold truncate">{conversation.name}</h3>
                        <span className="text-gray-400 text-xs">{conversation.timestamp}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{conversation.company}</p>
                      <p className="text-gray-300 text-sm truncate mt-1">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-gray-400">
                  <p>Aucune conversation pour le moment</p>
                  <Link href="/discover" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                    Découvrir des entrepreneurs
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {currentConversation ? (
            <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm">
              {/* Chat Header */}
              <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {currentConversation.avatar}
                    </div>
                    {currentConversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{currentConversation.name}</h3>
                    <p className="text-gray-400 text-sm">{currentConversation.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Info className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.isOwn
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white/10 text-white backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isOwn ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-300 mb-4">Choisissez une conversation pour commencer à discuter</p>
                <Link href="/discover" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  Découvrir des entrepreneurs →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer cohérent avec les autres pages */}
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

const MessagesPage = () => {
  return (
    <ProtectedRoute>
      <MessagesPageContent />
    </ProtectedRoute>
  );
};

export default MessagesPage;
"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Network,
  Bell,
  Phone,
  Video,
  Info,
  Archive,
  Star,
  Circle
} from 'lucide-react';
import Link from 'next/link';

const MessagesPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Marie Dubois",
      company: "FinanceAI",
      avatar: "M",
      lastMessage: "Super ! Je pense qu'on peut vraiment collaborer sur ce projet...",
      timestamp: "il y a 5 min",
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: "Marie", content: "Salut Louis ! J'ai vu ton profil, très intéressant ton parcours.", timestamp: "14:30", isOwn: false },
        { id: 2, sender: "You", content: "Merci Marie ! J'ai regardé FinanceAI, c'est exactement le type d'innovation qui m'intéresse.", timestamp: "14:35", isOwn: true },
        { id: 3, sender: "Marie", content: "On pourrait peut-être organiser un call cette semaine ?", timestamp: "14:37", isOwn: false },
        { id: 4, sender: "You", content: "Avec plaisir ! Je suis libre mercredi après-midi ou vendredi matin.", timestamp: "14:40", isOwn: true },
        { id: 5, sender: "Marie", content: "Super ! Je pense qu'on peut vraiment collaborer sur ce projet...", timestamp: "14:42", isOwn: false }
      ]
    },
    {
      id: 2,
      name: "Thomas Chen",
      company: "GreenTech Solutions",
      avatar: "T",
      lastMessage: "Merci pour ton expertise, ça m'aide beaucoup !",
      timestamp: "il y a 2h",
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: "Thomas", content: "Salut ! Tu as de l'expérience avec les levées de fonds Series A ?", timestamp: "12:15", isOwn: false },
        { id: 2, sender: "You", content: "Oui, j'ai accompagné plusieurs startups. Tu en es où avec GreenTech ?", timestamp: "12:18", isOwn: true },
        { id: 3, sender: "Thomas", content: "On prépare notre Series A pour Q2. Tes conseils seraient précieux !", timestamp: "12:20", isOwn: false },
        { id: 4, sender: "Thomas", content: "Merci pour ton expertise, ça m'aide beaucoup !", timestamp: "12:45", isOwn: false }
      ]
    },
    {
      id: 3,
      name: "Sophie Martinez",
      company: "HealthHub",
      avatar: "S",
      lastMessage: "Tu as l'expérience qu'il nous faut !",
      timestamp: "hier",
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: "Sophie", content: "Bonjour Louis ! On cherche un advisor pour HealthHub. Tu as l'expérience qu'il nous faut !", timestamp: "hier 16:30", isOwn: false }
      ]
    },
    {
      id: 4,
      name: "Alexandre Lefèvre",
      company: "EduTech Pro",
      avatar: "A",
      lastMessage: "Le networking event de jeudi était génial !",
      timestamp: "2 jours",
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: "Alexandre", content: "Le networking event de jeudi était génial !", timestamp: "2 jours", isOwn: false }
      ]
    },
    {
      id: 5,
      name: "Camille Petit",
      company: "FashionTech",
      avatar: "C",
      lastMessage: "On peut se voir la semaine prochaine ?",
      timestamp: "3 jours",
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: "Camille", content: "On peut se voir la semaine prochaine ?", timestamp: "3 jours", isOwn: false }
      ]
    }
  ]);

  const currentConversation = conversations.find(c => c.id === selectedConversationId);
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation) {
      // Création d'un nouveau message
      const newMessageObj = {
        id: currentConversation.messages.length + 1,
        sender: "You",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      
      // Mise à jour de la conversation avec le nouveau message
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
      
      // Mise à jour de l'état des conversations
      setConversations(updatedConversations);
      
      // Réinitialisation du champ de saisie
      setNewMessage('');
      
      // Ici, vous pourriez ajouter un appel API pour sauvegarder le message
      console.log('Message envoyé:', newMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">Découvrir</Link>
              <Link href="/messages" className="text-purple-400 font-semibold">Messages</Link>
              <Link href="/events" className="text-gray-300 hover:text-white transition-colors">Événements</Link>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                L
              </div>
            </div>
          </div>
        </div>
      </nav>

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
              {filteredConversations.map((conversation) => (
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
              ))}
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
                  <Network className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-300">Choisissez une conversation pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Network className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">EntrepreneurConnect</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <Link href="/discover" className="hover:text-white transition-colors">Découvrir</Link>
              <Link href="/events" className="hover:text-white transition-colors">Événements</Link>
              <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
              <Link href="/register" className="hover:text-white transition-colors">S'inscrire</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center">
            <p className="text-gray-400">&copy; 2025 EntrepreneurConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MessagesPage;
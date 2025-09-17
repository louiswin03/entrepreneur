"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  Plus,
  Network,
  Bell,
  Heart,
  Share2,
  ExternalLink,
  Tag,
  Ticket
} from 'lucide-react';
import Link from 'next/link';

const EventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées d'événements
  const events = [
    {
      id: 1,
      title: "Startup Meetup Paris",
      description: "Rencontrez les entrepreneurs les plus prometteurs de Paris. Présentations pitch, networking et afterwork.",
      date: "18 Sep 2025",
      time: "19:00 - 22:00",
      location: "Station F, Paris",
      category: "Networking",
      price: "Gratuit",
      attendees: 156,
      maxAttendees: 200,
      image: "🚀",
      organizer: "TechEvents Paris",
      featured: true,
      tags: ["Networking", "Pitch", "Startups"],
      registered: false
    },
    {
      id: 2,
      title: "Fintech Innovation Summit",
      description: "Découvrez les dernières innovations en Fintech avec des experts du secteur et des demos produits.",
      date: "22 Sep 2025",
      time: "09:00 - 18:00",
      location: "Palais des Congrès, Paris",
      category: "Conférence",
      price: "150€",
      attendees: 340,
      maxAttendees: 500,
      image: "💰",
      organizer: "Fintech France",
      featured: true,
      tags: ["Fintech", "Innovation", "Banking"],
      registered: true
    },
    {
      id: 3,
      title: "Women in Tech Breakfast",
      description: "Petit-déjeuner networking exclusif pour les femmes entrepreneures dans la tech.",
      date: "25 Sep 2025",
      time: "08:30 - 10:30",
      location: "WeWork Opéra, Paris",
      category: "Networking",
      price: "25€",
      attendees: 45,
      maxAttendees: 60,
      image: "👩‍💼",
      organizer: "Women in Tech",
      featured: false,
      tags: ["Women", "Tech", "Leadership"],
      registered: false
    },
    {
      id: 4,
      title: "AI & Future of Work",
      description: "Conférence sur l'impact de l'IA sur le monde du travail avec des cas d'usage concrets.",
      date: "28 Sep 2025",
      time: "14:00 - 17:00",
      location: "ESCP Business School, Paris",
      category: "Conférence",
      price: "75€",
      attendees: 120,
      maxAttendees: 150,
      image: "🤖",
      organizer: "AI Society",
      featured: false,
      tags: ["AI", "Future", "Innovation"],
      registered: false
    },
    {
      id: 5,
      title: "Sustainable Tech Workshop",
      description: "Atelier pratique sur les technologies durables et l'impact environnemental des startups.",
      date: "30 Sep 2025",
      time: "10:00 - 16:00",
      location: "The Family, Paris",
      category: "Workshop",
      price: "100€",
      attendees: 28,
      maxAttendees: 40,
      image: "🌱",
      organizer: "GreenTech Alliance",
      featured: false,
      tags: ["Sustainability", "Environment", "Workshop"],
      registered: true
    },
    {
      id: 6,
      title: "Fundraising Masterclass",
      description: "Masterclass intensive sur la levée de fonds avec des VCs et des entrepreneurs expérimentés.",
      date: "2 Oct 2025",
      time: "09:00 - 12:00",
      location: "NUMA, Paris",
      category: "Formation",
      price: "200€",
      attendees: 35,
      maxAttendees: 50,
      image: "💼",
      organizer: "Startup Academy",
      featured: true,
      tags: ["Fundraising", "VC", "Investment"],
      registered: false
    }
  ];

  const categories = ["Networking", "Conférence", "Workshop", "Formation"];
  const dateFilters = ["Aujourd'hui", "Cette semaine", "Ce mois", "Mois prochain"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">Découvrir</Link>
              <Link href="/messages" className="text-gray-300 hover:text-white transition-colors">Messages</Link>
              <Link href="/events" className="text-purple-400 font-semibold">Événements</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Événements</h1>
            <p className="text-gray-300 text-lg">Participez aux meilleurs événements entrepreneuriaux</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Créer un événement
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
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
            
            {/* Filter Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Filters Panel */}
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
                  {dateFilters.map(date => (
                    <option key={date} value={date} className="bg-slate-800">{date}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Featured Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Événements en vedette</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredEvents.filter(event => event.featured).map((event) => (
              <div key={event.id} className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{event.image}</div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{event.title}</h3>
                        <Star className="h-5 w-5 text-yellow-400" />
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
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{event.date}</span>
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
                    <span className="text-sm">{event.attendees}/{event.maxAttendees} participants</span>
                  </div>
                </div>

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
                  <button className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    event.registered 
                      ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}>
                    {event.registered ? 'Inscrit ✓' : 'S\'inscrire'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Events */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Tous les événements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.filter(event => !event.featured).map((event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{event.image}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      <p className="text-gray-400 text-sm">{event.organizer}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-all">
                    <Heart className="h-4 w-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-semibold ${
                      event.price === 'Gratuit' ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {event.price}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-300 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees}/{event.maxAttendees}</span>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    event.registered 
                      ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                      : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                  }`}>
                    {event.registered ? 'Inscrit' : 'S\'inscrire'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105">
            Voir plus d'événements
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
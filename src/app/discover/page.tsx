"use client";

import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import Navigation from '../../../components/Navigation';

const DiscoverPageContent = () => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées d'entrepreneurs
  const entrepreneurs = [
    {
      id: 1,
      name: "Marie Dubois",
      title: "CEO & Co-founder",
      company: "FinanceAI",
      sector: "Fintech",
      location: "Paris, France",
      experience: "5 ans d'expérience",
      connections: 234,
      avatar: "M",
      description: "Passionnée par l'IA appliquée à la finance. Cherche des partenaires pour révolutionner les services bancaires.",
      skills: ["AI", "Finance", "Leadership"],
      lookingFor: ["CTO", "Investisseurs"],
      online: true,
      verified: true
    },
    {
      id: 2,
      name: "Thomas Chen",
      title: "Founder",
      company: "GreenTech Solutions",
      sector: "Greentech",
      location: "Lyon, France",
      experience: "3 ans d'expérience",
      connections: 156,
      avatar: "T",
      description: "Développe des solutions durables pour l'industrie. À la recherche de co-fondateurs techniques.",
      skills: ["Sustainability", "IoT", "Hardware"],
      lookingFor: ["CTO", "Partenaires"],
      online: false,
      verified: true
    },
    {
      id: 3,
      name: "Sophie Martinez",
      title: "Co-founder & CPO",
      company: "HealthHub",
      sector: "Healthtech",
      location: "Marseille, France",
      experience: "7 ans d'expérience",
      connections: 312,
      avatar: "S",
      description: "Expert en UX dans le secteur santé. Construis l'avenir des soins à domicile.",
      skills: ["UX/UI", "Healthcare", "Product"],
      lookingFor: ["Investisseurs", "Mentors"],
      online: true,
      verified: true
    },
    {
      id: 4,
      name: "Alexandre Lefèvre",
      title: "Serial Entrepreneur",
      company: "EduTech Pro",
      sector: "Edtech",
      location: "Bordeaux, France",
      experience: "10+ ans d'expérience",
      connections: 567,
      avatar: "A",
      description: "3ème startup dans l'éducation. Mentor et investisseur angel. Toujours prêt à aider !",
      skills: ["Education", "Scaling", "Mentoring"],
      lookingFor: ["Startups à mentorer"],
      online: true,
      verified: true
    },
    {
      id: 5,
      name: "Camille Petit",
      title: "Founder",
      company: "FashionTech",
      sector: "E-commerce",
      location: "Nice, France",
      experience: "2 ans d'expérience",
      connections: 89,
      avatar: "C",
      description: "Révolutionne la mode avec l'IA. Première levée de fonds réussie à 23 ans.",
      skills: ["Fashion", "AI", "E-commerce"],
      lookingFor: ["CTO", "Partenaires retail"],
      online: false,
      verified: false
    },
    {
      id: 6,
      name: "Julien Robert",
      title: "CEO",
      company: "FoodTech Innovations",
      sector: "Foodtech",
      location: "Toulouse, France",
      experience: "4 ans d'expérience",
      connections: 198,
      avatar: "J",
      description: "Passionné par l'innovation alimentaire. Développe la prochaine génération de protéines.",
      skills: ["Food Innovation", "R&D", "Sustainability"],
      lookingFor: ["Investisseurs", "Partenaires industriels"],
      online: true,
      verified: true
    }
  ];

  const sectors = ["Fintech", "Greentech", "Healthtech", "Edtech", "E-commerce", "Foodtech"];
  const locations = ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice", "Toulouse"];

  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = entrepreneur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrepreneur.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrepreneur.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = selectedSector === 'all' || entrepreneur.sector === selectedSector;
    const matchesLocation = selectedLocation === 'all' || entrepreneur.location.includes(selectedLocation);
    
    return matchesSearch && matchesSector && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Découvrir des entrepreneurs</h1>
          <p className="text-gray-300 text-lg">Trouve ton prochain co-fondateur, mentor ou partenaire d'affaires</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
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
                  <option value="all" className="bg-slate-800">Toutes les villes</option>
                  {locations.map(location => (
                    <option key={location} value={location} className="bg-slate-800">{location}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-300">
            <span className="text-white font-semibold">{filteredEntrepreneurs.length}</span> entrepreneurs trouvés
          </p>
        </div>

        {/* Entrepreneurs Grid */}
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
                  <button className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all">
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105">
            Voir plus d'entrepreneurs
          </button>
        </div>
      </div>
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
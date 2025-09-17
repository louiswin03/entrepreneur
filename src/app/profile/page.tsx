"use client";

import React, { useState } from 'react';
import { 
  User, 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Edit3,
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Award,
  Target,
  Users,
  MessageCircle,
  Calendar,
  Network,
  Bell,
  Settings,
  Lock,
  Eye,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: 'Louis',
    lastName: 'Martin',
    email: 'louis.martin@startup.com',
    phone: '+33 6 12 34 56 78',
    company: 'StartupCorp',
    position: 'CEO & Fondateur',
    location: 'Paris, France',
    website: 'www.startupcorp.fr',
    bio: 'Entrepreneur passionné par l\'innovation technologique. 8 ans d\'expérience dans le développement de produits SaaS. Mentor et investisseur angel.',
    sector: 'SaaS',
    experience: 'Entrepreneur expérimenté',
    lookingFor: ['Investisseurs', 'Mentors', 'Partenaires techniques'],
    skills: ['Leadership', 'Product Management', 'Fundraising', 'SaaS', 'B2B Sales']
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');

  const stats = [
    { label: "Connexions", value: "127", icon: Users },
    { label: "Messages", value: "48", icon: MessageCircle },
    { label: "Événements", value: "8", icon: Calendar },
    { label: "Profil vu", value: "234", icon: Eye }
  ];

  const achievements = [
    { id: 1, title: "Early Adopter", description: "Parmi les 100 premiers membres", icon: "🏆" },
    { id: 2, title: "Networker", description: "Plus de 100 connexions", icon: "🤝" },
    { id: 3, title: "Mentor", description: "A aidé 5+ entrepreneurs", icon: "👨‍🏫" }
  ];

  const handleSave = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde du profil:', profileData);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLookingFor = () => {
    if (newLookingFor.trim() && !profileData.lookingFor.includes(newLookingFor.trim())) {
      setProfileData(prev => ({
        ...prev,
        lookingFor: [...prev.lookingFor, newLookingFor.trim()]
      }));
      setNewLookingFor('');
    }
  };

  const removeLookingFor = (item) => {
    setProfileData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.filter(lf => lf !== item)
    }));
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  L
                </div>
                <button className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{profileData.firstName} {profileData.lastName}</h1>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <p className="text-xl text-gray-300 mb-2">{profileData.position}</p>
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{profileData.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center"
            >
              {isEditing ? <X className="h-5 w-5 mr-2" /> : <Edit3 className="h-5 w-5 mr-2" />}
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white/10 rounded-xl p-4 text-center">
                  <IconComponent className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                activeTab === 'profile' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                activeTab === 'achievements' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Réussites
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                activeTab === 'settings' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Paramètres
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <User className="h-6 w-6 text-purple-400 mr-2" />
                Informations personnelles
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center justify-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Sauvegarder
                </button>
              )}
            </div>

            {/* Professional Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Briefcase className="h-6 w-6 text-purple-400 mr-2" />
                Informations professionnelles
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entreprise</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Poste</label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Localisation</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Star className="h-6 w-6 text-purple-400 mr-2" />
                Compétences
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <div key={index} className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="Ajouter une compétence"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={addSkill}
                      className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Looking For */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="h-6 w-6 text-purple-400 mr-2" />
                Je recherche
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profileData.lookingFor.map((item, index) => (
                    <div key={index} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm flex items-center">
                      {item}
                      {isEditing && (
                        <button onClick={() => removeLookingFor(item)} className="ml-2 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLookingFor}
                      onChange={(e) => setNewLookingFor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLookingFor()}
                      placeholder="Ajouter ce que vous recherchez"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={addLookingFor}
                      className="bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <Award className="h-8 w-8 text-purple-400 mr-3" />
              Mes réussites
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{achievement.title}</h4>
                  <p className="text-gray-300 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Settings className="h-6 w-6 text-purple-400 mr-2" />
                Paramètres du compte
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-semibold">Notifications par email</h4>
                    <p className="text-gray-400 text-sm">Recevoir des notifications par email</p>
                  </div>
                  <button className="bg-purple-600 relative inline-block w-12 h-6 rounded-full">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h4 className="text-white font-semibold">Profil public</h4>
                    <p className="text-gray-400 text-sm">Votre profil est visible par tous les membres</p>
                  </div>
                  <button className="bg-purple-600 relative inline-block w-12 h-6 rounded-full">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform translate-x-6"></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Lock className="h-6 w-6 text-purple-400 mr-2" />
                Sécurité
              </h3>
              
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className="text-white font-semibold">Changer le mot de passe</div>
                  <div className="text-gray-400 text-sm">Dernière modification il y a 3 mois</div>
                </button>
                
                <button className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className="text-white font-semibold">Authentification à deux facteurs</div>
                  <div className="text-gray-400 text-sm">Ajoutez une couche de sécurité supplémentaire</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
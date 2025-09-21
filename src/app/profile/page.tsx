"use client";

import React, { useState, useEffect } from 'react';
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
  Settings,
  Lock,
  Eye,
  Briefcase,
  Loader2
} from 'lucide-react';
import { ProtectedRoute } from '../../../lib/ProtectedRoute';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import Navigation from '../../../components/Navigation';

const ProfilePageContent = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    messages: 0,
    events: 0,
    profileViews: 0
  });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    location: '',
    website: '',
    bio: '',
    sector: '',
    experience: '',
    lookingFor: ['Investisseurs', 'Mentors', 'Partenaires techniques'],
    skills: ['Leadership', 'Product Management', 'Innovation']
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');

  // Fonction pour récupérer les vraies statistiques
  const fetchRealStats = async () => {
    try {
      // Connexions acceptées
      const { count: connectionsCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      // Messages envoyés + reçus
      const { count: messagesReceivedCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id);

      const { count: messagesSentCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user?.id);

      const totalMessages = (messagesReceivedCount || 0) + (messagesSentCount || 0);

      // Événements inscrits
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

      setStats({
        connections: connectionsCount || 0,
        messages: totalMessages,
        events: eventsCount || 0,
        profileViews: profileViewsCount || 0
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setStats({
        connections: 0,
        messages: 0,
        events: 0,
        profileViews: 0
      });
    }
  };

  // Charger les données du profil depuis la BDD
  const loadProfileData = async () => {
    try {
      if (profile) {
        setProfileData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: user?.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          position: profile.position || '',
          location: profile.location || '',
          website: profile.website || '',
          bio: profile.bio || '',
          sector: profile.sector || '',
          experience: profile.experience || '',
          // TODO: Ces champs pourraient être ajoutés à la table profiles
          lookingFor: ['Investisseurs', 'Mentors', 'Partenaires techniques'],
          skills: [profile.sector, 'Innovation', 'Leadership'].filter(Boolean)
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder les modifications du profil dans la BDD
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          company: profileData.company || null,
          position: profileData.position || null,
          bio: profileData.bio || null,
          location: profileData.location || null,
          sector: profileData.sector || null,
          experience: profileData.experience || null,
          website: profileData.website || null,
          phone: profileData.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Erreur sauvegarde profil:', error);
        alert('Erreur lors de la sauvegarde');
        return;
      }

      alert('Profil mis à jour avec succès !');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (user?.id && profile) {
      Promise.all([
        fetchRealStats(),
        loadProfileData()
      ]);
    }
  }, [user?.id, profile]);

  // Utiliser les vraies statistiques dans l'affichage
  const statsComponents = [
    { label: "Connexions", value: stats.connections.toString(), icon: Users },
    { label: "Messages", value: stats.messages.toString(), icon: MessageCircle },
    { label: "Événements", value: stats.events.toString(), icon: Calendar },
    { label: "Profil vu", value: stats.profileViews.toString(), icon: Eye }
  ];

  // Générer les réalisations basées sur les vraies statistiques
  const generateAchievements = () => {
    const achievements = [];
    
    if (stats.connections >= 100) {
      achievements.push({
        id: 1,
        title: "Super Networker",
        description: `Plus de ${stats.connections} connexions`,
        icon: "🤝"
      });
    } else if (stats.connections >= 10) {
      achievements.push({
        id: 1,
        title: "Networker",
        description: `${stats.connections} connexions établies`,
        icon: "🤝"
      });
    }

    if (stats.events >= 10) {
      achievements.push({
        id: 2,
        title: "Super Participant",
        description: `Participé à ${stats.events} événements`,
        icon: "📅"
      });
    } else if (stats.events >= 5) {
      achievements.push({
        id: 2,
        title: "Participant Actif",
        description: `Participé à ${stats.events} événements`,
        icon: "📅"
      });
    }

    if (stats.profileViews >= 500) {
      achievements.push({
        id: 3,
        title: "Influenceur",
        description: `Plus de ${stats.profileViews} vues`,
        icon: "⭐"
      });
    } else if (stats.profileViews >= 100) {
      achievements.push({
        id: 3,
        title: "Profil Populaire",
        description: `Plus de ${stats.profileViews} vues`,
        icon: "👁️"
      });
    }

    if (stats.messages >= 50) {
      achievements.push({
        id: 4,
        title: "Communicateur",
        description: `Plus de ${stats.messages} messages échangés`,
        icon: "💬"
      });
    }

    // Badge d'ancienneté
    achievements.push({
      id: 5,
      title: "Membre Vérifié",
      description: "Profil complet et vérifié",
      icon: "✅"
    });

    // Si pas d'achievements spéciaux, donner le badge de base
    if (achievements.length === 1) {
      achievements.push({
        id: 6,
        title: "Nouveau Membre",
        description: "Bienvenue dans la communauté !",
        icon: "🎉"
      });
    }

    return achievements;
  };

  const achievements = generateAchievements();

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

  // Loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {(profileData.firstName || 'U').charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{profileData.firstName} {profileData.lastName}</h1>
                  {profile?.is_verified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-300 mb-2">{profileData.position || 'Entrepreneur'}</p>
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{profileData.company || 'Startup'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location || 'France'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : isEditing ? (
                <X className="h-5 w-5 mr-2" />
              ) : (
                <Edit3 className="h-5 w-5 mr-2" />
              )}
              {saving ? 'Sauvegarde...' : isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {/* Stats - Utilisation des vraies statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsComponents.map((stat, index) => {
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
              Réussites ({achievements.length})
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
                    disabled={true} // Email ne peut pas être modifié
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    placeholder="+33 6 12 34 56 78"
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
                    placeholder="https://mon-site.com"
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
                    placeholder="Ma Super Startup"
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
                    placeholder="CEO & Fondateur"
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
                    placeholder="Paris, France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
                  <select
                    value={profileData.sector}
                    onChange={(e) => setProfileData(prev => ({ ...prev, sector: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  >
                    <option value="" className="bg-slate-800">Sélectionner un secteur</option>
                    <option value="Tech" className="bg-slate-800">Tech / Software</option>
                    <option value="Fintech" className="bg-slate-800">Fintech</option>
                    <option value="E-commerce" className="bg-slate-800">E-commerce</option>
                    <option value="Healthtech" className="bg-slate-800">Healthtech</option>
                    <option value="Greentech" className="bg-slate-800">Greentech</option>
                    <option value="Edtech" className="bg-slate-800">Edtech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 resize-none"
                    placeholder="Parlez-nous de votre parcours et de vos projets..."
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

        {/* Achievements Tab - Basé sur les vraies statistiques */}
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
                  <div className="text-gray-400 text-sm">Dernière modification récente</div>
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

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
};

export default ProfilePage;
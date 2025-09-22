"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageCircle, 
  Users, 
  UserPlus,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const Navigation = () => {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);

  // Récupérer le nombre de notifications non lues
 

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      // Notifications classiques
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
  
      // Demandes de connexion en attente
      const { count: connectionRequests } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');
  
      setNotifications((notifCount || 0) + (connectionRequests || 0));
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  // Récupérer le nombre de demandes de connexion en attente
  const fetchPendingConnections = async () => {
    if (!user?.id) return;
    
    try {
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');

      setPendingConnections(count || 0);
    } catch (error) {
      console.error('Erreur connexions:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchPendingConnections();
      
      // Refresh des données toutes les 30 secondes
      const interval = setInterval(() => {
        fetchNotifications();
        fetchPendingConnections();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Tableau de bord'
    },
    { 
      name: 'Découvrir', 
      href: '/discover', 
      icon: Search,
      description: 'Trouver des entrepreneurs'
    },
    { 
      name: 'Connexions', 
      href: '/connections', 
      icon: Users,
      description: 'Gérer mes connexions',
      badge: pendingConnections
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: MessageCircle,
      description: 'Mes conversations'
    },
    { 
      name: 'Événements', 
      href: '/events', 
      icon: Calendar,
      description: 'Événements networking'
    }
  ];

  const isActive = (href) => pathname === href;

  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      alert('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-2xl font-bold text-white hidden sm:block">EntrepreneurConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-5 w-5" />
                  


                  <span className="font-medium">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Notifications + Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link href="/connections" className="relative p-2 text-gray-300 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Link>
            
            

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(profile?.first_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:block text-white font-medium">
                  {profile?.first_name || 'Profil'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/20 py-2 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <User className="h-4 w-4" />
                    <span>Mon Profil</span>
                  </Link>
                  <hr className="border-white/10 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>


                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile Profile & Logout */}
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>Mon Profil</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
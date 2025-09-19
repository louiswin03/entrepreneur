// components/Navigation.js
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Network, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const Navigation = () => {
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/'); // ⬅️ CHANGEMENT ICI : redirection vers homepage au lieu de /login
    }
  };

  const isActivePage = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Network className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              // Navigation pour utilisateurs connectés
              <>
                <Link 
                  href="/dashboard" 
                  className={`font-semibold transition-colors ${
                    isActivePage('/dashboard') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/discover" 
                  className={`font-semibold transition-colors ${
                    isActivePage('/discover') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Découvrir
                </Link>
                <Link 
                  href="/messages" 
                  className={`font-semibold transition-colors ${
                    isActivePage('/messages') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Messages
                </Link>
                <Link 
                  href="/events" 
                  className={`font-semibold transition-colors ${
                    isActivePage('/events') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Événements
                </Link>
              </>
            ) : (
              // Navigation pour utilisateurs non connectés
              <>
                <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">
                  Découvrir
                </Link>
                <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Événements
                </Link>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Menu utilisateur connecté
              <>
                <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                <Link href="/profile" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(profile?.first_name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-white font-semibold">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {profile?.company || 'Entrepreneur'}
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              // Boutons pour utilisateurs non connectés
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Rejoindre
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
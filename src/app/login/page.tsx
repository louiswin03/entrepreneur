// src/app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Network } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email et mot de passe sont requis');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur connexion:', error);
        throw error;
      }

      console.log('Connexion réussie:', data);
      
      // Redirection vers le dashboard après connexion réussie
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur plus user-friendly
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else {
        setError(error.message || 'Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      {/* Navigation minimale */}
      <nav className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
            </Link>
            <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
              Pas encore inscrit ?
            </Link>
          </div>
        </div>
      </nav>

      {/* Formulaire de connexion */}
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bon retour !</h1>
            <p className="text-gray-300">Connecte-toi à ton compte pour continuer ton networking</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="ton@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          {/* Lien mot de passe oublié */}
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-gray-400 hover:text-gray-300 transition-colors text-sm">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Lien vers inscription */}
          <div className="text-center mt-8">
            <p className="text-gray-300">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                Créer un compte gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
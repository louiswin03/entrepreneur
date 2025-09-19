// src/app/register/page.tsx
"use client";

import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Network, User, Building, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: '',
    location: '',
    sector: '',
    experience: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    // Validation simple
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Tous les champs sont requis');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            position: formData.position,
          }
        }
      });

      if (authError) {
        console.error('Erreur auth:', authError);
        throw authError;
      }

      // 2. Créer le profil utilisateur
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company || null,
            position: formData.position || null,
            bio: formData.company ? `${formData.position} chez ${formData.company}` : `Entrepreneur ${formData.experience}`,
          });

        if (profileError) {
          console.error('Erreur profil:', profileError);
          throw profileError;
        }
      }

      // 3. Redirection vers le dashboard
      alert('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      router.push('/login');
    } catch (error) {
      console.error('Erreur inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Network className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">EntrepreneurConnect</span>
            </Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
              Déjà inscrit ?
            </Link>
          </div>
        </div>
      </nav>

      {/* Formulaire d'inscription */}
      <div className="w-full max-w-2xl mt-16">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Rejoins la communauté</h1>
            <p className="text-gray-300">Crée ton profil et commence à networker dès aujourd'hui</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Étape {currentStep} sur 2</span>
              <span className="text-sm text-gray-300">{currentStep === 1 ? 'Informations personnelles' : 'Profil professionnel'}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="jean@startup.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="••••••••"
                    required
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}

          {/* Étape 2: Profil professionnel */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entreprise</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateFormData('company', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Ma Super Startup"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poste</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => updateFormData('position', e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="CEO & Fondateur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Secteur d'activité</label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateFormData('sector', e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="" className="bg-slate-800">Sélectionner un secteur</option>
                  <option value="tech" className="bg-slate-800">Tech / Software</option>
                  <option value="fintech" className="bg-slate-800">Fintech</option>
                  <option value="ecommerce" className="bg-slate-800">E-commerce</option>
                  <option value="healthtech" className="bg-slate-800">Healthtech</option>
                  <option value="greentech" className="bg-slate-800">Greentech</option>
                  <option value="edtech" className="bg-slate-800">Edtech</option>
                  <option value="other" className="bg-slate-800">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expérience entrepreneuriale</label>
                <select
                  value={formData.experience}
                  onChange={(e) => updateFormData('experience', e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="" className="bg-slate-800">Sélectionner votre expérience</option>
                  <option value="first-time" className="bg-slate-800">Premier projet entrepreneurial</option>
                  <option value="experienced" className="bg-slate-800">Entrepreneur expérimenté</option>
                  <option value="serial" className="bg-slate-800">Entrepreneur en série</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handlePrevStep}
                  className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Retour
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Lien vers connexion */}
          <div className="text-center mt-8">
            <p className="text-gray-300">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
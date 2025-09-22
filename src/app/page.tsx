"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, MessageCircle, Calendar, TrendingUp, Star, CheckCircle, Zap, Shield, Globe, Target, Award, Rocket } from 'lucide-react';
import Navigation from '../../components/Navigation';

const EntrepreneurHomepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Hero Section - Amélioré */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge de confiance */}
          <div className="mb-8">
            <span className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30 rounded-full px-6 py-2 text-purple-300 text-sm font-semibold backdrop-blur-sm">
              ✨ Rejoint par 10 000+ entrepreneurs en France
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Le réseau qui 
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"> transforme </span>
            tes idées en succès
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connecte-toi avec des entrepreneurs ambitieux, trouve tes futurs associés et mentors. 
            Rejoins la communauté qui accompagne ta réussite entrepreneuriale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center">
              Rejoindre gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Communauté vérifiée</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Données sécurisées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Nouvelle */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pourquoi EntrepreneurConnect ?
            </h2>
            <p className="text-xl text-gray-300">Parce que l'entrepreneuriat, ça se vit mieux ensemble</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connexions de qualité</h3>
              <p className="text-gray-300 leading-relaxed">
                Fini les réseaux superficiels. Ici, chaque connexion est vérifiée et orientée business.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Environnement Sécurisé</h3>
              <p className="text-gray-300 leading-relaxed">
                Tes données et conversations sont protégées. Focus sur tes projets, on s'occupe du reste.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Croissance Accélérée</h3>
              <p className="text-gray-300 leading-relaxed">
                Des événements exclusifs aux opportunités business, tout pour booster ton développement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Améliorée */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Des outils pensés pour les entrepreneurs
            </h2>
            <p className="text-xl text-gray-300">Tout ce dont tu as besoin pour développer ton réseau et tes projets</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Matching Intelligent</h3>
              <p className="text-gray-300 leading-relaxed">
                Notre algorithme trouve les entrepreneurs qui correspondent vraiment à tes objectifs et ton secteur.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Chat Professionnel</h3>
              <p className="text-gray-300 leading-relaxed">
                Échange directement avec d'autres entrepreneurs dans un environnement business et sécurisé.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Événements Exclusifs</h3>
              <p className="text-gray-300 leading-relaxed">
                Meetups, conférences et ateliers réservés à notre communauté d'entrepreneurs vérifiés.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Objectifs Partagés</h3>
              <p className="text-gray-300 leading-relaxed">
                Trouve facilement qui recherche des investisseurs, co-fondateurs ou partenaires business.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Réseau National</h3>
              <p className="text-gray-300 leading-relaxed">
                Connecte-toi avec des entrepreneurs partout en France, de Paris à Marseille en passant par Lyon.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Profils Vérifiés</h3>
              <p className="text-gray-300 leading-relaxed">
                Chaque membre est vérifié. Pas de faux profils, que des entrepreneurs authentiques et motivés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section - Nouvelle */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Ils ont trouvé leurs partenaires ici</h2>
            <p className="text-xl text-gray-300">Des success stories qui parlent d'elles-mêmes</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30">
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white text-lg mb-6 italic leading-relaxed">
                "En 3 semaines sur la plateforme, j'ai trouvé mon CTO et mon investisseur principal. 
                Aujourd'hui on a levé 1M€ et on scale en Europe !"
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                  A
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Antoine Dubois</div>
                  <div className="text-purple-300">CEO, FinanceAI • Levée 1M€</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30">
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white text-lg mb-6 italic leading-relaxed">
                "Grâce aux événements et aux connexions de qualité, j'ai pu développer mon réseau de mentors 
                et trouver mes premiers clients B2B."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                  S
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Sarah Martin</div>
                  <div className="text-blue-300">Founder, GreenTech Solutions • 50K€ ARR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Améliorée */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Des résultats qui parlent</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                10 000+
              </div>
              <div className="text-gray-300 font-medium">Entrepreneurs actifs</div>
              <div className="text-gray-500 text-sm mt-1">et vérifiés</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                15 000+
              </div>
              <div className="text-gray-300 font-medium">Connexions réalisées</div>
              <div className="text-gray-500 text-sm mt-1">en 2024</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                2 500+
              </div>
              <div className="text-gray-300 font-medium">Projets lancés</div>
              <div className="text-gray-500 text-sm mt-1">grâce à la plateforme</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                500+
              </div>
              <div className="text-gray-300 font-medium">Événements organisés</div>
              <div className="text-gray-500 text-sm mt-1">par la communauté</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Améliorée */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ton prochain co-fondateur t'attend
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Rejoins dès maintenant la communauté d'entrepreneurs la plus active de France. 
            Ton succès commence par la bonne connexion.
          </p>
          
          <div className="mb-8">
            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 inline-flex items-center">
              Créer mon profil maintenant
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Inscription 100% gratuite</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Profil actif en 2 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Accès immédiat à la communauté</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">EntrepreneurConnect</span>
            </div>
            <div className="flex space-x-8 text-gray-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/discover" className="hover:text-white transition-colors">Découvrir</Link>
              <Link href="/events" className="hover:text-white transition-colors">Événements</Link>
              <Link href="/messages" className="hover:text-white transition-colors">Messages</Link>
              <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
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

export default EntrepreneurHomepage;
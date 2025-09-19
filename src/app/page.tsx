"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, MessageCircle, Calendar, TrendingUp, Star, CheckCircle } from 'lucide-react';
import Navigation from '../../components/Navigation';

const EntrepreneurHomepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-lg font-semibold">
              🚀 La plateforme #1 pour entrepreneurs
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Connecte-toi avec des
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"> entrepreneurs </span>
            qui partagent ta vision
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Trouve tes futurs associés, mentors et partenaires. Rejoins une communauté de 10,000+ entrepreneurs 
            ambitieux qui transforment leurs idées en succès.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/discover" className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tout ce dont tu as besoin pour réussir
            </h2>
            <p className="text-xl text-gray-300">Des outils puissants pour construire ton réseau professionnel</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Matching Intelligent</h3>
              <p className="text-gray-300 leading-relaxed">
                Notre algorithme trouve les entrepreneurs qui correspondent à tes compétences, secteurs d'activité et objectifs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Chat Sécurisé</h3>
              <p className="text-gray-300 leading-relaxed">
                Échange directement avec d'autres entrepreneurs dans un environnement professionnel et sécurisé.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Événements Exclusifs</h3>
              <p className="text-gray-300 leading-relaxed">
                Participe à des meetups, conférences et ateliers réservés à notre communauté d'entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform">10,000+</div>
              <div className="text-gray-300">Entrepreneurs actifs</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-pink-400 mb-2 group-hover:scale-110 transition-transform">5,000+</div>
              <div className="text-gray-300">Connexions réalisées</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">1,200+</div>
              <div className="text-gray-300">Projets lancés</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:scale-110 transition-transform">200+</div>
              <div className="text-gray-300">Événements organisés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Ce que disent nos entrepreneurs</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "J'ai trouvé mon co-fondateur grâce à cette plateforme. Nous avons levé 500k€ ensemble !"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <div className="text-white font-semibold">Marie Dupont</div>
                  <div className="text-gray-400 text-sm">CEO, TechStart</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Le networking n'a jamais été aussi simple. J'ai rencontré des mentors incroyables ici."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  J
                </div>
                <div>
                  <div className="text-white font-semibold">Jules Martin</div>
                  <div className="text-gray-400 text-sm">Founder, InnovLab</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Une communauté exceptionnelle d'entrepreneurs motivés et bienveillants."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <div className="text-white font-semibold">Sophie Chen</div>
                  <div className="text-gray-400 text-sm">CEO, GreenTech Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Prêt à transformer ton idée en succès ?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Rejoins dès maintenant des milliers d'entrepreneurs qui font déjà partie de l'aventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center justify-center">
              Créer mon profil gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">✨ Gratuit pendant 30 jours • Aucune carte bancaire requise</p>
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
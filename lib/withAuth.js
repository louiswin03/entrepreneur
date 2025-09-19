"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

export function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Récupérer le profil utilisateur
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profil n'existe pas, le créer
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                first_name: user.user_metadata?.first_name || 'Nouvel',
                last_name: user.user_metadata?.last_name || 'Utilisateur',
                company: user.user_metadata?.company || '',
                position: user.user_metadata?.position || ''
              })
              .select()
              .single();

            if (!createError) {
              setProfile(newProfile);
            }
          } else if (!error) {
            setProfile(profileData);
          }
        } catch (err) {
          console.error('Erreur profil:', err);
        }
        
        setUser(user);
        setLoading(false);
      };

      checkUser();

      // Écouter les changements d'auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!session) {
          setUser(null);
          setProfile(null);
          router.push('/login');
        } else {
          setUser(session.user);
          
          // Récupérer le profil pour la nouvelle session
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white">Chargement...</div>
        </div>
      );
    }

    return user ? <WrappedComponent {...props} user={user} profile={profile} /> : null;
  };
}
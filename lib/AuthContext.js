// lib/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Récupérer le profil utilisateur depuis la base de données
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de récupérer le profil existant avec les relations
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          skills:user_skills(skills(*)),
          looking_for:user_looking_for(looking_for(*))
        `)
        .eq('id', userId)
        .single();

      // Si le profil n'existe pas, le créer
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select()
          .single();
          
        if (createError) throw createError;
        
        // Mettre à jour le state avec le nouveau profil vide
        const emptyProfile = { ...newProfile, skills: [], lookingFor: [] };
        setProfile(emptyProfile);
        return emptyProfile;
      }
      
      if (profileError) throw profileError;
      
      // Formater les données du profil
      const formattedProfile = {
        ...data,
        skills: data.skills?.map(s => s.skills?.name).filter(Boolean) || [],
        lookingFor: data.looking_for?.map(lf => lf.looking_for?.name).filter(Boolean) || []
      };
      
      setProfile(formattedProfile);
      return formattedProfile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour le profil utilisateur
  const updateProfile = async (updates) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Extraire les compétences et ce que l'utilisateur recherche
      const { skills = [], lookingFor = [], ...profileData } = updates;
      
      // Mettre à jour les informations de base du profil
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Mettre à jour les compétences si fournies
      if (skills) {
        // Supprimer toutes les compétences existantes
        await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id);
        
        // Ajouter les nouvelles compétences
        if (skills.length > 0) {
          // Vérifier et insérer les compétences qui n'existent pas encore
          const { data: existingSkills } = await supabase
            .from('skills')
            .select('name')
            .in('name', skills);
          
          const existingSkillNames = existingSkills?.map(s => s.name) || [];
          const newSkills = skills.filter(skill => !existingSkillNames.includes(skill));
          
          if (newSkills.length > 0) {
            await supabase
              .from('skills')
              .insert(newSkills.map(name => ({ name })), { onConflict: 'name' });
          }
          
          // Récupérer les IDs des compétences
          const { data: skillIds } = await supabase
            .from('skills')
            .select('id, name')
            .in('name', skills);
          
          // Lier les compétences à l'utilisateur
          if (skillIds?.length > 0) {
            await supabase
              .from('user_skills')
              .insert(skillIds.map(skill => ({
                user_id: user.id,
                skill_id: skill.id
              })));
          }
        }
      }
      
      // Mettre à jour "ce que l'utilisateur recherche" si fourni
      if (lookingFor) {
        // Supprimer tous les éléments existants
        await supabase
          .from('user_looking_for')
          .delete()
          .eq('user_id', user.id);
        
        // Ajouter les nouveaux éléments
        if (lookingFor.length > 0) {
          // Vérifier et insérer les éléments qui n'existent pas encore
          const { data: existingLookingFor } = await supabase
            .from('looking_for')
            .select('name')
            .in('name', lookingFor);
          
          const existingLookingForNames = existingLookingFor?.map(lf => lf.name) || [];
          const newLookingFor = lookingFor.filter(item => !existingLookingForNames.includes(item));
          
          if (newLookingFor.length > 0) {
            await supabase
              .from('looking_for')
              .insert(newLookingFor.map(name => ({ name })), { onConflict: 'name' });
          }
          
          // Récupérer les IDs des éléments
          const { data: lookingForIds } = await supabase
            .from('looking_for')
            .select('id, name')
            .in('name', lookingFor);
          
          // Lier les éléments à l'utilisateur
          if (lookingForIds?.length > 0) {
            await supabase
              .from('user_looking_for')
              .insert(lookingForIds.map(item => ({
                user_id: user.id,
                looking_for_id: item.id
              })));
          }
        }
      }
      
      // Recharger le profil mis à jour
      const updatedProfile = await fetchUserProfile(user.id);
      return updatedProfile;
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la liste des entrepreneurs
  const fetchEntrepreneurs = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          skills:user_skills(skills(*))
        `)
        .neq('id', user?.id || ''); // Exclure l'utilisateur actuel
      
      // Appliquer les filtres
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }
      
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Formater les données des profils
      return data.map(profile => ({
        ...profile,
        skills: profile.skills?.map(s => s.skills?.name).filter(Boolean) || [],
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        title: profile.position || '',
        company: profile.company || '',
        location: profile.location || '',
        description: profile.bio || ''
      }));
      
    } catch (err) {
      console.error('Error fetching entrepreneurs:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les messages de l'utilisateur
  const fetchMessages = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      return data || [];
      
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async (receiverId, content) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: receiverId,
            content: content
          }
        ])
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      return data;
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les événements
  const fetchEvents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('events')
        .select('*, organizer:profiles(*)')
        .order('start_date', { ascending: true });
      
      // Appliquer les filtres
      if (filters.upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      }
      
      if (filters.organizerId) {
        query = query.eq('organizer_id', filters.organizerId);
      }
      
      const { data, error: eventsError } = await query;
      
      if (eventsError) throw eventsError;
      
      return data || [];
      
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // S'inscrire à un événement
  const registerForEvent = async (eventId) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: registerError } = await supabase
        .from('event_participants')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed'
          }
        ])
        .select()
        .single();
      
      if (registerError) throw registerError;
      
      return data;
      
    } catch (err) {
      console.error('Error registering for event:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        router.push('/');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, fetchUserProfile]);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Créer l'utilisateur dans Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Mettre à jour le profil utilisateur avec les données supplémentaires
      if (data.user) {
        await updateProfile({
          ...userData,
          id: data.user.id
        });
      }
      
      return data;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchUserProfile,
    fetchEntrepreneurs,
    fetchMessages,
    sendMessage,
    fetchEvents,
    registerForEvent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
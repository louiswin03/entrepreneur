"use client";

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Users, DollarSign, Tag } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    category: '',
    price: '0',
    max_participants: '50',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour créer un événement');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Valider les champs obligatoires
      if (!formData.title || !formData.start_date || !formData.start_time || !formData.location) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      
      // Créer les objets Date pour la validation
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = formData.end_date && formData.end_time 
        ? new Date(`${formData.end_date}T${formData.end_time}`)
        : null;
      
      // Valider les dates
      if (endDateTime && endDateTime < startDateTime) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      
      // Préparer les données pour l'API
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime ? endDateTime.toISOString() : null,
        location: formData.location,
        category: formData.category || null,
        price: parseFloat(formData.price) || 0,
        max_participants: parseInt(formData.max_participants) || 50,
        organizer_id: user.id,
      };
      
      // Envoyer la requête à l'API
      const { data, error: createError } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        location: '',
        category: '',
        price: '0',
        max_participants: '50',
      });
      
      // Appeler le callback de succès
      onEventCreated();
      onClose();
      
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Générer les options d'heure
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(
        <option key={timeString} value={timeString}>
          {timeString}
        </option>
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Créer un nouvel événement</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'événement *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début *
                </label>
                <div className="relative">
                  <select
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    required
                  >
                    <option value="">Sélectionner une heure</option>
                    {timeOptions}
                  </select>
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || format(new Date(), 'yyyy-MM-dd')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin (optionnel)
                </label>
                <div className="relative">
                  <select
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    disabled={!formData.end_date}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none disabled:bg-gray-100"
                  >
                    <option value="">Sélectionner une heure</option>
                    {timeOptions}
                  </select>
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Lieu *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Adresse ou lieu de l'événement"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Networking">Networking</option>
                    <option value="Conférence">Conférence</option>
                    <option value="Atelier">Atelier</option>
                    <option value="Formation">Formation</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre maximum de participants
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    min="1"
                    value={formData.max_participants}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'entrée (€) - 0 pour gratuit
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création en cours...' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;

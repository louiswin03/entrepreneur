// components/CoverUpload.js
"use client";

import React, { useState } from 'react';
import { Camera, Loader2, X, Upload, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CoverUpload = ({ 
  eventId,
  userId, 
  currentCover, 
  onCoverUpdate,
  disabled = false,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Valider le fichier
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB pour les couvertures
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('Le fichier doit faire moins de 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Seuls les formats JPG, PNG et WebP sont acceptés');
    }

    return true;
  };

  // Upload vers Supabase Storage
  const uploadCover = async (file) => {
    try {
      setUploading(true);
      validateFile(file);

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `event-${eventId || 'temp'}-${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL de l\'image');
      }

      // Mettre à jour l'événement si eventId existe
      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({ 
            cover_url: data.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);

        if (updateError) {
          console.error('Erreur mise à jour événement:', updateError);
          throw updateError;
        }
      }

      // Supprimer l'ancienne couverture si elle existe
      if (currentCover && currentCover.includes('supabase')) {
        const oldPath = currentCover.split('/covers/')[1];
        if (oldPath) {
          await supabase.storage
            .from('covers')
            .remove([oldPath]);
        }
      }

      // Callback de mise à jour
      onCoverUpdate(data.publicUrl);
      setPreviewUrl(null);
      
      // Notification de succès
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('avatar-uploaded', {
          detail: { message: 'Couverture mise à jour avec succès!' }
        });
        window.dispatchEvent(event);
      }

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      
      // Notification d'erreur
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('avatar-upload-error', {
          detail: { message: error.message || 'Erreur lors de l\'upload' }
        });
        window.dispatchEvent(event);
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Gérer la sélection de fichier
  const handleFileSelect = async (file) => {
    if (!file || disabled) return;

    try {
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);

      // Upload
      await uploadCover(file);
    } catch (error) {
      setPreviewUrl(null);
    }
  };

  // Gérer le drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Obtenir l'URL d'affichage
  const getDisplayUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentCover) return currentCover;
    return null;
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Cover container */}
      <div 
        className={`relative w-full h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
          dragActive ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
        } ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && document.getElementById(`cover-upload-${eventId || 'temp'}`)?.click()}
      >
        {getDisplayUrl() ? (
          <img 
            src={getDisplayUrl()} 
            alt="Couverture" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <Image className="h-12 w-12 mx-auto mb-2 opacity-60" />
            <p className="text-sm opacity-80">
              {dragActive ? 'Déposez l\'image ici' : 'Cliquez pour ajouter une couverture'}
            </p>
            <p className="text-xs opacity-60 mt-1">JPG, PNG ou WebP • Max 10MB</p>
          </div>
        )}
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Upload en cours...</p>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && !uploading && getDisplayUrl() && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <div className="text-center text-white">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Changer la couverture</p>
            </div>
          </div>
        )}

        {/* Drag and drop border */}
        {dragActive && (
          <div className="absolute inset-2 border-2 border-dashed border-white border-opacity-50 rounded-lg pointer-events-none" />
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        id={`cover-upload-${eventId || 'temp'}`}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={uploading || disabled}
        className="hidden"
      />

      {/* Preview actions */}
      {previewUrl && !uploading && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewUrl(null);
            }}
            className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload button (alternative) */}
      {!getDisplayUrl() && !disabled && (
        <div className="absolute bottom-4 right-4">
          <label 
            htmlFor={`cover-upload-${eventId || 'temp'}`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center space-x-2 backdrop-blur-sm"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {uploading ? 'Upload...' : 'Choisir une image'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default CoverUpload;
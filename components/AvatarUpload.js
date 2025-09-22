// components/AvatarUpload.js
"use client";

import React, { useState } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AvatarUpload = ({ 
  userId, 
  currentAvatar, 
  onAvatarUpdate, 
  size = 'large',
  disabled = false,
  showUploadButton = true 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-16 h-16 text-xl', 
    large: 'w-24 h-24 text-3xl',
    xlarge: 'w-32 h-32 text-4xl'
  };

  const buttonSizeClasses = {
    small: 'w-4 h-4 p-1',
    medium: 'w-5 h-5 p-1.5',
    large: 'w-6 h-6 p-2',
    xlarge: 'w-8 h-8 p-2.5'
  };

  // Valider le fichier
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('Le fichier doit faire moins de 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Seuls les formats JPG, PNG et WebP sont acceptés');
    }

    return true;
  };

  // Upload vers Supabase Storage
  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      validateFile(file);

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
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
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL de l\'image');
      }

      // Mettre à jour le profil dans la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        throw updateError;
      }

      // Supprimer l'ancien avatar si il existe
      if (currentAvatar && currentAvatar.includes('supabase')) {
        const oldPath = currentAvatar.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([oldPath]);
        }
      }

      // Callback de mise à jour
      onAvatarUpdate(data.publicUrl);
      setPreviewUrl(null);
      
      // Notification de succès
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('avatar-uploaded', {
          detail: { message: 'Avatar mis à jour avec succès!' }
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
      await uploadAvatar(file);
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
    if (currentAvatar) return currentAvatar;
    return null;
  };

  // Obtenir les initiales
  const getInitials = () => {
    // Logique pour obtenir les initiales depuis le userId ou un nom
    return 'U';
  };

  return (
    <div className="relative group">
      {/* Avatar container */}
      <div 
        className={`relative ${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden transition-all ${
          dragActive ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
        } ${!disabled && showUploadButton ? 'cursor-pointer' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {getDisplayUrl() ? (
          <img 
            src={getDisplayUrl()} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials()}</span>
        )}
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <Loader2 className={`${buttonSizeClasses[size]} text-white animate-spin`} />
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && showUploadButton && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
            <Camera className={`${buttonSizeClasses[size]} text-white`} />
          </div>
        )}
      </div>

      {/* Upload button */}
      {showUploadButton && !disabled && (
        <label 
          className={`absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors cursor-pointer ${buttonSizeClasses[size]} flex items-center justify-center`}
          htmlFor={`avatar-upload-${userId}`}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Camera className="w-3 h-3" />
          )}
        </label>
      )}
      
      {/* Hidden file input */}
      <input
        id={`avatar-upload-${userId}`}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={uploading || disabled}
        className="hidden"
      />

      {/* Preview actions */}
      {previewUrl && !uploading && (
        <div className="absolute -top-2 -right-2">
          <button
            onClick={() => setPreviewUrl(null)}
            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Drag and drop zone (pour les grandes tailles) */}
      {size === 'xlarge' && !disabled && (
        <div 
          className="absolute inset-0 border-2 border-dashed border-gray-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
        />
      )}
    </div>
  );
};

export default AvatarUpload;
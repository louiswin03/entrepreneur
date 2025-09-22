// components/Toast.js
"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X, Upload } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'upload':
        return <Upload className="h-5 w-5 text-blue-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'upload':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default:
        return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl border backdrop-blur-md ${getColors()} animate-slide-in-right`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Provider pour gérer les toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAvatarUploaded = (event) => {
      addToast(event.detail.message, 'success');
    };

    const handleAvatarUploadError = (event) => {
      addToast(event.detail.message, 'error');
    };

    window.addEventListener('avatar-uploaded', handleAvatarUploaded);
    window.addEventListener('avatar-upload-error', handleAvatarUploadError);

    return () => {
      window.removeEventListener('avatar-uploaded', handleAvatarUploaded);
      window.removeEventListener('avatar-upload-error', handleAvatarUploadError);
    };
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const addToast = (message, type = 'success') => {
    const event = new CustomEvent(type === 'error' ? 'avatar-upload-error' : 'avatar-uploaded', {
      detail: { message }
    });
    window.dispatchEvent(event);
  };

  return { addToast };
};

export default Toast;
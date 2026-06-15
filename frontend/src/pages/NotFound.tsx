import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">RateLocal</span>
        </div>

        {/* 404 number */}
        <div className="relative">
          <span
            className="text-[10rem] font-black text-dark-900 select-none leading-none"
            style={{
              textShadow: '0 0 80px rgba(59, 130, 246, 0.15)',
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-dark-400 text-sm leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dark-800 text-dark-300 hover:text-white hover:border-dark-700 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-900/30"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

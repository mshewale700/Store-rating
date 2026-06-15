import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home, Star } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 h-80 w-80 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">RateLocal</span>
        </div>

        {/* Icon */}
        <div className="h-24 w-24 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff className="h-12 w-12 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-dark-400 text-sm leading-relaxed">
            You don't have permission to view this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/15 text-left w-full">
          <p className="text-red-300 text-xs font-medium">
            🔒 This area requires elevated permissions or a different account role.
          </p>
        </div>

        <div className="flex gap-3">
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

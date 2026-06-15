import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Star, User, Mail, MapPin, Lock, Loader2 } from 'lucide-react';

interface RegisterFormInputs {
  name: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const passwordVal = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        address: data.address,
        password: data.password,
      });
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to register. Please check your credentials.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-950 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"></div>

      <div className="w-full max-w-lg p-8 rounded-2xl border border-dark-800/80 bg-dark-900/40 backdrop-blur-xl shadow-2xl relative z-10 animate-bounce-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3 text-center mb-6">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
            <Star className="h-8 w-8 fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight m-0">Create Account</h2>
            <p className="text-sm text-dark-300 mt-1">Register as a new user to search and rate local stores</p>
          </div>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <input
                type="text"
                placeholder="e.g. Regular Customer Account User (Min 20 characters)"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-900/50 border ${
                  errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 20, message: 'Name must be at least 20 characters' },
                  maxLength: { value: 60, message: 'Name must be at most 60 characters' },
                })}
              />
            </div>
            {errors.name && <span className="text-[11px] text-red-400 font-medium">{errors.name.message}</span>}
          </div>

          {/* Email Address field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <input
                type="email"
                placeholder="you@domain.com"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-900/50 border ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && <span className="text-[11px] text-red-400 font-medium">{errors.email.message}</span>}
          </div>

          {/* Location Address field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Location Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-dark-300" />
              <textarea
                placeholder="Enter physical address (Max 400 characters)"
                rows={2}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-900/50 border ${
                  errors.address ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50 resize-none`}
                {...register('address', {
                  required: 'Address is required',
                  maxLength: { value: 400, message: 'Address cannot exceed 400 characters' },
                })}
              />
            </div>
            {errors.address && <span className="text-[11px] text-red-400 font-medium">{errors.address.message}</span>}
          </div>

          {/* Password complexity details container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
                <input
                  type="password"
                  placeholder="8-16 characters"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-900/50 border ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                  } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    maxLength: { value: 16, message: 'Password must be at most 16 characters' },
                    validate: {
                      uppercase: (v) => /(?=.*[A-Z])/.test(v) || 'Must contain at least one uppercase letter',
                      special: (v) => /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(v) || 'Must contain at least one special character',
                    },
                  })}
                />
              </div>
              {errors.password && <span className="text-[11px] text-red-400 font-medium">{errors.password.message}</span>}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
                <input
                  type="password"
                  placeholder="Re-type password"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-900/50 border ${
                    errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                  } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50`}
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (v) => v === passwordVal || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && <span className="text-[11px] text-red-400 font-medium">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="mt-6 pt-5 border-t border-dark-800/40 text-center">
          <p className="text-sm text-dark-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

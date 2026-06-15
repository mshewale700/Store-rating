import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Star, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');

      // Fetch user role to determine redirection route
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (savedUser.role === 'STORE_OWNER') {
          navigate('/owner-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-950 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"></div>

      <div className="w-full max-w-md p-8 rounded-2xl border border-dark-800/80 bg-dark-900/40 backdrop-blur-xl shadow-2xl relative z-10 animate-bounce-in">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
            <Star className="h-8 w-8 fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight m-0">Welcome Back</h2>
            <p className="text-sm text-dark-300 mt-1">Sign in to manage your ratings or explore stores</p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <input
                type="email"
                placeholder="you@storerating.com"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-900/50 border ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all`}
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

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-dark-200 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-900/50 border ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-dark-800/80 focus:border-brand-500'
                } text-white text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <span className="text-[11px] text-red-400 font-medium">{errors.password.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="mt-8 pt-6 border-t border-dark-800/40 text-center">
          <p className="text-sm text-dark-300">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

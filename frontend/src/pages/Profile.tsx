import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  MapPin,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Save,
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  address: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Profile: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name ?? '',
      address: user?.address ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUserLocal({ name: data.name, address: data.address });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      showToast('Profile updated successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      showToast('Password changed successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => updateProfileMutation.mutate(data);

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    changePasswordMutation.mutate(data);
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    USER: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    STORE_OWNER: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-dark-900/60 border border-dark-800/80 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-dark-500';

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">My Profile</h2>
        <p className="text-sm text-dark-300 mt-1">Manage your account information and security settings</p>
      </div>

      {/* Profile avatar card */}
      <div className="p-6 rounded-2xl glass-card flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-white text-3xl uppercase shadow-xl shadow-brand-900/30 shrink-0">
          {user?.name?.charAt(0) ?? '?'}
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-white m-0">{user?.name}</h3>
          <p className="text-sm text-dark-400 mt-1">{user?.email}</p>
          <span
            className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
              roleColors[user?.role ?? 'USER']
            }`}
          >
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="p-6 rounded-2xl glass-panel space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 m-0">
          <User className="h-4 w-4 text-brand-500" /> Account Information
        </h3>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950/60 border border-dark-800/40 text-dark-400 text-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-dark-500">Email cannot be changed</p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input
              type="text"
              className={inputClass}
              {...profileForm.register('name', {
                required: 'Name is required',
                minLength: { value: 20, message: 'Name must be at least 20 characters' },
                maxLength: { value: 60, message: 'Name cannot exceed 60 characters' },
              })}
            />
            {profileForm.formState.errors.name && (
              <p className="text-[10px] text-red-400 font-medium">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Address
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              {...profileForm.register('address', {
                required: 'Address is required',
                maxLength: { value: 400, message: 'Address cannot exceed 400 characters' },
              })}
            />
            {profileForm.formState.errors.address && (
              <p className="text-[10px] text-red-400 font-medium">
                {profileForm.formState.errors.address.message}
              </p>
            )}
          </div>

          {/* Role (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Account Role
            </label>
            <input
              type="text"
              value={user?.role?.replace('_', ' ') ?? ''}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl bg-dark-950/60 border border-dark-800/40 text-dark-400 text-sm cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending || profileSaved}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : profileSaved ? (
              <CheckCircle className="h-4 w-4 text-green-300" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updateProfileMutation.isPending
              ? 'Saving...'
              : profileSaved
              ? 'Saved!'
              : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-2xl glass-panel space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 m-0">
          <Lock className="h-4 w-4 text-brand-500" /> Change Password
        </h3>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="Enter current password"
                {...passwordForm.register('oldPassword', { required: 'Current password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.oldPassword && (
              <p className="text-[10px] text-red-400 font-medium">
                {passwordForm.formState.errors.oldPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="8-16 chars, 1 uppercase, 1 special"
                {...passwordForm.register('newPassword', {
                  required: 'New password is required',
                  validate: (val) => {
                    if (val.length < 8 || val.length > 16) return 'Password must be 8-16 characters';
                    if (!/(?=.*[A-Z])/.test(val)) return 'Must include at least 1 uppercase letter';
                    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(val))
                      return 'Must include at least 1 special character';
                    return true;
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-[10px] text-red-400 font-medium">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-dark-300">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="Re-enter new password"
                {...passwordForm.register('confirmPassword', { required: 'Please confirm your password' })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-[10px] text-red-400 font-medium">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-dark-900/60 border border-dark-800/40">
            <p className="text-[11px] text-dark-400 leading-relaxed">
              Password requirements: 8–16 characters, at least 1 uppercase letter, and at least 1 special character
              (e.g. <span className="text-dark-300 font-mono">!@#$%^&*</span>).
            </p>
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

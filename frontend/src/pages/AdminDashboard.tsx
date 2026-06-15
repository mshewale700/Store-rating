import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Store, 
  Star, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface UserItem {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  createdAt: string;
}

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  averageRating: number;
  totalRatings: number;
}

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');

  // User management states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userPage, setUserPage] = useState(1);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Store management states
  const [storeSearch, setStoreSearch] = useState('');
  const [storePage, setStorePage] = useState(1);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);

  // Fetch admin dashboard aggregated stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data;
    },
  });

  // Fetch paginated, filtered user records
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', userPage, userSearch, userRoleFilter, userSortBy, userSortOrder],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: {
          page: userPage,
          limit: 6,
          search: userSearch,
          role: userRoleFilter || undefined,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
        },
      });
      return response.data;
    },
  });

  // Fetch paginated store records
  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['adminStores', storePage, storeSearch],
    queryFn: async () => {
      const response = await api.get('/stores', {
        params: {
          page: storePage,
          limit: 6,
          search: storeSearch,
        },
      });
      return response.data;
    },
  });

  // Fetch all potential store owners for store creation selector
  const { data: potentialOwners } = useQuery({
    queryKey: ['potentialOwners'],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { limit: 100, role: 'STORE_OWNER' },
      });
      return response.data.data as UserItem[];
    },
    enabled: activeTab === 'stores',
  });

  // Forms setup
  const userForm = useForm({
    defaultValues: { name: '', email: '', password: '', address: '', role: 'USER' }
  });
  const storeForm = useForm({
    defaultValues: { name: '', email: '', address: '', ownerId: '' }
  });

  // Reset forms on edit hook trigger
  useEffect(() => {
    if (editingUser) {
      userForm.reset({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        address: editingUser.address,
        role: editingUser.role,
      });
    } else {
      userForm.reset({ name: '', email: '', password: '', address: '', role: 'USER' });
    }
  }, [editingUser, userModalOpen]);

  useEffect(() => {
    if (editingStore) {
      storeForm.reset({
        name: editingStore.name,
        email: editingStore.email,
        address: editingStore.address,
        ownerId: editingStore.ownerId,
      });
    } else {
      storeForm.reset({ name: '', email: '', address: '', ownerId: '' });
    }
  }, [editingStore, storeModalOpen]);

  // Mutations for Users CRUD
  const saveUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingUser) {
        if (!data.password) delete data.password;
        await api.put(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast(editingUser ? 'User updated successfully' : 'User created successfully', 'success');
      setUserModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error saving user details', 'error');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('User deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    },
  });

  // Mutations for Stores CRUD
  const saveStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, data);
      } else {
        await api.post('/stores', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast(editingStore ? 'Store updated successfully' : 'Store created successfully', 'success');
      setStoreModalOpen(false);
      setEditingStore(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error saving store details', 'error');
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('Store deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete store', 'error');
    },
  });

  const onUserSubmit = (data: any) => {
    saveUserMutation.mutate(data);
  };

  const onStoreSubmit = (data: any) => {
    saveStoreMutation.mutate(data);
  };

  // Recharts custom coloring setup
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">Admin Center</h2>
        <p className="text-sm text-dark-300 mt-1">Audit, register, and supervise system assets and user accounts</p>
      </div>

      {/* KPI Cards section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl glass-panel shimmer-wrapper"></div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="text-[10px] text-dark-300 font-bold uppercase tracking-widest">Total Users</span>
                <h3 className="text-4xl font-extrabold text-white mt-1 mb-0">{stats.totalUsers}</h3>
              </div>
              <div className="p-4 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="p-6 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="text-[10px] text-dark-300 font-bold uppercase tracking-widest">Active Stores</span>
                <h3 className="text-4xl font-extrabold text-white mt-1 mb-0">{stats.totalStores}</h3>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Store className="h-6 w-6" />
              </div>
            </div>
            <div className="p-6 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="text-[10px] text-dark-300 font-bold uppercase tracking-widest">Feedback Ratings</span>
                <h3 className="text-4xl font-extrabold text-white mt-1 mb-0">{stats.totalRatings}</h3>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="h-6 w-6 fill-current" />
              </div>
            </div>
          </div>
        )
      )}

      {/* Analytics Charts section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ratings distribution */}
          <div className="p-6 rounded-2xl glass-panel">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-current" /> Ratings Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.ratingBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="rating" stroke="#9ca3af" tickFormatter={(v) => `${v} ★`} />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    labelFormatter={(label) => `${label} Star Ratings`}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {stats.charts.ratingBreakdown.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Roles distribution */}
          <div className="p-6 rounded-2xl glass-panel">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-500" /> User Accounts Segmentation
            </h4>
            <div className="h-64 flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.charts.rolesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="role"
                    >
                      {stats.charts.rolesBreakdown.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2 px-6">
                {stats.charts.rolesBreakdown.map((item: any, index: number) => (
                  <div key={item.role} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-dark-200 uppercase tracking-wider text-xs font-semibold">{item.role}</span>
                    </div>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-dark-800/60 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/10' : 'text-dark-300 hover:text-white'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'stores' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/10' : 'text-dark-300 hover:text-white'
          }`}
        >
          Store Management
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
                <input
                  type="text"
                  placeholder="Search user by name, email, address..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-900/40 border border-dark-800/80 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Role filter */}
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-900/40 border border-dark-800/80 text-white text-sm focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                  <option value="STORE_OWNER">STORE OWNER</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-600/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add User
            </button>
          </div>

          {/* User Table container */}
          {usersLoading ? (
            <div className="h-64 glass-panel shimmer-wrapper rounded-2xl"></div>
          ) : (
            usersData && (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-dark-200">
                    <thead className="bg-dark-900/60 border-b border-dark-800/60 text-xs font-semibold uppercase text-dark-300">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Address</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800/40">
                      {usersData.data.map((usr: UserItem) => (
                        <tr key={usr.id} className="hover:bg-dark-900/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{usr.name}</td>
                          <td className="px-6 py-4">{usr.email}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{usr.address}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              usr.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                              usr.role === 'STORE_OWNER' ? 'bg-indigo-500/10 text-indigo-400' :
                              'bg-brand-500/10 text-brand-400'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(usr);
                                  setUserModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-brand-400 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${usr.name}?`)) {
                                    deleteUserMutation.mutate(usr.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-dark-800/40">
                  <span className="text-xs text-dark-300">
                    Showing page {usersData.meta.page} of {usersData.meta.totalPages} ({usersData.meta.total} users)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-50 transition-opacity"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={userPage >= usersData.meta.totalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-50 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: Store Management */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
              <input
                type="text"
                placeholder="Search stores by name, email, address..."
                value={storeSearch}
                onChange={(e) => {
                  setStoreSearch(e.target.value);
                  setStorePage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-900/40 border border-dark-800/80 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              onClick={() => {
                setEditingStore(null);
                setStoreModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-600/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Store
            </button>
          </div>

          {/* Stores Table container */}
          {storesLoading ? (
            <div className="h-64 glass-panel shimmer-wrapper rounded-2xl"></div>
          ) : (
            storesData && (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-dark-200">
                    <thead className="bg-dark-900/60 border-b border-dark-800/60 text-xs font-semibold uppercase text-dark-300">
                      <tr>
                        <th className="px-6 py-4">Store Name</th>
                        <th className="px-6 py-4">Contact Email</th>
                        <th className="px-6 py-4">Store Address</th>
                        <th className="px-6 py-4 text-center">Avg Rating</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800/40">
                      {storesData.data.map((str: StoreItem) => (
                        <tr key={str.id} className="hover:bg-dark-900/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{str.name}</td>
                          <td className="px-6 py-4">{str.email}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{str.address}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Star className="h-4 w-4 text-amber-400 fill-current" />
                              <span className="font-bold text-white">{str.averageRating}</span>
                              <span className="text-xs text-dark-300">({str.totalRatings})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingStore(str);
                                  setStoreModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-brand-400 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete store ${str.name}?`)) {
                                    deleteStoreMutation.mutate(str.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-dark-800/40">
                  <span className="text-xs text-dark-300">
                    Showing page {storesData.meta.page} of {storesData.meta.totalPages} ({storesData.meta.total} stores)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={storePage <= 1}
                      onClick={() => setStorePage((p) => p - 1)}
                      className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-50 transition-opacity"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={storePage >= storesData.meta.totalPages}
                      onClick={() => setStorePage((p) => p + 1)}
                      className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-50 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* USER CRUD CREATION/EDIT MODAL */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-dark-800 bg-dark-900/90 shadow-2xl space-y-4 animate-bounce-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white m-0">
                {editingUser ? 'Edit User Details' : 'Register New User'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                  {...userForm.register('name', { required: 'Name is required', minLength: 20, maxLength: 60 })}
                />
                {userForm.formState.errors.name && <span className="text-[10px] text-red-400 font-medium">Name length must be between 20-60 chars</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                  {...userForm.register('email', { required: 'Email is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">
                  Password {editingUser && <span className="text-[10px] text-dark-300">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                  {...userForm.register('password', {
                    required: !editingUser ? 'Password is required' : false,
                    validate: (val) => {
                      if (!val && editingUser) return true;
                      if (!val) return 'Password is required';
                      if (val.length < 8 || val.length > 16) return 'Password must be 8-16 characters';
                      if (!/(?=.*[A-Z])/.test(val)) return 'Need at least 1 uppercase letter';
                      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(val)) return 'Need at least 1 special character';
                      return true;
                    }
                  })}
                />
                {userForm.formState.errors.password && <span className="text-[10px] text-red-400 font-medium">{userForm.formState.errors.password.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Location Address</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                  {...userForm.register('address', { required: 'Address is required', maxLength: 400 })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">User Role</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                  {...userForm.register('role', { required: true })}
                >
                  <option value="USER">USER</option>
                  <option value="STORE_OWNER">STORE OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saveUserMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {saveUserMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingUser ? 'Update Account' : 'Register User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STORE CRUD CREATION/EDIT MODAL */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-dark-800 bg-dark-900/90 shadow-2xl space-y-4 animate-bounce-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white m-0">
                {editingStore ? 'Edit Store Details' : 'Register New Store'}
              </h3>
              <button
                onClick={() => setStoreModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Store Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                  {...storeForm.register('name', { required: 'Store name is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                  {...storeForm.register('email', { required: 'Email is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Location Address</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                  {...storeForm.register('address', { required: 'Address is required' })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Store Owner</label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-dark-800 text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                  {...storeForm.register('ownerId', { required: 'Store owner is required' })}
                >
                  <option value="">Select owner account...</option>
                  {potentialOwners?.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saveStoreMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {saveStoreMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingStore ? 'Update Store' : 'Create Store'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Star,
  Users,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Mail,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface RatingHistoryItem {
  id: string;
  rating: number;
  user: { name: string; email: string };
  createdAt: string;
}

export const OwnerDashboard: React.FC = () => {
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch all owner stats including paginated ratings
  const { data: ownerData, isLoading: statsLoading } = useQuery({
    queryKey: ['ownerStats', historyPage],
    queryFn: async () => {
      const response = await api.get('/dashboard/store-owner', {
        params: { page: historyPage, limit: 8 },
      });
      return response.data;
    },
  });

  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const store = ownerData?.store;
  const ratingsData = ownerData?.ratings;

  const ratingBarData = store?.ratingBreakdown?.map((item: any) => ({
    star: `${item.rating}★`,
    count: item.count,
    rating: item.rating,
  })) || [];

  // Build a simple trend from the history data (group by day)
  const trendData = (ratingsData?.data || []).reduce((acc: any[], item: RatingHistoryItem) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.total += item.rating;
      existing.count += 1;
      existing.avgRating = Number((existing.total / existing.count).toFixed(1));
    } else {
      acc.push({ date, total: item.rating, count: 1, avgRating: item.rating });
    }
    return acc;
  }, []).reverse();

  const renderStars = (score: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= score ? 'text-amber-400 fill-amber-400' : 'text-dark-700'}`}
        />
      ))}
    </div>
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (statsLoading && !ownerData) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 rounded-xl glass-panel shimmer-wrapper" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl glass-panel shimmer-wrapper" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 rounded-2xl glass-panel shimmer-wrapper" />
          <div className="h-64 rounded-2xl glass-panel shimmer-wrapper" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">Store Dashboard</h2>
        <p className="text-sm text-dark-300 mt-1">
          Performance metrics and customer feedback for your store
        </p>
      </div>

      {/* Store info banner */}
      {store && (
        <div className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white font-black text-2xl uppercase shadow-lg shadow-brand-900/30 shrink-0">
            {store.name?.charAt(0) ?? 'S'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white m-0">{store.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-dark-400 text-xs">
                <Mail className="h-3.5 w-3.5 text-dark-500" /> {store.email}
              </div>
              <div className="flex items-center gap-1.5 text-dark-400 text-xs">
                <MapPin className="h-3.5 w-3.5 text-dark-500" />
                <span className="truncate max-w-xs">{store.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {store && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold">Avg Rating</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 shrink-0">
              <Users className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold">Total Reviews</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">{store.totalRatings}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <Award className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold">5-Star Reviews</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {store.ratingBreakdown?.find((r: any) => r.rating === 5)?.count ?? 0}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold">Satisfaction</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">
                {store.averageRating >= 4 ? '🔥 High' : store.averageRating >= 2.5 ? '👍 Good' : store.totalRatings === 0 ? '—' : '📉 Low'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {store && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Trend from History */}
          <div className="p-6 rounded-2xl glass-panel">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-500" /> Recent Rating Trend
            </h4>
            {trendData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#ratingGrad)"
                      name="Avg Rating"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-dark-500 text-sm">
                No ratings data to display yet
              </div>
            )}
          </div>

          {/* Rating Distribution Bar Chart */}
          <div className="p-6 rounded-2xl glass-panel">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Rating Distribution
            </h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="star" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    labelFormatter={(label) => `${label} Ratings`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Reviews">
                    {ratingBarData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Rating History Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-500" /> Customer Reviews
        </h3>

        {statsLoading ? (
          <div className="h-64 glass-panel shimmer-wrapper rounded-2xl" />
        ) : !ratingsData?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-dark-400 glass-panel rounded-2xl">
            <Star className="h-10 w-10 opacity-20" />
            <p className="font-medium">No ratings received yet</p>
            <p className="text-sm">Customer reviews will appear here once they rate your store</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-dark-200">
                <thead className="bg-dark-900/60 border-b border-dark-800/60 text-xs font-semibold uppercase text-dark-300">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/40">
                  {ratingsData.data.map((item: RatingHistoryItem) => (
                    <tr key={item.id} className="hover:bg-dark-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {item.user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{item.user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{item.user.email}</td>
                      <td className="px-6 py-4">{renderStars(item.rating)}</td>
                      <td className="px-6 py-4 text-dark-400 text-xs">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ratingsData.meta?.totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-dark-800/40">
                <span className="text-xs text-dark-400">
                  Page {ratingsData.meta.page} of {ratingsData.meta.totalPages} ({ratingsData.meta.total} reviews)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-40 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={historyPage >= ratingsData.meta.totalPages}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-40 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

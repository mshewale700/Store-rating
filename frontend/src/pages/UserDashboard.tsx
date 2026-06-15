import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Star,
  Search,
  MapPin,
  Mail,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userSubmittedRatingId: string | null;
  userSubmittedRating: number | null;
}

interface StarRatingInputProps {
  value: number;
  onChange: (val: number) => void;
  size?: string;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ value, onChange, size = 'h-7 w-7' }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-dark-600 fill-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const StarDisplay: React.FC<{ rating: number; size?: string }> = ({
  rating,
  size = 'h-4 w-4',
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-dark-700 fill-transparent'
        }`}
      />
    ))}
  </div>
);

export const UserDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ratingModal, setRatingModal] = useState<{ store: StoreItem; mode: 'add' | 'edit' } | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['userStores', page, search],
    queryFn: async () => {
      const response = await api.get('/stores', {
        params: { page, limit: 9, search },
      });
      return response.data;
    },
  });

  const submitRatingMutation = useMutation({
    mutationFn: async ({
      storeId,
      rating,
      ratingId,
    }: {
      storeId: string;
      rating: number;
      ratingId?: string;
    }) => {
      if (ratingId) {
        await api.put(`/ratings/${ratingId}`, { rating });
      } else {
        await api.post('/ratings', { storeId, rating });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStores'] });
      showToast(
        ratingModal?.mode === 'edit'
          ? 'Rating updated successfully!'
          : 'Rating submitted successfully!',
        'success',
      );
      setRatingModal(null);
      setSelectedRating(0);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to submit rating', 'error');
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      await api.delete(`/ratings/${ratingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userStores'] });
      showToast('Rating removed successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to remove rating', 'error');
    },
  });

  const openRatingModal = (store: StoreItem, mode: 'add' | 'edit') => {
    setSelectedRating(mode === 'edit' ? (store.userSubmittedRating ?? 0) : 0);
    setRatingModal({ store, mode });
  };

  const handleSubmitRating = () => {
    if (!selectedRating) {
      showToast('Please select a star rating', 'error');
      return;
    }
    if (!ratingModal) return;
    submitRatingMutation.mutate({
      storeId: ratingModal.store.id,
      rating: selectedRating,
      ratingId:
        ratingModal.mode === 'edit'
          ? (ratingModal.store.userSubmittedRatingId ?? undefined)
          : undefined,
    });
  };

  const ratingLabel: Record<number, string> = {
    0: 'Tap a star to rate',
    1: '😞 Poor',
    2: '😐 Fair',
    3: '🙂 Good',
    4: '😊 Very Good',
    5: '🤩 Excellent!',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white m-0">Explore Stores</h2>
        <p className="text-sm text-dark-300 mt-1">
          Discover and rate stores in your community,{' '}
          <span className="text-brand-400 font-semibold">{user?.name?.split(' ')[0]}</span>
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
        <input
          type="text"
          placeholder="Search stores by name, location, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-dark-900/50 border border-dark-800/80 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-dark-500"
        />
      </div>

      {/* Store Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl glass-panel shimmer-wrapper" />
          ))}
        </div>
      ) : storesData?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-dark-400">
          <Store className="h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">No stores found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storesData?.data?.map((store: StoreItem) => (
            <div
              key={store.id}
              className="group glass-card rounded-2xl p-5 flex flex-col gap-4"
            >
              {/* Store header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg shadow-brand-900/30">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight truncate m-0">
                      {store.name}
                    </h3>
                    <p className="text-[11px] text-dark-400 truncate mt-0.5">{store.email}</p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-amber-300 font-bold text-sm">
                      {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-[10px] text-dark-500">{store.totalRatings} reviews</span>
                </div>
              </div>

              {/* Store details */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-dark-400">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-dark-500" />
                  <p className="text-xs leading-relaxed line-clamp-2">{store.address}</p>
                </div>
                <div className="flex items-center gap-2 text-dark-400">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-dark-500" />
                  <p className="text-xs truncate">{store.email}</p>
                </div>
              </div>

              {/* Star display */}
              <StarDisplay rating={store.averageRating} />

              {/* User rating action */}
              <div className="mt-auto pt-3 border-t border-dark-800/40">
                {store.userSubmittedRatingId ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-400">Your rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= (store.userSubmittedRating ?? 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-dark-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openRatingModal(store, 'edit')}
                        className="text-[10px] px-2 py-1 rounded-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors font-semibold"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => {
                          if (store.userSubmittedRatingId) {
                            deleteRatingMutation.mutate(store.userSubmittedRatingId);
                          }
                        }}
                        disabled={deleteRatingMutation.isPending}
                        className="text-[10px] px-2 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openRatingModal(store, 'add')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/20 hover:border-brand-500/40 text-brand-300 hover:text-brand-200 text-xs font-semibold transition-all duration-200"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Rate this Store
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {storesData && storesData.meta?.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-dark-400">
            Page {storesData.meta.page} of {storesData.meta.totalPages} (
            {storesData.meta.total} stores)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-40 transition-all text-xs font-medium"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              disabled={page >= storesData.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-800 text-dark-300 hover:text-white disabled:opacity-40 transition-all text-xs font-medium"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-dark-800 bg-dark-900/95 shadow-2xl space-y-5 animate-bounce-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white m-0">
                  {ratingModal.mode === 'edit' ? 'Update Your Rating' : 'Rate this Store'}
                </h3>
                <p className="text-sm text-dark-400 mt-1 truncate max-w-[200px]">
                  {ratingModal.store.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setRatingModal(null);
                  setSelectedRating(0);
                }}
                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-300 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <StarRatingInput
                value={selectedRating}
                onChange={setSelectedRating}
                size="h-10 w-10"
              />
              <p className="text-sm text-dark-400 font-medium">
                {ratingLabel[selectedRating] ?? ''}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRatingModal(null);
                  setSelectedRating(0);
                }}
                className="flex-1 py-2.5 rounded-xl border border-dark-800 text-dark-300 hover:text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submitRatingMutation.isPending || selectedRating === 0}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/40 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {submitRatingMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {ratingModal.mode === 'edit' ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

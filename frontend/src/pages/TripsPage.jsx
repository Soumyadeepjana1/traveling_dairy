import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTrips } from '../store/slices/tripSlice';
import {
  HiOutlineMap,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineHeart,
} from 'react-icons/hi2';

const categoryColors = {
  adventure: 'from-orange-500 to-red-500',
  beach: 'from-cyan-500 to-blue-500',
  cultural: 'from-purple-500 to-pink-500',
  'road-trip': 'from-yellow-500 to-orange-500',
  business: 'from-slate-500 to-slate-600',
  family: 'from-green-500 to-emerald-500',
  backpacking: 'from-amber-500 to-yellow-500',
  luxury: 'from-violet-500 to-purple-500',
  other: 'from-gray-500 to-gray-600',
};

const categoryEmojis = {
  adventure: '🏔️',
  beach: '🏖️',
  cultural: '🏛️',
  'road-trip': '🚗',
  business: '💼',
  family: '👨‍👩‍👧‍👦',
  backpacking: '🎒',
  luxury: '✨',
  other: '🌍',
};

function TripCard({ trip, index }) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const duration = trip.duration || Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/trips/${trip._id}`}
        className="group block glass rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1"
      >
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          {trip.coverImage?.url ? (
            <img
              src={trip.coverImage.url}
              alt={trip.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${categoryColors[trip.category] || categoryColors.other} flex items-center justify-center`}>
              <span className="text-6xl">{categoryEmojis[trip.category] || '🌍'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-xs font-medium text-white capitalize">
              {trip.category?.replace('-', ' ')}
            </span>
          </div>
          {trip.isFavorite && (
            <div className="absolute top-3 right-3">
              <HiOutlineHeart className="w-5 h-5 text-red-400 fill-red-400" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white truncate">{trip.title}</h3>
            <p className="text-sm text-white/80 flex items-center gap-1">
              📍 {trip.destination}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <HiOutlineCalendarDays className="w-4 h-4" />
              {formatDate(trip.startDate)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5">
              {duration} day{duration !== 1 ? 's' : ''}
            </span>
          </div>

          {(trip.budget > 0 || trip.rating) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
              {trip.budget > 0 && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <HiOutlineCurrencyDollar className="w-4 h-4" />
                  ${trip.spent || 0} / ${trip.budget}
                </span>
              )}
              {trip.rating && (
                <span className="flex items-center gap-1 text-sm text-amber-400 ml-auto">
                  <HiOutlineStar className="w-4 h-4 fill-amber-400" />
                  {trip.rating}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function TripsPage() {
  const dispatch = useDispatch();
  const { trips, loading, pagination } = useSelector((state) => state.trips);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    dispatch(fetchTrips({ search, category, sortBy, page: 1, limit: 12 }));
  }, [dispatch, search, category, sortBy]);

  const categories = ['adventure', 'beach', 'cultural', 'road-trip', 'business', 'family', 'backpacking', 'luxury', 'other'];

  return (
    <div className="min-h-screen bg-surface-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Trips</h1>
            <p className="text-slate-400 mt-1">
              {pagination.total > 0 ? `${pagination.total} trip${pagination.total !== 1 ? 's' : ''} documented` : 'Start documenting your adventures'}
            </p>
          </div>
          <Link
            to="/trips/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            New Trip
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trips..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="" className="bg-surface-900">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-surface-900 capitalize">
                {c.replace('-', ' ')}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="-createdAt" className="bg-surface-900">Newest First</option>
            <option value="createdAt" className="bg-surface-900">Oldest First</option>
            <option value="-startDate" className="bg-surface-900">Trip Date (Newest)</option>
            <option value="title" className="bg-surface-900">Title A-Z</option>
          </select>
        </div>

        {/* Trips Grid */}
        {loading && trips.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <HiOutlineMap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
            <p className="text-slate-400 mb-6">Document your first adventure!</p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              Create Your First Trip
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, i) => (
              <TripCard key={trip._id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

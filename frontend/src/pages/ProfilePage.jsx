import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchTrips } from '../store/slices/tripSlice';
import { HiOutlinePencilSquare, HiOutlineMap, HiOutlineCalendarDays } from 'react-icons/hi2';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { trips } = useSelector((state) => state.trips);

  useEffect(() => {
    dispatch(fetchTrips({ page: 1, limit: 50 }));
  }, [dispatch]);

  const userTrips = trips;
  const totalDays = userTrips.reduce((sum, t) => {
    const days = Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24));
    return sum + (days || 0);
  }, 0);
  const totalBudget = userTrips.reduce((sum, t) => sum + (t.budget || 0), 0);

  return (
    <div className="min-h-screen bg-surface-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/30">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium capitalize">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{user.email}</p>
              {user.bio && <p className="text-slate-300 text-sm">{user.bio}</p>}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-all">
              <HiOutlinePencilSquare className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userTrips.length}</div>
              <div className="text-sm text-slate-400">Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalDays}</div>
              <div className="text-sm text-slate-400">Days Traveled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Total Budget</div>
            </div>
          </div>
        </motion.div>

        {/* User's Trips */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">My Trips</h2>
        </div>

        {userTrips.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <HiOutlineMap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">You haven&apos;t documented any trips yet.</p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all"
            >
              Create Your First Trip
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {userTrips.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/trips/${trip._id}`}
                  className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    {trip.coverImage?.url ? (
                      <img src={trip.coverImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center text-xl">🌍</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <HiOutlineMap className="w-3 h-3" />
                      {trip.destination}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <HiOutlineCalendarDays className="w-3 h-3" />
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    {trip.rating && (
                      <p className="text-xs text-amber-400 mt-1">★ {trip.rating}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

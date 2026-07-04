import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTrip, deleteTrip, clearCurrentTrip } from '../store/slices/tripSlice';
import { commentAPI } from '../api';
import {
  HiOutlineArrowLeft,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineHeart,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineMapPin,
  HiOutlineCloud,
  HiOutlineTruck,
  HiOutlineChatBubbleLeft,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';

const categoryEmojis = {
  adventure: '🏔️', beach: '🏖️', cultural: '🏛️', 'road-trip': '🚗',
  business: '💼', family: '👨‍👩‍👧‍👦', backpacking: '🎒', luxury: '✨', other: '🌍',
};

const weatherIcons = {
  sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️', windy: '💨', stormy: '⛈️', other: '🌤️',
};

const expenseCategories = {
  transport: '🚗', food: '🍕', hotel: '🏨', activities: '🎯', shopping: '🛍️', other: '📦',
};

export default function TripDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrip: trip, loading } = useSelector((state) => state.trips);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    dispatch(fetchTrip(id));
    return () => dispatch(clearCurrentTrip());
  }, [dispatch, id]);

  useEffect(() => {
    if (trip) {
      commentAPI.getComments(trip._id).then(({ data }) => setComments(data.data?.comments || []));
    }
  }, [trip]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await dispatch(deleteTrip(id));
      navigate('/trips');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const { data } = await commentAPI.addComment(trip._id, { text: newComment });
      setComments((prev) => [data.data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-surface-950 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 skeleton rounded w-48" />
          <div className="h-72 skeleton rounded-2xl" />
          <div className="h-40 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalExpenses = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const duration = trip.duration || Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-surface-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back & Actions */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Link
              to={`/trips/${trip._id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-all"
            >
              <HiOutlinePencilSquare className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden mb-8">
          {trip.coverImage?.url ? (
            <img src={trip.coverImage.url} alt={trip.title} className="w-full h-72 sm:h-96 object-cover" />
          ) : (
            <div className="w-full h-72 sm:h-96 gradient-primary flex items-center justify-center">
              <span className="text-8xl">{categoryEmojis[trip.category] || '🌍'}</span>
            </div>
          )}
        </motion.div>

        {/* Title & Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium capitalize">
              {trip.category?.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs">
              {weatherIcons[trip.weather]} {trip.weather}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs capitalize">
              {trip.mood}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{trip.title}</h1>
          <p className="text-lg text-slate-400 flex items-center gap-2 mb-6">
            <HiOutlineMapPin className="w-5 h-5" />
            {trip.destination}{trip.country ? `, ${trip.country}` : ''}
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <HiOutlineCalendarDays className="w-5 h-5 text-primary-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-sm font-semibold text-white">{duration} days</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <HiOutlineCalendarDays className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Dates</p>
              <p className="text-sm font-semibold text-white">{formatDate(trip.startDate)}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Budget</p>
              <p className="text-sm font-semibold text-white">${trip.budget || 0}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <HiOutlineTruck className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Transport</p>
              <p className="text-sm font-semibold text-white capitalize">{trip.transportation}</p>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {trip.description && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">About this trip</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trip.description}</p>
          </motion.div>
        )}

        {/* Gallery */}
        {trip.images?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Photo Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trip.images.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square group">
                  <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-xs text-white truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Expenses */}
        {trip.expenses?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Expenses</h2>
            <div className="space-y-2">
              {trip.expenses.map((exp, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expenseCategories[exp.category] || '📦'}</span>
                    <div>
                      <p className="text-sm text-white">{exp.description || exp.category}</p>
                      <p className="text-xs text-slate-500 capitalize">{exp.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white">${exp.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-sm font-medium text-slate-400">Total Spent</span>
                <span className="text-lg font-bold text-primary-400">${totalExpenses}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hotel */}
        {trip.hotel?.name && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Accommodation</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{trip.hotel.name}</p>
                {trip.hotel.pricePerNight > 0 && (
                  <p className="text-sm text-slate-400">${trip.hotel.pricePerNight}/night</p>
                )}
              </div>
              {trip.hotel.rating && (
                <div className="flex items-center gap-1 text-amber-400">
                  <HiOutlineStar className="w-5 h-5 fill-amber-400" />
                  <span className="font-medium">{trip.hotel.rating}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {trip.notes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Notes</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trip.notes}</p>
          </motion.div>
        )}

        {/* Tags */}
        {trip.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {trip.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {trip.rating && (
          <div className="flex items-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <HiOutlineStar
                key={s}
                className={`w-6 h-6 ${s <= trip.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
              />
            ))}
            <span className="text-sm text-slate-400 ml-2">{trip.rating}/5</span>
          </div>
        )}

        {/* Comments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineChatBubbleLeft className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50 transition-all"
            >
              Post
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {c.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{c.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { createTrip } from '../store/slices/tripSlice';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlinePlus,
} from 'react-icons/hi2';

const CATEGORIES = ['adventure', 'beach', 'cultural', 'road-trip', 'business', 'family', 'backpacking', 'luxury', 'other'];
const MOODS = ['excited', 'happy', 'relaxed', 'adventurous', 'nostalgic', 'inspired', 'other'];
const WEATHER = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'stormy', 'other'];
const TRANSPORT = ['car', 'bus', 'train', 'flight', 'bike', 'walk', 'boat', 'other'];
const EXPENSE_CATEGORIES = ['transport', 'food', 'hotel', 'activities', 'shopping', 'other'];

export default function CreateTripPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    destination: '',
    country: '',
    state: '',
    city: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    category: 'other',
    mood: 'happy',
    rating: '',
    weather: 'sunny',
    transportation: 'car',
    hotel: { name: '', rating: '', pricePerNight: '' },
    tags: [],
    expenses: [],
    notes: '',
    isPublic: true,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateHotel = (field, value) => setForm((prev) => ({ ...prev, hotel: { ...prev.hotel, [field]: value } }));

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, coverFile: file }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => update('tags', form.tags.filter((t) => t !== tag));

  const addExpense = () => {
    update('expenses', [...form.expenses, { category: 'food', amount: '', description: '', date: '' }]);
  };

  const updateExpense = (index, field, value) => {
    const updated = [...form.expenses];
    updated[index] = { ...updated[index], [field]: value };
    update('expenses', updated);
  };

  const removeExpense = (index) => update('expenses', form.expenses.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.country || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : 0,
        rating: form.rating ? Number(form.rating) : undefined,
        hotel: {
          ...form.hotel,
          rating: form.hotel.rating ? Number(form.hotel.rating) : undefined,
          pricePerNight: form.hotel.pricePerNight ? Number(form.hotel.pricePerNight) : 0,
        },
        expenses: form.expenses.map((e) => ({ ...e, amount: Number(e.amount) || 0 })),
      };
      delete payload.coverFile;
      const result = await dispatch(createTrip(payload));
      if (!result.error) {
        toast.success('Trip created!');
        navigate(`/trips/${result.payload._id}`);
      } else {
        toast.error(result.payload || 'Failed to create trip');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen bg-surface-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Trip</h1>
          <p className="text-slate-400 mb-8">Document your adventure</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div className="glass rounded-2xl p-6">
              <label className={labelClass}>Cover Image</label>
              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={coverPreview} alt="" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(null); setForm((p) => ({ ...p, coverFile: null })); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors">
                  <HiOutlinePhoto className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">Click to upload cover image</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Basic Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Title *</label>
                  <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} placeholder="Summer in Paris" required />
                </div>
                <div>
                  <label className={labelClass}>Destination *</label>
                  <input type="text" value={form.destination} onChange={(e) => update('destination', e.target.value)} className={inputClass} placeholder="Paris, France" required />
                </div>
                <div>
                  <label className={labelClass}>Country *</label>
                  <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} placeholder="France" required />
                </div>
                <div>
                  <label className={labelClass}>State/Region</label>
                  <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} placeholder="Île-de-France" />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} placeholder="Paris" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className={inputClass} placeholder="Tell the story of your trip..." />
              </div>
            </div>

            {/* Dates & Budget */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Dates & Budget</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>End Date *</label>
                  <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Budget ($)</label>
                  <input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)} className={inputClass} placeholder="0" min="0" />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface-900 capitalize">{c.replace('-', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mood</label>
                  <select value={form.mood} onChange={(e) => update('mood', e.target.value)} className={inputClass}>
                    {MOODS.map((m) => <option key={m} value={m} className="bg-surface-900 capitalize">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Weather</label>
                  <select value={form.weather} onChange={(e) => update('weather', e.target.value)} className={inputClass}>
                    {WEATHER.map((w) => <option key={w} value={w} className="bg-surface-900 capitalize">{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transport</label>
                  <select value={form.transportation} onChange={(e) => update('transportation', e.target.value)} className={inputClass}>
                    {TRANSPORT.map((t) => <option key={t} value={t} className="bg-surface-900 capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('rating', form.rating === s ? '' : s)}
                      className={`text-2xl transition-colors ${s <= (form.rating || 0) ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Accommodation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className={labelClass}>Hotel Name</label>
                  <input type="text" value={form.hotel.name} onChange={(e) => updateHotel('name', e.target.value)} className={inputClass} placeholder="Hotel name" />
                </div>
                <div>
                  <label className={labelClass}>Hotel Rating</label>
                  <input type="number" value={form.hotel.rating} onChange={(e) => updateHotel('rating', e.target.value)} className={inputClass} placeholder="1-5" min="1" max="5" />
                </div>
                <div>
                  <label className={labelClass}>Price/Night ($)</label>
                  <input type="number" value={form.hotel.pricePerNight} onChange={(e) => updateHotel('pricePerNight', e.target.value)} className={inputClass} placeholder="0" min="0" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Tags</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className={inputClass}
                  placeholder="Add a tag..."
                />
                <button type="button" onClick={addTag} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all">
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                        <HiOutlineXMark className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Expenses</h2>
                <button type="button" onClick={addExpense} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
                  <HiOutlinePlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {form.expenses.length === 0 ? (
                <p className="text-sm text-slate-500">No expenses added yet</p>
              ) : (
                <div className="space-y-3">
                  {form.expenses.map((exp, i) => (
                    <div key={i} className="flex gap-3 items-end">
                      <select value={exp.category} onChange={(e) => updateExpense(i, 'category', e.target.value)} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none">
                        {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface-900 capitalize">{c}</option>)}
                      </select>
                      <input type="number" value={exp.amount} onChange={(e) => updateExpense(i, 'amount', e.target.value)} className="w-24 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none" placeholder="$" min="0" />
                      <input type="text" value={exp.description} onChange={(e) => updateExpense(i, 'description', e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none placeholder-slate-500" placeholder="Description" />
                      <button type="button" onClick={() => removeExpense(i)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10">
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Notes</h2>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={4} className={inputClass} placeholder="Personal notes about this trip..." />
            </div>

            {/* Visibility */}
            <div className="glass rounded-2xl p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => update('isPublic', e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">Make this trip public</p>
                  <p className="text-xs text-slate-400">Others can discover and view this trip</p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Create Trip'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

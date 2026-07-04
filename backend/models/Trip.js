import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['transport', 'food', 'hotel', 'activities', 'shopping', 'other'],
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    country: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    budget: { type: Number, min: 0, default: 0 },
    spent: { type: Number, min: 0, default: 0 },
    category: {
      type: String,
      enum: [
        'adventure',
        'beach',
        'cultural',
        'road-trip',
        'business',
        'family',
        'backpacking',
        'luxury',
        'other',
      ],
      default: 'other',
    },
    mood: {
      type: String,
      enum: ['excited', 'happy', 'relaxed', 'adventurous', 'nostalgic', 'inspired', 'other'],
      default: 'happy',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'stormy', 'other'],
      default: 'sunny',
    },
    transportation: {
      type: String,
      enum: ['car', 'bus', 'train', 'flight', 'bike', 'walk', 'boat', 'other'],
      default: 'car',
    },
    hotel: {
      name: { type: String, default: '' },
      rating: { type: Number, min: 1, max: 5, default: null },
      pricePerNight: { type: Number, min: 0, default: 0 },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: [
      {
        url: String,
        publicId: String,
        caption: { type: String, default: '' },
      },
    ],
    tags: [{ type: String, trim: true }],
    expenses: [expenseSchema],
    notes: { type: String, maxlength: [3000, 'Notes cannot exceed 3000 characters'], default: '' },
    isFavorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
tripSchema.index({ title: 'text', destination: 'text', country: 'text', tags: 'text' });
tripSchema.index({ startDate: -1 });
tripSchema.index({ category: 1 });
tripSchema.index({ isFavorite: 1 });
tripSchema.index({ createdAt: -1 });

// Virtual: duration
tripSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    const diff = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    return diff;
  }
  return 0;
});

// Virtual: comments
tripSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'trip',
});

// Pre-delete cleanup
tripSchema.pre('findOneAndDelete', async function (next) {
  const trip = await this.model.findOne(this.getFilter());
  if (trip) {
    await mongoose.model('Comment').deleteMany({ trip: trip._id });
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;

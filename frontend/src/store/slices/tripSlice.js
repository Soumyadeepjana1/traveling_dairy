import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripAPI } from '../../api';

export const fetchTrips = createAsyncThunk('trips/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await tripAPI.getAll(params);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trips');
  }
});

export const fetchTrip = createAsyncThunk('trips/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await tripAPI.getOne(id);
    return data.data.trip;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Trip not found');
  }
});

export const createTrip = createAsyncThunk('trips/create', async (tripData, { rejectWithValue }) => {
  try {
    const { data } = await tripAPI.create(tripData);
    return data.data.trip;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create trip');
  }
});

export const updateTrip = createAsyncThunk('trips/update', async ({ id, ...tripData }, { rejectWithValue }) => {
  try {
    const { data } = await tripAPI.update(id, tripData);
    return data.data.trip;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update trip');
  }
});

export const deleteTrip = createAsyncThunk('trips/delete', async (id, { rejectWithValue }) => {
  try {
    await tripAPI.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete trip');
  }
});

export const fetchDashboardStats = createAsyncThunk('trips/dashboardStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await tripAPI.getDashboardStats();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

const tripSlice = createSlice({
  name: 'trips',
  initialState: {
    trips: [],
    currentTrip: null,
    dashboardStats: null,
    pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearTripError: (state) => { state.error = null; },
    clearCurrentTrip: (state) => { state.currentTrip = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => { state.loading = true; })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.trips;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTrips.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTrip.pending, (state) => { state.loading = true; })
      .addCase(fetchTrip.fulfilled, (state, action) => {
        state.loading = false; state.currentTrip = action.payload;
      })
      .addCase(fetchTrip.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.trips.unshift(action.payload);
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.trips[index] = action.payload;
        if (state.currentTrip?._id === action.payload._id) state.currentTrip = action.payload;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter((t) => t._id !== action.payload);
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      });
  },
});

export const { clearTripError, clearCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;

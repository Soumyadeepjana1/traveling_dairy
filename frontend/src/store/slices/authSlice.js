import { createSlice } from '@reduxjs/toolkit';

// No authentication - always logged in as guest
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: { _id: 'guest', name: 'Traveler', email: 'traveler@travel.com', role: 'user' },
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
});

// Export no-op thunks so existing code doesn't break
export const loadUser = () => () => {};
export const login = () => () => {};
export const register = () => () => {};
export const logout = () => () => {};

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

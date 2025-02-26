import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchReservations = createAsyncThunk(
  'reservations/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reservations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: filters
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkInReservation = createAsyncThunk(
  'reservations/checkIn',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/reservations/${id}/check-in`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkOutReservation = createAsyncThunk(
  'reservations/checkOut',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/reservations/${id}/check-out`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  reservations: [],
  loading: false,
  error: null,
  stats: {
    totalReservations: 0,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
    lotStats: {
      Lombardi: { total: 0, occupied: 0 },
      Military: { total: 0, occupied: 0 }
    }
  }
};

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch reservations';
      })
      // Check In
      .addCase(checkInReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(checkInReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to check in';
      })
      // Check Out
      .addCase(checkOutReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOutReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(checkOutReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to check out';
      });
  }
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;

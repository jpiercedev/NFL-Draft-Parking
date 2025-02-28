import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentReservation: null,
  reservations: [],
  status: 'idle',
  error: null
};

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    setReservation: (state, action) => {
      state.currentReservation = action.payload;
    },
    updateReservation: (state, action) => {
      state.currentReservation = action.payload;
      const index = state.reservations.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    },
    clearReservation: (state) => {
      state.currentReservation = null;
    }
  }
});

export const { setReservation, updateReservation, clearReservation } = reservationsSlice.actions;

export const selectReservationById = (state, id) => 
  state.reservations.currentReservation?.id === id 
    ? state.reservations.currentReservation 
    : null;

export default reservationsSlice.reducer;

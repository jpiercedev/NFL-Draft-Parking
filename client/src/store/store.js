import { configureStore } from '@reduxjs/toolkit';
import reservationsReducer from '../features/reservations/reservationsSlice';

export const store = configureStore({
  reducer: {
    reservations: reservationsReducer,
  },
});

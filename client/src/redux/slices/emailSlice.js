import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTemplates = createAsyncThunk(
  'emails/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/emails/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  templates: [],
  loading: false,
  error: null
};

const emailSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch email templates';
      });
  }
});

export const { clearError } = emailSlice.actions;
export default emailSlice.reducer;

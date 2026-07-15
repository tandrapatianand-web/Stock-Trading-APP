import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  watchlist: [],
  isLoading: false,
  error: null,
  success: false
};

// Fetch user's watchlist
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/watchlist');
      if (response.data.success) {
        return response.data.data;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add stock to watchlist
export const addToWatchlist = createAsyncThunk(
  'watchlist/add',
  async (stockId, thunkAPI) => {
    try {
      const response = await api.post('/watchlist', { stockId });
      if (response.data.success) {
        thunkAPI.dispatch(fetchWatchlist()); // Refetch
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove stock from watchlist
export const removeFromWatchlist = createAsyncThunk(
  'watchlist/remove',
  async (stockId, thunkAPI) => {
    try {
      const response = await api.delete(`/watchlist/${stockId}`);
      if (response.data.success) {
        thunkAPI.dispatch(fetchWatchlist()); // Refetch
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearWatchlistError: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchlist = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Watchlist
      .addCase(addToWatchlist.fulfilled, (state) => {
        state.success = true;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from Watchlist
      .addCase(removeFromWatchlist.fulfilled, (state) => {
        state.success = true;
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearWatchlistError } = watchlistSlice.actions;
export default watchlistSlice.reducer;

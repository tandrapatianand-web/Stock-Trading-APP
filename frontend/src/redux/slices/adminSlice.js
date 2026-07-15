import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchStocks } from './stockSlice';

const initialState = {
  users: [],
  stats: null,
  isLoading: false,
  error: null,
  actionSuccess: false,
};

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/admin/users');
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

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, thunkAPI) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        thunkAPI.dispatch(fetchUsers()); // Refetch
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch Admin Stats
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/admin/dashboard');
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

// Admin Create Stock
export const createStockAdmin = createAsyncThunk(
  'admin/createStock',
  async (stockData, thunkAPI) => {
    try {
      const response = await api.post('/stocks', stockData);
      if (response.data.success) {
        thunkAPI.dispatch(fetchStocks({})); // Refresh public stock catalog
        return response.data.data;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin Update Stock
export const updateStockAdmin = createAsyncThunk(
  'admin/updateStock',
  async ({ id, stockData }, thunkAPI) => {
    try {
      const response = await api.put(`/stocks/${id}`, stockData);
      if (response.data.success) {
        thunkAPI.dispatch(fetchStocks({})); // Refresh public stock catalog
        return response.data.data;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin Delete Stock
export const deleteStockAdmin = createAsyncThunk(
  'admin/deleteStock',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/stocks/${id}`);
      if (response.data.success) {
        thunkAPI.dispatch(fetchStocks({})); // Refresh public stock catalog
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminFlags: (state) => {
      state.actionSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Stock
      .addCase(createStockAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createStockAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.actionSuccess = true;
      })
      .addCase(createStockAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Stock
      .addCase(updateStockAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateStockAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.actionSuccess = true;
      })
      .addCase(updateStockAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Stock
      .addCase(deleteStockAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(deleteStockAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.actionSuccess = true;
      })
      .addCase(deleteStockAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminFlags } = adminSlice.actions;
export default adminSlice.reducer;

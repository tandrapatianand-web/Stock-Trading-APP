import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  stocks: [],
  sectors: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  currentStock: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

// Fetch stocks with queries
export const fetchStocks = createAsyncThunk(
  'stocks/fetchAll',
  async (queryParams, thunkAPI) => {
    try {
      const { search, sector, sort, page } = queryParams || {};
      let url = '/stocks?';
      if (search) url += `search=${search}&`;
      if (sector) url += `sector=${sector}&`;
      if (sort) url += `sort=${sort}&`;
      if (page) url += `page=${page}&`;

      const response = await api.get(url);
      if (response.data.success) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch stock by ID
export const fetchStockDetail = createAsyncThunk(
  'stocks/fetchDetail',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/stocks/${id}`);
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

const stockSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    clearCurrentStock: (state) => {
      state.currentStock = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stocks
      .addCase(fetchStocks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stocks = action.payload.data;
        state.sectors = action.payload.sectors;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Stock Detail
      .addCase(fetchStockDetail.pending, (state) => {
        state.isDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchStockDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.currentStock = action.payload;
      })
      .addCase(fetchStockDetail.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentStock } = stockSlice.actions;
export default stockSlice.reducer;

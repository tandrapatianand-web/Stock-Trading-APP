import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  portfolio: null,
  transactions: [],
  txPagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  isLoading: false,
  isTrading: false,
  error: null,
  successMessage: null,
};

// Fetch user's portfolio
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/portfolio');
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

// Buy stock order
export const buyStockOrder = createAsyncThunk(
  'portfolio/buyStock',
  async (tradeData, thunkAPI) => {
    try {
      const response = await api.post('/trade/buy', tradeData);
      if (response.data.success) {
        // Refetch portfolio to update state automatically
        thunkAPI.dispatch(fetchPortfolio());
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Sell stock order
export const sellStockOrder = createAsyncThunk(
  'portfolio/sellStock',
  async (tradeData, thunkAPI) => {
    try {
      const response = await api.post('/trade/sell', tradeData);
      if (response.data.success) {
        // Refetch portfolio to update state automatically
        thunkAPI.dispatch(fetchPortfolio());
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add money/funds to portfolio
export const depositFunds = createAsyncThunk(
  'portfolio/depositFunds',
  async (depositData, thunkAPI) => {
    try {
      const response = await api.post('/portfolio/add-funds', depositData);
      if (response.data.success) {
        // Refetch portfolio to update state automatically
        thunkAPI.dispatch(fetchPortfolio());
        return response.data.message;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch transactions history
export const fetchTransactions = createAsyncThunk(
  'portfolio/fetchTransactions',
  async (params, thunkAPI) => {
    try {
      const { search, type, page } = params || {};
      let url = '/transactions?';
      if (search) url += `search=${search}&`;
      if (type) url += `type=${type}&`;
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

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearTradeMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Buy Order
      .addCase(buyStockOrder.pending, (state) => {
        state.isTrading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(buyStockOrder.fulfilled, (state, action) => {
        state.isTrading = false;
        state.successMessage = action.payload;
      })
      .addCase(buyStockOrder.rejected, (state, action) => {
        state.isTrading = false;
        state.error = action.payload;
      })
      // Sell Order
      .addCase(sellStockOrder.pending, (state) => {
        state.isTrading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sellStockOrder.fulfilled, (state, action) => {
        state.isTrading = false;
        state.successMessage = action.payload;
      })
      .addCase(sellStockOrder.rejected, (state, action) => {
        state.isTrading = false;
        state.error = action.payload;
      })
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.txPagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Deposit Funds
      .addCase(depositFunds.pending, (state) => {
        state.isTrading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(depositFunds.fulfilled, (state, action) => {
        state.isTrading = false;
        state.successMessage = action.payload;
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.isTrading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTradeMessages } = portfolioSlice.actions;
export default portfolioSlice.reducer;

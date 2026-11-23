import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.map(item => ({ ...item, price: Math.round(item.price * 84) }));
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null, searchQuery: '', selectedCategory: 'all', sortBy: 'default' },
  reducers: {
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
    setSortBy: (state, action) => { state.sortBy = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

const loadCart = () => { try { const s = localStorage.getItem('cart'); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveCart = (items) => { try { localStorage.setItem('cart', JSON.stringify(items)); } catch {} };

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, action) => {
      const exist = state.items.find(i => i.id === action.payload.id);
      if (exist) exist.quantity += 1; else state.items.push({ ...action.payload, quantity: 1 });
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, delta } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) state.items = state.items.filter(i => i.id !== id);
      }
      saveCart(state.items);
    },
    clearCart: (state) => { state.items = []; saveCart([]); },
  },
});

export const { setSearchQuery, setSelectedCategory, setSortBy } = productsSlice.actions;
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectFilteredProducts = (state) => {
  const { items, searchQuery, selectedCategory, sortBy } = state.products;
  return items.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating?.rate || 0) - (a.rating?.rate || 0);
    return 0;
  });
};

export const selectCartTotals = (state) => {
  const totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
};

export const store = configureStore({
  reducer: { products: productsSlice.reducer, cart: cartSlice.reducer },
});
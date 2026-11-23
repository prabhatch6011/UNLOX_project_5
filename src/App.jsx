import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts, setSearchQuery, setSelectedCategory, setSortBy,
  addToCart, removeFromCart, updateQuantity, clearCart,
  selectFilteredProducts, selectCartTotals,
} from './store';
import {
  ShoppingCart, Search, Star, Plus, Minus, Trash2, ArrowLeft,
  Sparkles, CheckCircle2, PackageOpen, AlertCircle, Menu, X
} from 'lucide-react';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div style={styles.card}>
      <Link to={`/product/${product.id}`} style={styles.imgWrap}>
        <img src={product.image} alt={product.title} style={styles.cardImg} loading="lazy" />
        <span style={styles.badge}>{product.category}</span>
      </Link>
      <div style={styles.cardBody}>
        <Link to={`/product/${product.id}`} style={styles.title} title={product.title}>
          {product.title}
        </Link>
        <div style={styles.meta}>
          <span style={styles.rating}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            {product.rating?.rate || '4.5'} <small style={{color:'#64748b'}}>({product.rating?.count || 20})</small>
          </span>
          <span style={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
        </div>
        <button style={{...styles.btnPrimary, width:'100%', background: added ? '#10b981' : '#4f46e5'}} onClick={handleAdd}>
          {added ? <><CheckCircle2 size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = useSelector((state) => state.products.searchQuery);
  const { totalItems } = useSelector(selectCartTotals);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
    if (location.pathname !== '/products') navigate('/products');
  };

  return (
    <header style={styles.navbar}>
      <div style={styles.containerStyle}>
        <div style={styles.navInner}>
          <Link to="/" style={styles.brand} onClick={() => setMenuOpen(false)}>
            <Sparkles size={22} color="#4f46e5" /><span>ShopVibe</span>
          </Link>
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={handleSearch} style={styles.searchInput} />
            {searchQuery && <button onClick={() => dispatch(setSearchQuery(''))} style={styles.clearBtn}><X size={14} /></button>}
          </div>
          <nav style={{...styles.navLinks, display: menuOpen ? 'flex' : undefined}}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} style={styles.cartPill}>
              <ShoppingCart size={18} /><span>Cart</span>
              {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
            </Link>
          </nav>
          <button style={styles.mobileBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage({ status, error, onRetry }) {
  const items = useSelector((state) => state.products.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const featured = items.slice(0, 4);
  const categories = ['electronics', 'jewelery', "men's clothing", "women's clothing"];

  const goCategory = (cat) => {
    dispatch(setSelectedCategory(cat));
    navigate('/products');
  };

  return (
    <main>
      <section style={styles.hero}>
        <div style={styles.containerStyle}>
          <div style={styles.heroGrid}>
            <div>
              <span style={styles.pillTag}>Season Sale • Up to 40% Off</span>
              <h1 style={styles.heroTitle}>Upgrade Your Everyday Lifestyle.</h1>
              <p style={styles.heroDesc}>Curated electronics and fashion powered by Redux Toolkit.</p>
              <div style={{display:'flex', gap:'14px'}}>
                <Link to="/products" style={{...styles.btnPrimary, padding:'12px 24px'}}>Shop Collection</Link>
                <button onClick={() => goCategory('electronics')} style={styles.btnOutline}>Explore Tech</button>
              </div>
            </div>
            <div style={styles.heroCard}>
              <div style={styles.statBox}><h3 style={{color:'#a5b4fc'}}>100%</h3><p style={{margin:0, fontSize:'0.85rem'}}>Genuine Products</p></div>
              <div style={styles.statBox}><h3 style={{color:'#a5b4fc'}}>Free</h3><p style={{margin:0, fontSize:'0.85rem'}}>Express Delivery</p></div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.containerStyle}>
        <div style={{...styles.sectionHead, marginTop:'40px'}}><h2>Shop by Category</h2></div>
        <div style={styles.catGrid}>
          {categories.map((cat) => (
            <button key={cat} style={styles.catCard} onClick={() => goCategory(cat)}><span>{cat}</span></button>
          ))}
        </div>
      </section>

      <section style={styles.containerStyle}>
        <div style={styles.sectionHead}>
          <h2>Featured Products</h2>
          <Link to="/products" style={{color:'#4f46e5', fontWeight:600}}>View All →</Link>
        </div>
        {status === 'loading' && <div style={styles.stateBox}><div style={styles.spinner} /><p>Loading featured items...</p></div>}
        {status === 'failed' && <div style={{...styles.stateBox, color:'#ef4444'}}><AlertCircle size={32} /><p>{error}</p><button style={styles.btnPrimary} onClick={onRetry}>Retry</button></div>}
        {status === 'succeeded' && <div style={styles.productGrid}>{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </section>
    </main>
  );
}

function ProductsPage({ status, error, onRetry }) {
  const dispatch = useDispatch();
  const filteredProducts = useSelector(selectFilteredProducts);
  const { items, selectedCategory, sortBy, searchQuery } = useSelector((state) => state.products);
  const categories = ['all', ...new Set(items.map((i) => i.category))];

  return (
    <main style={{...styles.containerStyle, paddingBottom:'50px', paddingTop:'30px'}}>
      <div style={styles.listingHead}>
        <div><h1>All Products</h1><p style={{color:'#64748b'}}>Showing {filteredProducts.length} products</p></div>
        <div style={{display:'flex', gap:'12px'}}>
          <select value={selectedCategory} onChange={(e) => dispatch(setSelectedCategory(e.target.value))} style={styles.selectBox}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))} style={styles.selectBox}>
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      {status === 'loading' && <div style={styles.stateBox}><div style={styles.spinner} /><p>Fetching catalog...</p></div>}
      {status === 'succeeded' && filteredProducts.length === 0 && (
        <div style={styles.stateBox}><PackageOpen size={40} /><h3>No products found</h3><button style={styles.btnOutline} onClick={() => dispatch(setSearchQuery(''))}>Reset Filters</button></div>
      )}
      <div style={styles.productGrid}>{filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </main>
  );
}

function ProductDetailsPage({ status }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.items.find((item) => String(item.id) === String(id)));
  const [added, setAdded] = useState(false);

  if (status === 'loading') return <div style={styles.stateBox}><div style={styles.spinner} /></div>;
  if (!product) return <div style={styles.stateBox}><h2>Product not found</h2><button style={styles.btnPrimary} onClick={() => navigate('/products')}>Back</button></div>;

  const handleAdd = () => {
    dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <main style={{...styles.containerStyle, padding:'30px 20px'}}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}><ArrowLeft size={16} /> Back</button>
      <div style={styles.detailsGrid}>
        <div style={styles.detailImgBox}><img src={product.image} alt={product.title} style={{maxHeight:'100%', maxWidth:'100%', objectFit:'contain'}} /></div>
        <div>
          <span style={{...styles.pillTag, background:'#eef2ff', color:'#4f46e5'}}>{product.category}</span>
          <h1 style={{fontSize:'1.8rem', margin:'10px 0'}}>{product.title}</h1>
          <div style={{fontSize:'2rem', fontWeight:700, margin:'15px 0'}}>₹{product.price.toLocaleString('en-IN')}</div>
          <p style={{color:'#334155', lineHeight:1.7, marginBottom:'25px'}}>{product.description}</p>
          <button style={{...styles.btnPrimary, padding:'14px 28px', background: added ? '#10b981' : '#4f46e5'}} onClick={handleAdd}>
            {added ? <><CheckCircle2 size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </main>
  );
}

function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const { totalItems, totalPrice } = useSelector(selectCartTotals);
  const [checkedOut, setCheckedOut] = useState(false);

  if (checkedOut) return <div style={styles.stateBox}><CheckCircle2 size={56} color="#10b981" /><h2>Order Placed Successfully!</h2><Link to="/products" style={styles.btnPrimary}>Continue Shopping</Link></div>;
  if (cartItems.length === 0) return <div style={styles.stateBox}><PackageOpen size={56} color="#64748b" /><h2>Your cart is empty</h2><Link to="/products" style={styles.btnPrimary}>Browse Products</Link></div>;

  return (
    <main style={{...styles.containerStyle, padding:'30px 20px'}}>
      <h1>Shopping Cart ({totalItems} items)</h1>
      <div style={styles.cartLayout}>
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          {cartItems.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <img src={item.image} alt={item.title} style={{width:'70px', height:'70px', objectFit:'contain'}} />
              <div style={{flex:1}}>
                <h4 style={{margin:0}}>{item.title}</h4>
                <p style={{color:'#64748b', margin:'5px 0'}}>₹{item.price.toLocaleString('en-IN')}</p>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, delta: -1 }))} style={styles.qtyBtn}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, delta: 1 }))} style={styles.qtyBtn}><Plus size={14} /></button>
                </div>
              </div>
              <button onClick={() => dispatch(removeFromCart(item.id))} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
        <div style={styles.summaryCard}>
          <h3>Order Summary</h3>
          <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0'}}><span>Total Items</span><span>{totalItems}</span></div>
          <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0', fontWeight:700, fontSize:'1.2rem'}}><span>Total Amount</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
          <button style={{...styles.btnPrimary, width:'100%', marginTop:'15px', padding:'12px'}} onClick={() => { setCheckedOut(true); dispatch(clearCart()); }}>Proceed to Checkout</button>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [status, dispatch]);

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f8fafc', fontFamily:'system-ui, sans-serif'}}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage status={status} error={error} onRetry={() => dispatch(fetchProducts())} />} />
        <Route path="/products" element={<ProductsPage status={status} error={error} onRetry={() => dispatch(fetchProducts())} />} />
        <Route path="/product/:id" element={<ProductDetailsPage status={status} />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <footer style={{background:'#ffffff', borderTop:'1px solid #e2e8f0', padding:'20px 0', textAlign:'center', color:'#64748b', marginTop:'auto'}}>
        <p>© {new Date().getFullYear()} ShopVibe • React & Redux Toolkit</p>
      </footer>
    </div>
  );
}

const styles = {
  containerStyle: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' },
  navbar: { background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  navInner: { height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.3rem', color: '#4f46e5', textDecoration: 'none' },
  searchBox: { flex: 1, maxWidth: '400px', position: 'relative', display: 'flex', alignItems: 'center' },
  searchInput: { width: '100%', padding: '10px 10px 10px 38px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' },
  searchIcon: { position: 'absolute', left: '12px', color: '#64748b' },
  clearBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '24px', fontWeight: 500 },
  cartPill: { display: 'flex', alignItems: 'center', gap: '6px', background: '#eef2ff', color: '#4f46e5', padding: '8px 14px', borderRadius: '99px', fontWeight: 600 },
  cartBadge: { background: '#4f46e5', color: '#fff', fontSize: '0.75rem', padding: '2px 7px', borderRadius: '99px' },
  mobileBtn: { display: 'none', background: 'none', border: 'none', cursor: 'pointer' },
  hero: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', padding: '60px 0' },
  heroGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' },
  pillTag: { display: 'inline-block', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px' },
  heroTitle: { fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '16px' },
  heroDesc: { color: '#cbd5e1', marginBottom: '24px' },
  heroCard: { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '24px', display: 'grid', gap: '16px' },
  statBox: { background: 'rgba(255, 255, 255, 0.06)', padding: '14px 18px', borderRadius: '8px' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', border: 'none', color: '#fff', background: '#4f46e5' },
  btnOutline: { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  catCard: { background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  imgWrap: { position: 'relative', height: '200px', background: '#fff', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' },
  cardImg: { maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' },
  badge: { position: 'absolute', top: '10px', left: '10px', background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', textTransform: 'capitalize' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' },
  title: { fontWeight: 600, fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textDecoration: 'none', color: '#0f172a' },
  meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 },
  price: { fontWeight: 700, fontSize: '1.1rem' },
  listingHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' },
  selectBox: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' },
  stateBox: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '20px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  detailImgBox: { height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' },
  cartLayout: { display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: '30px', marginTop: '20px' },
  cartItem: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' },
  qtyBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' },
  summaryCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: 'fit-content' }
};
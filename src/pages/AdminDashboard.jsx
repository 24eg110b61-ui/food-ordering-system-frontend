import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, money } from '../api';

const STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const TABS = ['Statistics', 'Food Items', 'Categories', 'Orders', 'Customers'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Statistics');
  return (
    <>
      <h4 className="mb-3">Admin Dashboard</h4>
      <ul className="nav nav-pills mb-4">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : 'text-dark'}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>
      {tab === 'Statistics' && <Stats />}
      {tab === 'Food Items' && <FoodManager />}
      {tab === 'Categories' && <CategoryManager />}
      {tab === 'Orders' && <OrderManager />}
      {tab === 'Customers' && <Customers />}
    </>
  );
}

/* ---------------- Statistics ---------------- */
function Stats() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <p>Loading...</p>;
  const cards = [
    ['Total Orders', s.totalOrders],
    ['Revenue', money(s.totalRevenue)],
    ['Customers', s.totalCustomers],
    ['Food Items', s.totalFoodItems],
  ];
  return (
    <>
      <div className="row g-3 mb-4">
        {cards.map(([k, v]) => (
          <div className="col-6 col-md-3" key={k}>
            <div className="card shadow-sm text-center p-3">
              <div className="text-muted small">{k}</div>
              <div className="fs-4 fw-bold">{v}</div>
            </div>
          </div>
        ))}
      </div>
      <h6>Orders by status</h6>
      <div className="d-flex flex-wrap gap-2">
        {Object.entries(s.ordersByStatus).map(([k, v]) => (
          <span key={k} className="badge bg-secondary p-2">{k.replaceAll('_', ' ')}: {v}</span>
        ))}
      </div>
    </>
  );
}

/* ---------------- Food items ---------------- */
const emptyFood = { name: '', description: '', price: '', imageUrl: '', available: true, categoryId: '' };

function FoodManager() {
  const [foods, setFoods] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(emptyFood);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/foods').then((r) => setFoods(r.data));
    api.get('/categories').then((r) => setCats(r.data));
  }, []);
  useEffect(load, [load]);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) };
    try {
      if (editId) await api.put(`/admin/foods/${editId}`, body);
      else await api.post('/admin/foods', body);
      setForm(emptyFood);
      setEditId(null);
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (f) => {
    setEditId(f.id);
    setForm({ name: f.name, description: f.description || '', price: f.price, imageUrl: f.imageUrl || '',
              available: f.available, categoryId: f.category.id });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try { await api.delete(`/admin/foods/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  const toggle = async (f) => {
    try {
      await api.put(`/admin/foods/${f.id}`, {
        name: f.name, description: f.description, price: f.price, imageUrl: f.imageUrl,
        available: !f.available, categoryId: f.category.id,
      });
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm p-3">
          <h6>{editId ? 'Edit food item' : 'Add food item'}</h6>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={submit}>
            <input className="form-control mb-2" placeholder="Name" required value={form.name} onChange={set('name')} />
            <textarea className="form-control mb-2" rows={2} placeholder="Description" value={form.description} onChange={set('description')} />
            <input className="form-control mb-2" type="number" step="0.01" min="0" placeholder="Price" required value={form.price} onChange={set('price')} />
            <input className="form-control mb-2" placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} />
            <select className="form-select mb-2" required value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Select category</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="form-check mb-3">
              <input id="avail" type="checkbox" className="form-check-input" checked={form.available} onChange={set('available')} />
              <label htmlFor="avail" className="form-check-label">Available</label>
            </div>
            <button className="btn btn-brand me-2">{editId ? 'Update' : 'Add'}</button>
            {editId && <button type="button" className="btn btn-outline-secondary"
                               onClick={() => { setEditId(null); setForm(emptyFood); }}>Cancel</button>}
          </form>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="table-responsive">
          <table className="table table-sm align-middle bg-white shadow-sm">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th /></tr></thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.category?.name}</td>
                  <td>{money(f.price)}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={f.available} onChange={() => toggle(f)} />
                    </div>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(f)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => del(f.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Categories ---------------- */
function CategoryManager() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/admin/categories/${editId}`, form);
      else await api.post('/admin/categories', form);
      setForm({ name: '', description: '' });
      setEditId(null);
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { setError(''); await api.delete(`/admin/categories/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm p-3">
          <h6>{editId ? 'Edit category' : 'Add category'}</h6>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={submit}>
            <input className="form-control mb-2" placeholder="Name" required value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="form-control mb-3" placeholder="Description" value={form.description}
                   onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn btn-brand me-2">{editId ? 'Update' : 'Add'}</button>
            {editId && <button type="button" className="btn btn-outline-secondary"
                               onClick={() => { setEditId(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
          </form>
        </div>
      </div>
      <div className="col-lg-8">
        <table className="table table-sm align-middle bg-white shadow-sm">
          <thead><tr><th>Name</th><th>Description</th><th /></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => { setEditId(c.id); setForm({ name: c.name, description: c.description || '' }); }}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Orders ---------------- */
function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => { api.get('/admin/orders').then((r) => setOrders(r.data)); }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    try { setError(''); await api.put(`/admin/orders/${id}/status`, { status }); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      {orders.map((o) => (
        <div className="card shadow-sm mb-3" key={o.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <strong>Order #{o.id}</strong> — {o.customerName}
                <span className="text-muted small"> ({o.customerEmail})</span>
                <div className="text-muted small">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <strong>{money(o.total)}</strong>
                <select className="form-select form-select-sm" style={{ width: 190 }} value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <ul className="small mt-2 mb-1">
              {o.items.map((i, idx) => <li key={idx}>{i.quantity} × {i.name}</li>)}
            </ul>
            <div className="small text-muted">Deliver to: {o.deliveryAddress}</div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------------- Customers ---------------- */
function Customers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/admin/customers').then((r) => setUsers(r.data)); }, []);
  return (
    <div className="table-responsive">
      <table className="table table-sm bg-white shadow-sm">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

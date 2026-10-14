import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, total, setQty, remove, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    try { setError(''); await fn(); } catch (e) { setError(errMsg(e)); }
  };

  const placeOrder = async () => {
    setBusy(true);
    try {
      setError('');
      await api.post('/orders', { deliveryAddress: address });
      await refresh();
      navigate('/orders');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center mt-5">
        <h4>Your cart is empty</h4>
        <Link to="/" className="btn btn-brand mt-3">Browse menu</Link>
      </div>
    );
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <h4 className="mb-3">Your Cart</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <ul className="list-group shadow-sm">
          {items.map((i) => (
            <li key={i.id} className="list-group-item d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold">{i.name}</div>
                <small className="text-muted">{money(i.price)} each</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => act(() => setQty(i.id, i.quantity - 1))}>−</button>
                <span>{i.quantity}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => act(() => setQty(i.id, i.quantity + 1))}>+</button>
                <span className="fw-bold ms-3" style={{ width: 90, textAlign: 'right' }}>{money(i.price * i.quantity)}</span>
                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => act(() => remove(i.id))}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-lg-4">
        <div className="card shadow-sm p-3">
          <h5>Order Summary</h5>
          <div className="d-flex justify-content-between my-2">
            <span>Total</span><strong>{money(total)}</strong>
          </div>
          <label className="form-label small">Delivery address</label>
          <textarea className="form-control mb-3" rows={3} value={address}
                    onChange={(e) => setAddress(e.target.value)} />
          <button className="btn btn-brand" disabled={busy || !address.trim()} onClick={placeOrder}>
            {busy ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

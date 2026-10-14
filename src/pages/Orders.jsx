import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, money } from '../api';

const STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const label = (s) => s.replaceAll('_', ' ');

function Tracker({ status }) {
  if (status === 'CANCELLED') return <span className="badge bg-danger">CANCELLED</span>;
  const idx = STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STEPS.map((s, i) => (
        <div key={s} className={`step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}`}>
          <div className="dot" />{label(s)}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/orders').then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  // poll every 10s so status changes made by the admin show up automatically
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const cancel = async (id) => {
    try { await api.put(`/orders/${id}/cancel`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h4 className="mb-3">My Orders</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {orders.length === 0 && <p className="text-muted">You have not placed any orders yet.</p>}
      {orders.map((o) => (
        <div className="card shadow-sm mb-3" key={o.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <strong>Order #{o.id}</strong>
                <div className="text-muted small">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold">{money(o.total)}</div>
                {o.status === 'PLACED' && (
                  <button className="btn btn-sm btn-outline-danger mt-1" onClick={() => cancel(o.id)}>Cancel</button>
                )}
              </div>
            </div>
            <Tracker status={o.status} />
            <ul className="small mb-1 mt-3">
              {o.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {i.name} — {money(i.price * i.quantity)}</li>
              ))}
            </ul>
            <div className="small text-muted">Deliver to: {o.deliveryAddress}</div>
          </div>
        </div>
      ))}
    </>
  );
}

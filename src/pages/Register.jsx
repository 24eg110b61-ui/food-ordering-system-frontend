import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm p-4">
          <h3 className="mb-1 serif">Join the table</h3>
          <p className="text-muted mb-3">Make an account and start ordering.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <input className="form-control mb-3" placeholder="Full name" required value={form.name} onChange={set('name')} />
            <input className="form-control mb-3" type="email" placeholder="Email" required value={form.email} onChange={set('email')} />
            <input className="form-control mb-3" type="password" placeholder="Password (min 6 chars)" required minLength={6}
                   value={form.password} onChange={set('password')} />
            <input className="form-control mb-3" placeholder="Phone" value={form.phone} onChange={set('phone')} />
            <textarea className="form-control mb-3" rows={2} placeholder="Delivery address"
                      value={form.address} onChange={set('address')} />
            <button className="btn btn-brand w-100">Sign up</button>
          </form>
          <p className="mt-3 mb-0 small">Already registered? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

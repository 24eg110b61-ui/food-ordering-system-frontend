import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(data.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm p-4">
          <h3 className="mb-1 serif">Welcome back</h3>
          <p className="text-muted mb-3">Your table is waiting.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <input className="form-control mb-3" type="email" placeholder="Email" required
                   value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-3" type="password" placeholder="Password" required
                   value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn btn-brand w-100">Login</button>
          </form>
          <p className="mt-3 mb-0 small">
            New here? <Link to="/register">Create an account</Link>
          </p>
          <p className="text-muted small mb-0">Demo admin: admin@food.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

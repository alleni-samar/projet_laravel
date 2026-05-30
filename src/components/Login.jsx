import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      if (response.data.status === 'success') {
        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animated">
      <div style={styles.card}>
        <h2 style={styles.title}>
          <span style={{ color: 'var(--primary-color)' }}>Fly</span>High
        </h2>
        <h3 style={styles.subtitle}>Connexion</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="votre@email.com"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn glow-btn" style={{ marginTop: '10px' }}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <p style={styles.footerText}>
          Pas encore de compte ? <Link to="/register" style={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
  },
  card: {
    width: '420px',
    padding: '40px',
    backgroundColor: 'rgba(18, 24, 51, 0.65)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 5px 0',
    color: 'var(--text-primary)',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '32px',
    letterSpacing: '-1px',
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-color)',
    borderRadius: 'var(--border-radius-sm)',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  footerText: {
    marginTop: '25px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color var(--transition-fast)',
  }
};

export default Login;

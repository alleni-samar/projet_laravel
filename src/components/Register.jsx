import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role
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
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animated">
      <div style={styles.card}>
        <h2 style={styles.title}>
          <span style={{ color: 'var(--accent-color)' }}>Fly</span>High
        </h2>
        <h3 style={styles.subtitle}>Inscription</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input form-input-accent"
              placeholder="Jean Dupont"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input form-input-accent"
              placeholder="jean.dupont@email.com"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Rôle</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="form-input form-input-accent"
              style={{ cursor: 'pointer' }}
            >
              <option value="user" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Utilisateur (Simple)</option>
              <option value="admin" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Administrateur</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input form-input-accent"
              placeholder="••••••••"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="form-input form-input-accent"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn-accent glow-btn" style={{ marginTop: '10px' }}>
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>
        <p style={styles.footerText}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
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
    minHeight: '100vh',
    width: '100vw',
    padding: '40px 0',
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
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color var(--transition-fast)',
  }
};

export default Register;

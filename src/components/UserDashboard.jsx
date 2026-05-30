import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ReservationList from './ReservationList';
import Chatbot from './Chatbot';

function UserDashboard() {
  const [stats, setStats] = useState({
    total_reservations: 0,
    active_reservations: 0,
    total_spent: 0
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchUserData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setError('');

    try {
      // 1. Fetch User Stats
      const statsRes = await axios.get('http://localhost:8000/api/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err);
      setError("Certaines informations de statistiques n'ont pas pu être chargées.");
    } finally {
      setStatsLoading(false);
    }

    try {
      // 2. Fetch User Reservations
      const resRes = await axios.get('http://localhost:8000/api/user/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resRes.data.status === 'success') {
        setReservations(resRes.data.reservations);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des réservations:", err);
      setError("Erreur lors du chargement de la liste de réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [token]);

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Les sièges libérés seront remis en vente.")) {
      return;
    }

    setCancellingId(reservationId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.delete(`http://localhost:8000/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setSuccessMessage("Réservation annulée avec succès. Les sièges ont été libérés.");
        
        // Dynamic stats update to avoid full loading screens
        const cancelledRes = reservations.find(r => r.id === reservationId);
        if (cancelledRes) {
          setStats(prev => ({
            ...prev,
            active_reservations: Math.max(0, prev.active_reservations - 1),
            total_spent: Math.max(0, prev.total_spent - parseFloat(cancelledRes.total_price))
          }));
        }

        // Update local reservations state
        setReservations(prev =>
          prev.map(r => r.id === reservationId ? { ...r, status: 'cancelled' } : r)
        );

        // Hide success message after 4s
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'annulation.");
      setTimeout(() => setError(''), 4000);
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Erreur de déconnexion backend:", err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div style={styles.container} className="animated">
      {/* Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo} onClick={() => navigate('/dashboard')}>
            <span style={{ color: 'var(--primary-color)' }}>Fly</span>High
          </h1>
          <div style={styles.navLinks}>
            <Link to="/dashboard" style={styles.navLinkActive}>Tableau de bord</Link>
            <Link to="/flights" style={styles.navLink}>Rechercher un Vol</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard body */}
      <main style={styles.main}>
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>Bonjour, {user?.name || 'Voyageur'}</h2>
            <p style={styles.welcomeSubtitle}>Gérez vos vols et visualisez vos statistiques de voyage en temps réel.</p>
          </div>
          <button onClick={() => navigate('/flights')} style={styles.newBookingBtn} className="glow-btn">
            ✈ Réserver un vol
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div style={styles.successToast}>
            <div style={styles.successIcon}>✓</div>
            <div>{successMessage}</div>
          </div>
        )}

        {error && (
          <div style={styles.errorToast}>
            <div style={styles.errorIcon}>⚠</div>
            <div>{error}</div>
          </div>
        )}

        {/* Stats Grid */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconContainer, color: 'var(--primary-color)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              📋
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Total Réservations</span>
              <h3 style={styles.statValue}>
                {statsLoading ? '...' : stats.total_reservations}
              </h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconContainer, color: 'var(--success-color)', backgroundColor: 'var(--success-bg)' }}>
              ✓
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Réservations Actives</span>
              <h3 style={styles.statValue}>
                {statsLoading ? '...' : stats.active_reservations}
              </h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconContainer, color: 'var(--warning-color)', backgroundColor: 'var(--warning-bg)' }}>
              💳
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Total Dépensé</span>
              <h3 style={styles.statValue}>
                {statsLoading ? '...' : `${stats.total_spent.toFixed(2)} €`}
              </h3>
            </div>
          </div>
        </section>

        {/* Reservations Section */}
        <section style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>Mes Réservations</h3>
          
          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <ReservationList
              reservations={reservations}
              onCancel={handleCancelReservation}
              cancellingId={cancellingId}
            />
          )}
        </section>
      </main>
      <Chatbot />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '15px 30px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(8px)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
    transition: 'color var(--transition-fast)',
  },
  navLinkActive: {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'var(--danger-color)',
    border: '1px solid var(--danger-border)',
    padding: '6px 14px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '30px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '15px',
    }
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  newBookingBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  successToast: {
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    color: 'var(--success-color)',
    padding: '16px 20px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '15px',
    fontWeight: '600',
  },
  successIcon: {
    backgroundColor: 'var(--success-color)',
    color: 'var(--bg-primary)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  errorToast: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-color)',
    padding: '16px 20px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '15px',
    fontWeight: '600',
  },
  errorIcon: {
    backgroundColor: 'var(--danger-color)',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: 'var(--border-hover)',
      boxShadow: 'var(--shadow-md)',
    }
  },
  statIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '50px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

export default UserDashboard;

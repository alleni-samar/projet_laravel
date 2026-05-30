import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function FlightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [seatsCount, setSeatsCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchFlightDetails = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/flights/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.status === 'success') {
          setFlight(response.data.flight);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des détails du vol.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost:8000/api/reservations', {
        flight_id: flight.id,
        seats_count: seatsCount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setSuccessMessage('Réservation confirmée ! Redirection vers votre tableau de bord...');
        // Refresh local seats display
        setFlight(prev => ({
          ...prev,
          available_seats: prev.available_seats - seatsCount
        }));
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const incrementSeats = () => {
    if (seatsCount < flight.available_seats) {
      setSeatsCount(seatsCount + 1);
    }
  };

  const decrementSeats = () => {
    if (seatsCount > 1) {
      setSeatsCount(seatsCount - 1);
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const d = new Date(dateTimeString);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h3 style={{ color: 'var(--danger-color)' }}>Erreur</h3>
          <p style={{ margin: '15px 0', color: 'var(--text-secondary)' }}>{error}</p>
          <Link to="/flights" style={styles.backBtn}>Retour aux vols</Link>
        </div>
      </div>
    );
  }

  const totalPrice = (flight.price * seatsCount).toFixed(2);

  return (
    <div style={styles.container} className="animated">
      {/* Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo} onClick={() => navigate('/dashboard')}>
            <span style={{ color: 'var(--primary-color)' }}>Fly</span>High
          </h1>
          <div style={styles.navLinks}>
            <Link to="/dashboard" style={styles.navLink}>Tableau de bord</Link>
            <Link to="/flights" style={styles.navLinkActive}>Rechercher un Vol</Link>
            <button 
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }} 
              style={styles.logoutBtn}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <Link to="/flights" style={styles.backLink}>← Retour aux vols</Link>

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

        <div style={styles.layoutGrid}>
          {/* Flight Info Detail */}
          <div style={styles.infoCol}>
            <div style={styles.flightDetailCard}>
              <div style={styles.detailHeader}>
                <div>
                  <span style={styles.flightBadge}>{flight.flight_number}</span>
                  <h2 style={styles.routeTitle}>
                    {flight.departure_city} → {flight.arrival_city}
                  </h2>
                </div>
                <div style={styles.durationBadge}>
                  {getDuration(flight.departure_time, flight.arrival_time)} (Direct)
                </div>
              </div>

              <div style={styles.detailTimeline}>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineIndicator}>
                    <div style={styles.timelineDotActive}></div>
                    <div style={styles.timelineLine}></div>
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timelineTime}>{formatTime(flight.departure_time)}</span>
                    <h4 style={styles.timelineCity}>{flight.departure_city}</h4>
                    <p style={styles.timelineDate}>{formatDate(flight.departure_time)}</p>
                  </div>
                </div>

                <div style={styles.timelineItem}>
                  <div style={styles.timelineIndicator}>
                    <div style={styles.timelineDotActive}></div>
                  </div>
                  <div style={styles.timelineContent}>
                    <span style={styles.timelineTime}>{formatTime(flight.arrival_time)}</span>
                    <h4 style={styles.timelineCity}>{flight.arrival_city}</h4>
                    <p style={styles.timelineDate}>{formatDate(flight.arrival_time)}</p>
                  </div>
                </div>
              </div>

              <div style={styles.servicesGrid}>
                <div style={styles.serviceItem}>
                  <span style={styles.serviceIcon}>💼</span>
                  <div>
                    <h5 style={styles.serviceTitle}>Bagage à main inclus</h5>
                    <p style={styles.serviceDesc}>Jusqu'à 10kg en cabine</p>
                  </div>
                </div>
                <div style={styles.serviceItem}>
                  <span style={styles.serviceIcon}>🔌</span>
                  <div>
                    <h5 style={styles.serviceTitle}>Prise USB & Wifi</h5>
                    <p style={styles.serviceDesc}>Disponible à bord</p>
                  </div>
                </div>
                <div style={styles.serviceItem}>
                  <span style={styles.serviceIcon}>🥤</span>
                  <div>
                    <h5 style={styles.serviceTitle}>Restauration incluse</h5>
                    <p style={styles.serviceDesc}>Boisson et collation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking / Payment Card */}
          <div style={styles.bookingCol}>
            <div style={styles.bookingCard}>
              <h3 style={styles.bookingCardTitle}>Réservation</h3>
              
              <div style={styles.priceRow}>
                <span style={{ color: 'var(--text-secondary)' }}>Prix par siège :</span>
                <span style={styles.priceValue}>{flight.price} €</span>
              </div>

              {flight.available_seats === 0 ? (
                <div style={styles.soldOutBox}>
                  <h4 style={{ color: 'var(--danger-color)', margin: 0 }}>Vol Complet</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>
                    Il n'y a plus de places disponibles pour ce vol.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} style={styles.bookingForm}>
                  <div style={styles.seatsSelection}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                      Nombre de sièges
                    </span>
                    <div style={styles.stepperContainer}>
                      <button 
                        type="button" 
                        onClick={decrementSeats} 
                        style={styles.stepBtn}
                        disabled={seatsCount <= 1}
                      >
                        -
                      </button>
                      <span style={styles.stepperValue}>{seatsCount}</span>
                      <button 
                        type="button" 
                        onClick={incrementSeats} 
                        style={styles.stepBtn}
                        disabled={seatsCount >= flight.available_seats}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={styles.divider}></div>

                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total à payer :</span>
                    <span style={styles.totalValue}>{totalPrice} €</span>
                  </div>

                  <div style={styles.availabilityNotice}>
                    <span style={{ color: 'var(--success-color)' }}>●</span> {flight.available_seats} sièges restants
                  </div>

                  <button 
                    type="submit" 
                    style={styles.confirmBtn} 
                    className="glow-btn"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Création de la réservation...' : 'Confirmer la réservation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
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
    gap: '20px',
  },
  backLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    alignSelf: 'flex-start',
    transition: 'color var(--transition-fast)',
    '&:hover': {
      color: 'var(--text-primary)'
    }
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
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '7fr 5fr',
    gap: '30px',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  flightDetailCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '30px',
    boxShadow: 'var(--shadow-md)',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
    marginBottom: '25px',
  },
  flightBadge: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--primary-color)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '14px',
    letterSpacing: '0.5px',
    display: 'inline-block',
    marginBottom: '10px',
  },
  routeTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  durationBadge: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '4px 12px',
    fontWeight: '600',
  },
  detailTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '30px',
  },
  timelineItem: {
    display: 'flex',
    gap: '20px',
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
  },
  timelineDotActive: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    border: '3px solid var(--bg-secondary)',
    boxShadow: '0 0 8px var(--primary-color)',
    zIndex: 2,
    marginTop: '6px',
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: 'var(--border-color)',
    margin: '4px 0',
  },
  timelineContent: {
    paddingBottom: '25px',
  },
  timelineTime: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  timelineCity: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '2px 0 4px 0',
  },
  timelineDate: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '25px',
  },
  serviceItem: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: '24px',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
  },
  serviceTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  serviceDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  bookingCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  bookingCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '30px',
    boxShadow: 'var(--shadow-md)',
  },
  bookingCardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '15px',
  },
  priceValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  soldOutBox: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '20px',
    textAlign: 'center',
  },
  bookingForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  seatsSelection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '4px',
  },
  stepBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    }
  },
  stepperValue: {
    width: '40px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  totalValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--primary-color)',
  },
  availabilityNotice: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'inline-block',
    alignSelf: 'flex-start',
  },
  confirmBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--primary-hover)',
    }
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  errorCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '40px',
    width: '400px',
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-block',
    fontWeight: '600',
  }
};

export default FlightDetail;

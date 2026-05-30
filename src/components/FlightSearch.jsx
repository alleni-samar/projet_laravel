import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function FlightSearch() {
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFlights = async (searchParams = {}) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get('http://localhost:8000/api/flights', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: searchParams
      });

      if (response.data.status === 'success') {
        setFlights(response.data.flights);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des vols.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all flights on mount
  useEffect(() => {
    fetchFlights();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (departureCity) params.departure_city = departureCity;
    if (arrivalCity) params.arrival_city = arrivalCity;
    if (date) params.date = date;
    fetchFlights(params);
  };

  const handleReset = () => {
    setDepartureCity('');
    setArrivalCity('');
    setDate('');
    fetchFlights();
  };

  const formatTime = (dateTimeString) => {
    const d = new Date(dateTimeString);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeString) => {
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
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
        {/* Search Panel Card */}
        <section style={styles.searchCard}>
          <h2 style={styles.sectionTitle}>Rechercher un vol disponible</h2>
          <form onSubmit={handleSearch} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ville de départ</label>
                <input
                  type="text"
                  placeholder="Ex: Paris"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ville d'arrivée</label>
                <input
                  type="text"
                  placeholder="Ex: New York"
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date de départ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.searchBtn} className="glow-btn">Rechercher</button>
              <button type="button" onClick={handleReset} style={styles.resetBtn}>Réinitialiser</button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section style={styles.resultsSection}>
          <h3 style={styles.resultsTitle}>
            {loading ? 'Recherche en cours...' : `${flights.length} Vol(s) disponible(s)`}
          </h3>

          {error && <div style={styles.error}>{error}</div>}

          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : flights.length === 0 ? (
            <div style={styles.noResults}>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Aucun vol ne correspond à votre recherche.</p>
              <button onClick={handleReset} style={styles.resetBtnSmall}>Afficher tous les vols</button>
            </div>
          ) : (
            <div style={styles.flightsGrid}>
              {flights.map((flight) => (
                <div key={flight.id} style={styles.flightCard} className="animated">
                  <div style={styles.cardHeader}>
                    <span style={styles.flightNumber}>{flight.flight_number}</span>
                    <span style={styles.priceTag}>{flight.price} €</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.routeContainer}>
                      <div style={styles.routeNode}>
                        <h4 style={styles.cityText}>{flight.departure_city}</h4>
                        <p style={styles.timeText}>{formatTime(flight.departure_time)}</p>
                        <p style={styles.dateText}>{formatDate(flight.departure_time)}</p>
                      </div>

                      <div style={styles.routeLineContainer}>
                        <span style={styles.durationText}>{getDuration(flight.departure_time, flight.arrival_time)}</span>
                        <div style={styles.routeLine}>
                          <div style={styles.routeLineDot}></div>
                          <div style={styles.routeLinePlane}>✈</div>
                          <div style={styles.routeLineDot}></div>
                        </div>
                        <span style={styles.directBadge}>Direct</span>
                      </div>

                      <div style={{ ...styles.routeNode, textAlign: 'right' }}>
                        <h4 style={styles.cityText}>{flight.arrival_city}</h4>
                        <p style={styles.timeText}>{formatTime(flight.arrival_time)}</p>
                        <p style={styles.dateText}>{formatDate(flight.arrival_time)}</p>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.seatsLeft}>
                      <span style={
                        flight.available_seats > 50 ? styles.seatsHigh : 
                        flight.available_seats > 10 ? styles.seatsMedium : 
                        styles.seatsLow
                      }>
                        ●
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {flight.available_seats} sièges restants
                      </span>
                    </div>

                    <button 
                      onClick={() => navigate(`/flights/${flight.id}`)}
                      style={styles.bookBtn}
                      disabled={flight.available_seats === 0}
                    >
                      {flight.available_seats === 0 ? 'Complet' : 'Réserver'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
    gap: '30px',
  },
  searchCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    padding: '25px',
    boxShadow: 'var(--shadow-md)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)',
    padding: '12px 16px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
  },
  searchBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  resetBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  resultsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
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
  },
  error: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-color)',
    padding: '15px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '14px',
  },
  noResults: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '50px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  resetBtnSmall: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '10px 20px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
  },
  flightsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  flightCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      borderColor: 'var(--border-hover)',
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightNumber: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--primary-color)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
  priceTag: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  cardBody: {
    padding: '10px 0',
  },
  routeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  routeNode: {
    display: 'flex',
    flexDirection: 'column',
    width: '180px',
  },
  cityText: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  timeText: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '4px 0',
  },
  dateText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  routeLineContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  },
  durationText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  routeLine: {
    width: '100%',
    maxWidth: '220px',
    height: '2px',
    backgroundColor: 'var(--border-color)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--text-muted)',
  },
  routeLinePlane: {
    color: 'var(--primary-color)',
    fontSize: '14px',
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: '50%',
  },
  directBadge: {
    fontSize: '11px',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success-color)',
    border: '1px solid var(--success-border)',
    borderRadius: '12px',
    padding: '2px 8px',
    fontWeight: '600',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '15px',
  },
  seatsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  seatsHigh: { color: 'var(--success-color)', fontSize: '18px' },
  seatsMedium: { color: 'var(--warning-color)', fontSize: '18px' },
  seatsLow: { color: 'var(--danger-color)', fontSize: '18px' },
  bookBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--primary-hover)',
    }
  }
};

export default FlightSearch;

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import FlightForm from './FlightForm';

// Register Chart.js components
Chart.register(...registerables);

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_flights: 0,
    total_reservations: 0,
    total_seats_reserved: 0,
    monthly: { labels: [], reservations: [], seats_reserved: [] },
    top_flights: []
  });
  const [flights, setFlights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  
  // Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Refs for Charts
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch all administration data
  const fetchAdminData = async () => {
    setStatsLoading(true);
    setError('');

    try {
      // 1. Fetch Stats
      const statsRes = await axios.get('http://localhost:8000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Erreur de récupération des stats admin:", err);
      setError("Impossible de charger les statistiques.");
    } finally {
      setStatsLoading(false);
    }

    try {
      // 2. Fetch All Flights for management (via public/auth flight index)
      setLoading(true);
      const flightsRes = await axios.get('http://localhost:8000/api/flights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (flightsRes.data.status === 'success') {
        setFlights(flightsRes.data.flights);
      }
    } catch (err) {
      console.error("Erreur de récupération des vols:", err);
      setError(prev => prev ? prev + " | Impossible de charger les vols." : "Impossible de charger la liste des vols.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if user is actually admin
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'admin') {
      localStorage.clear();
      navigate('/login');
      return;
    }

    fetchAdminData();
  }, [token]);

  // Effect to initialize/update Chart 1 (Monthly Stats)
  useEffect(() => {
    if (statsLoading || !stats.monthly || !stats.monthly.labels.length) return;

    // Destroy existing chart to prevent canvas reuse errors
    if (chartInstance1.current) {
      chartInstance1.current.destroy();
    }

    const ctx = chartRef1.current.getContext('2d');
    
    // Create gradients for dark premium styling
    const resGradient = ctx.createLinearGradient(0, 0, 0, 300);
    resGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    resGradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    chartInstance1.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.monthly.labels,
        datasets: [
          {
            label: 'Réservations',
            data: stats.monthly.reservations,
            borderColor: '#3b82f6',
            backgroundColor: resGradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            yAxisID: 'y',
          },
          {
            label: 'Sièges Réservés',
            type: 'bar',
            data: stats.monthly.seats_reserved,
            backgroundColor: 'rgba(168, 85, 247, 0.65)',
            borderColor: '#a855f7',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 12, weight: '500' }
            }
          },
          tooltip: {
            padding: 12,
            backgroundColor: '#1b2347',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#3b82f6', font: { family: 'Outfit' } },
            title: { display: true, text: 'Réservations', color: '#3b82f6' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#a855f7', font: { family: 'Outfit' } },
            title: { display: true, text: 'Sièges Réservés', color: '#a855f7' }
          }
        }
      }
    });

    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
    };
  }, [stats.monthly, statsLoading]);

  // Effect to initialize/update Chart 2 (Top 5 Flights)
  useEffect(() => {
    if (statsLoading || !stats.top_flights || !stats.top_flights.length) return;

    if (chartInstance2.current) {
      chartInstance2.current.destroy();
    }

    const ctx = chartRef2.current.getContext('2d');

    chartInstance2.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.top_flights.map(f => `${f.flight_number} (${f.departure_city.substring(0,3)}-${f.arrival_city.substring(0,3)})`),
        datasets: [{
          label: 'Sièges Réservés',
          data: stats.top_flights.map(f => f.seats_reserved),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 12,
            backgroundColor: '#1b2347',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Outfit', weight: '600' } }
          }
        }
      }
    });

    return () => {
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, [stats.top_flights, statsLoading]);

  // Handle Form submit (Create or Update flight)
  const handleFormSubmit = async (payload) => {
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingFlight) {
        // Edit Mode
        const res = await axios.put(`http://localhost:8000/api/admin/flights/${editingFlight.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          setSuccess(`Le vol ${payload.flight_number} a été mis à jour.`);
          setShowForm(false);
          setEditingFlight(null);
          fetchAdminData(); // Refresh list and stats
        }
      } else {
        // Create Mode
        const res = await axios.post('http://localhost:8000/api/admin/flights', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          setSuccess(`Le vol ${payload.flight_number} a été créé avec succès.`);
          setShowForm(false);
          fetchAdminData(); // Refresh list and stats
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement du vol.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete flight
  const handleDeleteFlight = async (flightId, flightNumber) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le vol ${flightNumber} ? Toutes les réservations associées seront également supprimées.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await axios.delete(`http://localhost:8000/api/admin/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setSuccess(`Le vol ${flightNumber} a été supprimé.`);
        // Instantly update flights list state to keep UI fast
        setFlights(prev => prev.filter(f => f.id !== flightId));
        // Refetch stats since reservations/vols counts changed
        const statsRes = await axios.get('http://localhost:8000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.data.status === 'success') {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression du vol.");
    }
  };

  const handleEditClick = (flight) => {
    setEditingFlight(flight);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingFlight(null);
    setShowForm(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  // Helper date formatters
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' à ' + 
           d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter flights locally
  const filteredFlights = flights.filter(f => 
    f.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.arrival_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container} className="animated">
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>
            <span style={{ color: 'var(--accent-color)' }}>Fly</span>High <span style={styles.adminBadge}>ADMIN</span>
          </h1>
          <div style={styles.navLinks}>
            <span style={styles.adminLabel}>Panel Administration</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Welcome Row */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>Tableau de bord de Gestion</h2>
            <p style={styles.welcomeSubtitle}>Pilotez les vols, gérez les réservations et suivez le taux de remplissage.</p>
          </div>
          <button onClick={handleCreateClick} style={styles.createBtn} className="glow-btn">
            ✨ Ajouter un Vol
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div style={styles.successToast}>
            <div style={styles.successIcon}>✓</div>
            <div>{success}</div>
          </div>
        )}

        {error && (
          <div style={styles.errorToast}>
            <div style={styles.errorIcon}>⚠</div>
            <div>{error}</div>
          </div>
        )}

        {/* KPI Grid */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconContainer, color: 'var(--accent-color)', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              🎫
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Sièges Réservés</span>
              <h3 style={styles.statValue}>
                {statsLoading ? '...' : stats.total_seats_reserved}
              </h3>
            </div>
          </div>

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
              ✈
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Vols Actifs</span>
              <h3 style={styles.statValue}>
                {statsLoading ? '...' : stats.total_flights}
              </h3>
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <section style={styles.chartsGrid}>
          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}>Évolution Mensuelle des Réservations</h4>
            <div style={styles.chartWrapper}>
              {statsLoading ? (
                <div style={styles.chartLoader}>Chargement du graphique...</div>
              ) : (
                <canvas ref={chartRef1} />
              )}
            </div>
          </div>

          <div style={styles.chartCard}>
            <h4 style={styles.chartTitle}>Top 5 des Vols les plus Vendus</h4>
            <div style={styles.chartWrapper}>
              {statsLoading ? (
                <div style={styles.chartLoader}>Chargement du graphique...</div>
              ) : stats.top_flights.length === 0 ? (
                <div style={styles.chartLoader}>Aucune vente enregistrée.</div>
              ) : (
                <canvas ref={chartRef2} />
              )}
            </div>
          </div>
        </section>

        {/* Form Modal Overlay */}
        {showForm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <FlightForm
                flight={editingFlight}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingFlight(null);
                }}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* CRUD Flights Table List */}
        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Liste de Gestion des Vols</h3>
            <input
              type="text"
              placeholder="Rechercher par numéro, départ, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchBar}
            />
          </div>

          {loading ? (
            <div style={styles.tableLoader}>
              <div style={styles.spinner}></div>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div style={styles.emptyTable}>
              <p>Aucun vol trouvé.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Numéro</th>
                    <th style={styles.th}>Itinéraire</th>
                    <th style={styles.th}>Départ</th>
                    <th style={styles.th}>Arrivée</th>
                    <th style={styles.th}>Tarif</th>
                    <th style={styles.th}>Remplissage</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((flight) => {
                    const occupancyRate = ((flight.total_seats - flight.available_seats) / flight.total_seats) * 100;
                    return (
                      <tr key={flight.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.tableFlightNum}>{flight.flight_number}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tableRoute}>
                            <strong>{flight.departure_city}</strong>
                            <span style={{ color: 'var(--accent-color)' }}>➔</span>
                            <strong>{flight.arrival_city}</strong>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {formatDate(flight.departure_time)}
                        </td>
                        <td style={{ ...styles.td, fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {formatDate(flight.arrival_time)}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '700', color: 'var(--text-primary)' }}>
                          {flight.price} €
                        </td>
                        <td style={styles.td}>
                          <div style={styles.occupancyWrapper}>
                            <div style={styles.occupancyBarContainer}>
                              <div style={{
                                ...styles.occupancyBarFill,
                                width: `${occupancyRate}%`,
                                backgroundColor: occupancyRate > 85 ? 'var(--danger-color)' : occupancyRate > 50 ? 'var(--warning-color)' : 'var(--success-color)'
                              }}></div>
                            </div>
                            <span style={styles.occupancyText}>
                              {flight.total_seats - flight.available_seats} / {flight.total_seats} places
                            </span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionGroup}>
                            <button
                              onClick={() => handleEditClick(flight)}
                              style={styles.editBtn}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteFlight(flight.id, flight.flight_number)}
                              style={styles.deleteBtn}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
  },
  adminBadge: {
    backgroundColor: 'var(--accent-color)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '5px',
    verticalAlign: 'middle',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  adminLabel: {
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '14px',
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
  createBtn: {
    backgroundColor: 'var(--accent-color)',
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '7fr 5fr',
    gap: '30px',
    '@media (max-width: 950px)': {
      gridTemplateColumns: '1fr',
    }
  },
  chartCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  chartWrapper: {
    position: 'relative',
    height: '300px',
    width: '100%',
  },
  chartLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 20, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 'var(--border-radius-md)',
  },
  tableCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  searchBar: {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    width: '320px',
    '@media (max-width: 600px)': {
      width: '100%',
    }
  },
  tableLoader: {
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
  emptyTable: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    borderBottom: '1px solid var(--border-color)',
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
    }
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  tableFlightNum: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--accent-color)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '13px',
  },
  tableRoute: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
  },
  occupancyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '150px',
  },
  occupancyBarContainer: {
    height: '6px',
    width: '100%',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  occupancyText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  actionGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  editBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: 'var(--primary-color)',
    }
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: 'var(--danger-color)',
    }
  }
};

export default AdminDashboard;

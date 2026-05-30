import React from 'react';

function ReservationList({ reservations, onCancel, cancellingId }) {
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const d = new Date(dateTimeString);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  if (!reservations || reservations.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>✈</span>
        <h3 style={styles.emptyTitle}>Aucune réservation</h3>
        <p style={styles.emptyText}>Vous n'avez pas encore effectué de réservation de vol.</p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      {reservations.map((res) => {
        const flight = res.flight;
        if (!flight) return null;

        const isCancelled = res.status === 'cancelled';

        return (
          <div key={res.id} style={styles.card} className="animated">
            <div style={styles.cardHeader}>
              <div style={styles.headerLeft}>
                <span style={styles.flightNumber}>{flight.flight_number}</span>
                <span style={styles.resNumber}>Réf : {res.reservation_number}</span>
              </div>
              <span style={isCancelled ? styles.statusCancelled : styles.statusConfirmed}>
                {isCancelled ? 'Annulée' : 'Confirmée'}
              </span>
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
              <div style={styles.detailsInfo}>
                <div style={styles.infoBlock}>
                  <span style={styles.infoLabel}>Nombre de sièges</span>
                  <span style={styles.infoValue}>{res.seats_count} {res.seats_count > 1 ? 'places' : 'place'}</span>
                </div>
                <div style={styles.infoBlock}>
                  <span style={styles.infoLabel}>Prix total</span>
                  <span style={styles.totalPrice}>{res.total_price} €</span>
                </div>
              </div>

              {!isCancelled && (
                <button
                  onClick={() => onCancel(res.id)}
                  style={styles.cancelBtn}
                  disabled={cancellingId === res.id}
                >
                  {cancellingId === res.id ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'all var(--transition-fast)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  resNumber: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
  },
  statusConfirmed: {
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success-color)',
    border: '1px solid var(--success-border)',
    borderRadius: '12px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  statusCancelled: {
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger-color)',
    border: '1px solid var(--danger-border)',
    borderRadius: '12px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: '600',
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
    fontSize: '22px',
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
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'flex-start',
    }
  },
  detailsInfo: {
    display: 'flex',
    gap: '24px',
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  totalPrice: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--primary-color)',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: 'var(--danger-color)',
    border: '1px solid var(--danger-border)',
    padding: '8px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--danger-bg)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  },
  emptyContainer: {
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
  emptyIcon: {
    fontSize: '40px',
    color: 'var(--text-muted)',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  emptyText: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
  }
};

export default ReservationList;

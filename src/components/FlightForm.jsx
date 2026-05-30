import React, { useState, useEffect } from 'react';

function FlightForm({ flight, onSubmit, onCancel, loading }) {
  const [flightNumber, setFlightNumber] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [validationError, setValidationError] = useState('');

  // Helper to format ISO datetime to YYYY-MM-DDTHH:MM for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (flight) {
      setFlightNumber(flight.flight_number || '');
      setDepartureCity(flight.departure_city || '');
      setArrivalCity(flight.arrival_city || '');
      setDepartureTime(formatDateForInput(flight.departure_time) || '');
      setArrivalTime(formatDateForInput(flight.arrival_time) || '');
      setPrice(flight.price || '');
      setTotalSeats(flight.total_seats || '');
    } else {
      // Clear fields for new flight creation
      setFlightNumber('');
      setDepartureCity('');
      setArrivalCity('');
      setDepartureTime('');
      setArrivalTime('');
      setPrice('');
      setTotalSeats('');
    }
    setValidationError('');
  }, [flight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validations
    if (!flightNumber.trim()) return setValidationError("Le numéro de vol est requis.");
    if (!departureCity.trim()) return setValidationError("La ville de départ est requise.");
    if (!arrivalCity.trim()) return setValidationError("La ville d'arrivée est requise.");
    if (!departureTime) return setValidationError("L'heure de départ est requise.");
    if (!arrivalTime) return setValidationError("L'heure d'arrivée est requise.");
    if (!price || parseFloat(price) < 0) return setValidationError("Le prix doit être un nombre positif.");
    if (!totalSeats || parseInt(totalSeats) <= 0) return setValidationError("Le nombre de sièges doit être supérieur à 0.");

    const depDate = new Date(departureTime);
    const arrDate = new Date(arrivalTime);

    if (arrDate <= depDate) {
      return setValidationError("L'heure d'arrivée doit être postérieure à l'heure de départ.");
    }

    if (!flight) {
      // Only for new flights: check departure is not before today (allowing departures today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const depDateOnly = new Date(departureTime);
      depDateOnly.setHours(0, 0, 0, 0);
      
      if (depDateOnly < today) {
        return setValidationError("L'heure de départ ne peut pas être dans le passé.");
      }
    }

    const payload = {
      flight_number: flightNumber.trim().toUpperCase(),
      departure_city: departureCity.trim(),
      arrival_city: arrivalCity.trim(),
      departure_time: departureTime,
      arrival_time: arrivalTime,
      price: parseFloat(price),
      total_seats: parseInt(totalSeats)
    };

    onSubmit(payload);
  };

  return (
    <div style={styles.formContainer} className="animated">
      <h3 style={styles.formTitle}>
        {flight ? '📝 Modifier le Vol' : '✨ Ajouter un Nouveau Vol'}
      </h3>

      {validationError && (
        <div style={styles.errorAlert}>
          <span>⚠</span> {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Numéro de vol</label>
            <input
              type="text"
              placeholder="Ex: AF104"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Prix (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 149.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ville de départ</label>
            <input
              type="text"
              placeholder="Ex: Paris"
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ville d'arrivée</label>
            <input
              type="text"
              placeholder="Ex: Nice"
              value={arrivalCity}
              onChange={(e) => setArrivalCity(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date & Heure de départ</label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date & Heure d'arrivée</label>
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Nombre Total de Sièges</label>
            <input
              type="number"
              placeholder="Ex: 120"
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              required
              style={styles.input}
            />
            {flight && (
              <small style={styles.helperText}>
                Note : Modifier le nombre de sièges mettra automatiquement à jour les places disponibles en déduisant les réservations déjà confirmées.
              </small>
            )}
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelBtn}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            style={styles.submitBtn}
            className="glow-btn"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : flight ? 'Mettre à jour' : 'Ajouter le vol'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  formContainer: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '28px',
    boxShadow: 'var(--shadow-lg)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  errorAlert: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-color)',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    }
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
    width: '100%',
    '&:focus': {
      borderColor: 'var(--primary-color)',
    }
  },
  helperText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '10px',
  },
  submitBtn: {
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
  cancelBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
    }
  }
};

export default FlightForm;

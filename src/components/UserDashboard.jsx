import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [message, setMessage] = useState('Chargement...');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    axios.get('http://localhost:8000/api/user/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      setMessage(response.data.message);
    })
    .catch(err => {
      console.error(err);
      setMessage("Erreur d'accès au tableau de bord.");
    });
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Tableau de bord Utilisateur</h2>
        <p style={styles.welcome}>Bienvenue, {user?.name || 'Utilisateur'} !</p>
        <div style={styles.statusBox}>
          <p><strong>Statut du backend :</strong> {message}</p>
        </div>
        <button onClick={handleLogout} style={styles.button}>Se déconnecter</button>
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
    backgroundColor: '#eff6ff',
  },
  card: {
    width: '500px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
  },
  title: {
    color: '#1e3a8a',
    marginBottom: '10px',
  },
  welcome: {
    fontSize: '18px',
    color: '#4b5563',
    marginBottom: '20px',
  },
  statusBox: {
    padding: '15px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginBottom: '25px',
    fontSize: '15px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};

export default UserDashboard;

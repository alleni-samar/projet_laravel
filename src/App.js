import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import FlightSearch from './components/FlightSearch';
import FlightDetail from './components/FlightDetail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes privées protégées par rôle (user) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <UserDashboard />
            </PrivateRoute>
          } 
          
        />
        <Route 
          path="/flights" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <FlightSearch />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/flights/:id" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <FlightDetail />
            </PrivateRoute>
          } 
        />

        {/* Routes privées protégées par rôle (admin) */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Redirection automatique par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

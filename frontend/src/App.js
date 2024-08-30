import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Accueil from './Acceuil';
import Profil from './Profil';
import Login from './Login';
import Inscription from './Inscription';
import Connexion from './Connexion';
import EditProfil from './EditProfil';
import Covoiturage from './Covoiturage';
import Logout from './Logout';
import MesCovoiturages from './MesCovoiturages';
import Admin from './Admin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './RoutrProtegees'; // Assurez-vous d'importer le composant

function App() {
  return (
    <Router>
      <div style={{ paddingBottom: '60px', minHeight: '100vh', backgroundColor: '#f0f0f5' }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/editProfil" element={<ProtectedRoute><EditProfil /></ProtectedRoute>} />
          <Route path="/covoiturage" element={<ProtectedRoute><Covoiturage /></ProtectedRoute>} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/mescovoit" element={<ProtectedRoute><MesCovoiturages /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <footer style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backgroundColor: '#343a40',
          color: 'white',
          textAlign: 'center',
          padding: '10px 0',
          boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000 // Ensures the footer is in the foreground
        }}>
          <nav>
            <ul style={{
              display: 'flex',
              justifyContent: 'space-around',
              listStyleType: 'none',
              margin: 0,
              padding: 0
            }}>
              <li><Link to='/login' style={{ color: 'white', textDecoration: 'none' }}>Se connecter</Link></li>
              <li><Link to="/profil" style={{ color: 'white', textDecoration: 'none' }}>Profil</Link></li>
              <li><Link to="/logout" style={{ color: 'white', textDecoration: 'none' }}>Se déconnecter</Link></li>
              <li><Link to="/covoiturage" style={{ color: 'white', textDecoration: 'none' }}>Covoiturage</Link></li>
              <li><Link to="/mescovoit" style={{ color: 'white', textDecoration: 'none' }}>Mes covoiturages</Link></li>
            </ul>
          </nav>
        </footer>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;

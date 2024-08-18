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
      <div style={{ paddingBottom: '50px' }}>
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
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}/>
        </Routes>

        <footer style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#f8f9fa' }}>
          <nav>
            <ul style={{ display: 'flex', justifyContent: 'space-around', listStyleType: 'none', padding: 0 }}>
              <li><Link to='/login'>Se Connecter</Link></li>
              <li><Link to="/profil">Profil</Link></li>
              <li><Link to="/logout">Se Déconnecter</Link></li>
              <li><Link to="/covoiturage">Covoiturage</Link></li>
              <li><Link to="/mescovoit">Mes Covoiturages</Link></li>
            </ul>
          </nav>
        </footer>
        <ToastContainer />

      </div>
    </Router>
  );
}

export default App;

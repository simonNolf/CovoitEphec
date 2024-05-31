import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Accueil from './Acceuil';
import Profil from './Profil';
import Login from './Login';
import Inscription from './Inscription';
import Connexion from './Connexion';
import EditProfil from './EditProfil';
import Covoiturage from './Covoiturage';
import Logout from './Logout'; // Importez le composant Logout
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <div style={{ paddingBottom: '50px' }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/editProfil" element={<EditProfil />} />
          <Route path="/covoiturage" element={<Covoiturage />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>

        <footer style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#f8f9fa' }}>
          <nav>
            <ul style={{ display: 'flex', justifyContent: 'space-around', listStyleType: 'none', padding: 0 }}>
              <li>
                <Link to="/profil">Profil</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/covoiturage">Covoiturage</Link>
              </li>
              <li>
                <Link to="/logout">Déconnexion</Link>
              </li>
            </ul>
          </nav>
          <ToastContainer />
        </footer>
      </div>
    </Router>
  );
}

export default App;

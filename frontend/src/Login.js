import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fonction pour récupérer les données CSV
const fetchCSVData = async (csvUrl) => {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.text();
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier CSV :', error);
    throw error;
  }
};

// Fonction pour vérifier la présence du matricule dans le CSV
const checkMatriculeInCSV = (matriculeToCheck, csvData) => {
  const rows = csvData.split('\n').map(row => row.split(';'));
  for (let i = 1; i < rows.length; i++) {
    const matriculeFromCSV = rows[i][0].trim();
    if (matriculeFromCSV === matriculeToCheck.trim()) {
      return true;
    }
  }
  return false;
};

// Fonction pour vérifier la présence du matricule dans la base de données
const checkMatriculeInDB = async (matriculeToCheck, apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/users/${matriculeToCheck}`);
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la vérification du matricule dans la base de données :', error);
    return false;
  }
};

const LoginComponent = () => {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      toast.info('Vous êtes déjà connecté');
      navigate('/Profil');
    } else {
      const storedMatricule = sessionStorage.getItem('matricule');
      if (storedMatricule) {
        setMatricule(storedMatricule);
      } else {
        const searchParams = new URLSearchParams(location.search);
        const matriculeFromQuery = searchParams.get('matricule');
        setMatricule(matriculeFromQuery || '');
      }
    }

    if (location.state?.showToast) {
      toast.error('Merci de vous connecter pour accéder à cette page');
    }
  }, [location.search, navigate, location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const csvData = await fetchCSVData('data.csv');
      const matriculeExistsInCSV = checkMatriculeInCSV(matricule, csvData);
      const matriculeExistsInDB = await checkMatriculeInDB(matricule, apiUrl);

      if (matriculeExistsInCSV && matriculeExistsInDB) {
        sessionStorage.setItem('matricule', matricule);
        navigate('/connexion');
      } else if (matriculeExistsInCSV) {
        sessionStorage.setItem('matricule', matricule);
        navigate('/inscription');
      } else {
        toast.error(`Le matricule : ${matricule} n'existe pas`);
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du matricule. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
    textAlign: 'center',
  };

  const inputStyle = {
    fontSize: '1.5rem',
    padding: '15px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    fontSize: '1.5rem',
    padding: '15px',
    width: '100%',
    maxWidth: '400px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: '#fff',
  };

  return (
    <>
      <ToastContainer />
      {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Vérification en cours...</div>}
      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          id="matricule"
          required
          value={matricule}
          maxLength={8}
          minLength={8}
          placeholder="Votre matricule"
          onChange={(e) => setMatricule(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Suivant</button>
      </form>
    </>
  );
};

export default LoginComponent;

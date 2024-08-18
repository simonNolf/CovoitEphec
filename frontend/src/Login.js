import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginComponent = () => {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      toast.info('Vous êtes déjà connecté');
      setTimeout(() => {
        navigate('/Profil');
      }, 0);
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

  async function fetchCSVData() {
    const csvUrl = 'data.csv';
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
  }

  async function checkMatriculeInCSV(matriculeToCheck, csvData) {
    const rows = csvData.split('\n').map(row => row.split(';'));
    for (let i = 1; i < rows.length; i++) {
      const matriculeFromCSV = rows[i][0].trim();
      if (matriculeFromCSV === matriculeToCheck.trim()) {
        return true;
      }
    }
    return false;
  }

  async function checkMatriculeInDB(matriculeToCheck) {
    try {
      const response = await fetch(`${apiUrl}/users/${matriculeToCheck}`);
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule dans la base de données :', error);
      return false;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const csvData = await fetchCSVData();
      const matriculeExistsInCSV = await checkMatriculeInCSV(matricule, csvData);
      const matriculeExistsInDB = await checkMatriculeInDB(matricule);

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
      console.error('Erreur lors de la vérification du matricule :', error);
      toast.error('Erreur lors de la vérification du matricule. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer />
      {loading && <div>Vérification en cours...</div>}
      <form className="centered-container" onSubmit={handleSubmit}>
        <input
          id="matricule"
          required
          value={matricule}
          maxLength={8}
          minLength={8}
          placeholder="votre matricule"
          onChange={(e) => setMatricule(e.target.value)}
        />
        <button type="submit">Suivant</button>
      </form>
    </>
  );
};

export default LoginComponent;

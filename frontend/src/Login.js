import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginComponent = () => {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Utilisez useNavigate au lieu de useHistory
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const storedMatricule = sessionStorage.getItem('matricule');
    if (storedMatricule) {
      setMatricule(storedMatricule);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const matriculeFromQuery = searchParams.get('matricule');
      setMatricule(matriculeFromQuery || '');
    }
  }, [location.search]);

  async function fetchCSVData() {
    const csvUrl = 'data.csv';
    try {
      const response = await fetch(csvUrl);
      const csvData = await response.text();
      return csvData;
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
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return true;
      } else {
        console.error('Erreur lors de la récupération des données:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule dans la base de données :', error.message);
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
        navigate("/connexion");
      } else if (matriculeExistsInCSV) {
        sessionStorage.setItem('matricule', matricule);
        navigate("/inscription");
      } else {
        setErrorMessage(`Le matricule : ${matricule} n'existe pas`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule :', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <div>Vérification en cours...</div>}
      <form className="centered-container" onSubmit={handleSubmit}>
        <input
          id='matricule'
          required
          value={matricule}
          maxLength={8}
          minLength={8}
          placeholder='votre matricule'
          onChange={(e) => setMatricule(e.target.value)}
        />
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type='submit'>Suivant</button>
      </form>
    </>
  );
};

export default LoginComponent;

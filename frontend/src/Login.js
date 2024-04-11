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
    const searchParams = new URLSearchParams(location.search);
    const matriculeFromQuery = searchParams.get('matricule');
    setMatricule(matriculeFromQuery || '');
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
      // Utilisation de fetch pour effectuer une requête GET vers la route spécifique avec le matricule comme paramètre
      const response = await fetch(`${apiUrl}/users/${matriculeToCheck}`);
      // Vérification si la réponse est OK (200)
      if (response.ok) {
          // Récupération de la réponse au format JSON
          const data = await response.json();
          // Traitement des données reçues du backend
          console.log(data); // Vous pouvez remplacer cette ligne par le traitement spécifique que vous souhaitez effectuer avec les données
          return true
      } else {
          // Si la réponse n'est pas OK, affichage du message d'erreur
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
      // Supposons que checkMatriculeInDB est la fonction pour vérifier le matricule dans la base de données
      const matriculeExistsInDB = await checkMatriculeInDB(matricule);

      if (matriculeExistsInCSV && matriculeExistsInDB) {
        // Rediriger vers la page de connexion si le matricule existe dans le CSV et dans la base de données
        navigate("/connexion?matricule=" + matricule);
        console.log("Rediriger vers la page de connexion");
      } else if (matriculeExistsInCSV) {
        // Rediriger vers la page d'inscription si le matricule existe dans le CSV mais pas dans la base de données
        navigate("/inscription?matricule=" + matricule);
        console.log("Rediriger vers la page d'inscription");
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

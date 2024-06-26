import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConnexionContainer = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL; // Assurez-vous que cette variable d'environnement est définie dans votre configuration React
  const navigate = useNavigate();

  useEffect(() => {
    const storedMatricule = sessionStorage.getItem('matricule');
    if (storedMatricule) {
      setMatricule(storedMatricule);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricule,
          password,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Assigne le token au session storage
        sessionStorage.setItem('token', data.token);
        
        setBackendMessage(data.message);
        navigate("/profil");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        
        // Afficher le message d'erreur uniquement en dehors des tests
        if (process.env.NODE_ENV !== 'test') {
          console.error(errorData.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Erreur lors de la connexion :', error);
      }
      setErrorMessage('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      {loading && <div>Chargement...</div>}
      <form className="centered-container" onSubmit={handleSubmit}>
        {matricule && (
          <div>
            <label>Matricule: {matricule}</label>
          </div>
        )}
        <div>
          <label htmlFor="password">Mot de passe :</label>
          <input
            id="password"
            value={password}
            minLength={8}
            type='password'
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Se connecter</button>
      </form>
    </>
  );
};

export default ConnexionContainer;

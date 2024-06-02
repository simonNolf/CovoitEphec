import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkTokenExpiration } from './utils/tokenUtils';
import { toast } from 'react-toastify';

const ConnexionContainer = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
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
        body: JSON.stringify({ matricule, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const expirationTime = new Date().getTime() + 3600000; // 1 heure en millisecondes
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('tokenExpiration', expirationTime);
        setMatricule(matricule);
        setBackendMessage(data.message);
        navigate("/profil");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        
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

  useEffect(() => {
    const handleTokenExpiration = () => {
      toast.error('Votre session a expiré');
      navigate('/login');
    };

    if (checkTokenExpiration(handleTokenExpiration)) {
      // Le token est expiré et l'utilisateur a été redirigé
      return;
    }
  }, [navigate]);

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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkTokenExpiration } from './utils/tokenUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConnexionContainer = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [matricule, setMatricule] = useState('');
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
        toast.success(data.message || 'Connexion réussie');
        navigate("/profil");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Échec de la connexion');

        if (process.env.NODE_ENV !== 'test') {
          console.error(errorData.message);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Erreur lors de la connexion :', error);
      }
      toast.error('Erreur lors de la connexion. Veuillez réessayer.');
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
      {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Chargement...</div>}
      <form style={formStyle} onSubmit={handleSubmit}>
        {matricule && (
          <div style={{ marginBottom: '20px' }}>
            <label>Matricule: {matricule}</label>
          </div>
        )}
        <div>
          <label htmlFor="password">Mot de passe :</label>
          <input
            id="password"
            value={password}
            minLength={8}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>Se connecter</button>
      </form>
    </>
  );
};

export default ConnexionContainer;

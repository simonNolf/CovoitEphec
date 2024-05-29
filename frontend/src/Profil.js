import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Profil = () => {
    const [user, setUser] = useState(null);
    const matricule = sessionStorage.getItem('matricule');
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (matricule && token) {
            fetch(`${apiUrl}/getUser`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }, [matricule, token, apiUrl]);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const deconnexion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('matricule');
        // Rediriger vers la page de connexion après la déconnexion
        navigate('/login');
    };

    return (
        <div>
            <h1>Page de profil</h1>
            {user && user.nom && user.prenom && user.adresse ? (
                <div>
                    <p>Nom: {user.nom}</p>
                    <p>Prénom: {user.prenom}</p>
                    <p>Adresse: {user.adresse}</p>
                    <p>Matricule: {user.matricule}</p>
                    <Link to="/editProfil">
                        <button>Modifier le profil</button>
                    </Link>
                    <button onClick={deconnexion}>Déconnexion</button>
                </div>
            ) : matricule && token ? (
                <div>
                    <p>Matricule: {matricule}</p>
                    <p>Vous n'avez pas encore complété votre profil.</p>
                    <Link to="/editProfil">
                        <button>Compléter le profil</button>
                    </Link>
                </div>
            ) : (
                <div>
                    <p>Vous devez vous connecter pour accéder à cette page.</p>
                    <button onClick={handleLoginRedirect}>Se connecter</button>
                </div>
            )}
        </div>
    );
};

export default Profil;

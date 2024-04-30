import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const matricule = sessionStorage.getItem('matricule');
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        if (matricule) {
            fetch(`${apiUrl}/getUser`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': sessionStorage.getItem('token')
                },
            })
                .then(response => response.json())
                .then(data => {
                    setLoading(false);
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        console.error('Error:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            setLoading(false);
        }
    }, [matricule]);

    return (
        <div>
            <h1>Page de profil</h1>
            {loading ? (
                <p>Chargement...</p>
            ) : (
                <>
                    {user && user.nom && user.prenom && user.adresse ? (
                        <div>
                            <p>Nom: {user.nom}</p>
                            <p>Prénom: {user.prenom}</p>
                            <p>Adresse: {user.adresse}</p>
                            <p>Matricule: {user.matricule}</p>
                            <Link to="/editProfil">
                                <button>Modifier le profil</button>
                            </Link>
                        </div>
                    ) : user ? (
                        <div>
                            <p>Matricule: {matricule}</p>
                            <p>Vous n'avez pas encore complété votre profil.</p>
                            <Link to="/editProfil">
                                <button>Compléter le profil</button>
                            </Link>
                        </div>
                    ) : (
                        <p>Aucune donnée d'utilisateur trouvée.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Profil;
